import { getDatabase } from '../config/database';
import { config } from '../config/env.config';
import { EmployeeService } from './employee.service';
import { AttendanceService } from './attendance.service';
import { LeaveService } from './leave.service';
import { PayrollService } from './payroll.service';

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  category?: 'attendance' | 'leave' | 'payroll' | 'employee' | 'policy' | 'general';
  metadata?: Record<string, any>;
}

export class AiAssistantService {
  private static historyCollection() {
    return getDatabase().collection<ChatMessage>('ai_chat_history');
  }

  /**
   * Suggestions (empty list per user request to remove pre-defined questions)
   */
  static getSuggestions(_role: string) {
    return [];
  }

  /**
   * Fetch comprehensive workspace data from all MongoDB collections
   */
  private static async getComprehensiveWorkspaceContext() {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Ensure database seed data is populated across all services
    try {
      await EmployeeService.getAllEmployees();
      await AttendanceService.getHistory();
      await LeaveService.getLeaveRequests();
      await PayrollService.getSalarySlips();
    } catch {
      // Continue even if seed methods fail
    }

    // 1. Employees Collection
    const employees = await db.collection('employees').find({}).toArray();
    const employeeList = employees.map((e: any) => ({
      id: e.id,
      code: e.employeeCode || e.id,
      name: e.name,
      email: e.email,
      role: e.role,
      department: e.department,
      designation: e.designation,
      status: e.status,
      joinDate: e.joinDate,
      phone: e.phone,
    }));

    // 2. Users Collection (Auth)
    const users = await db.collection('users').find({}).toArray();
    const userSummary = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      companyId: u.companyId,
      status: u.status,
    }));

    // 3. Companies Collection
    const companies = await db.collection('companies').find({}).toArray();

    // 4. Attendance Collection
    const attendanceLogs = await db.collection('attendance').find({}).toArray();
    const todayAttendance = attendanceLogs.filter((log: any) => log.date === today);

    // 5. Leave Requests Collection
    const leaveRequests = await db.collection('leave_requests').find({}).toArray();

    // 6. Salary Slips & Structures Collection
    const salarySlips = await db.collection('salary_slips').find({}).toArray();
    const salaryStructures = await db.collection('salary_structures').find({}).toArray();

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        currentDate: today,
      },
      company: companies[0] || { name: 'Dayflow HRMS', code: 'DAYFLOW' },
      summary: {
        totalEmployees: employees.length,
        totalUsers: users.length,
        todayAttendanceCount: todayAttendance.length,
        presentToday: todayAttendance.filter((a: any) => a.status === 'present').length,
        lateToday: todayAttendance.filter((a: any) => a.status === 'late').length,
        absentToday: employees.length - todayAttendance.length,
        pendingLeaves: leaveRequests.filter((l: any) => l.status === 'pending').length,
        approvedLeaves: leaveRequests.filter((l: any) => l.status === 'approved').length,
        totalPayslips: salarySlips.length,
      },
      employees: employeeList,
      users: userSummary,
      attendanceLogs: {
        today: todayAttendance,
        allLogs: attendanceLogs,
      },
      leaveRequests,
      payroll: {
        salarySlips,
        salaryStructures,
      },
    };
  }

  /**
   * Process query using Groq LLM API with live MongoDB context
   */
  static async processQuery(query: string, userId: string, role: string, userName?: string): Promise<ChatMessage> {
    const lowerQuery = query.toLowerCase();
    let category: ChatMessage['category'] = 'general';

    if (lowerQuery.includes('attendance') || lowerQuery.includes('check-in') || lowerQuery.includes('late') || lowerQuery.includes('absent')) {
      category = 'attendance';
    } else if (lowerQuery.includes('leave') || lowerQuery.includes('time-off') || lowerQuery.includes('vacation')) {
      category = 'leave';
    } else if (lowerQuery.includes('payroll') || lowerQuery.includes('salary') || lowerQuery.includes('pay') || lowerQuery.includes('slip')) {
      category = 'payroll';
    } else if (lowerQuery.includes('employee') || lowerQuery.includes('staff') || lowerQuery.includes('department') || lowerQuery.includes('team')) {
      category = 'employee';
    } else if (lowerQuery.includes('policy') || lowerQuery.includes('hours') || lowerQuery.includes('rule') || lowerQuery.includes('overtime')) {
      category = 'policy';
    }

    // Save user message first
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      userId,
      sender: 'user',
      message: query,
      timestamp: new Date().toISOString(),
    };
    await this.historyCollection().insertOne(userMsg);

    let responseText = '';

    try {
      // Gather live context from MongoDB
      const contextData = await this.getComprehensiveWorkspaceContext();

      const systemPrompt = `You are Dayflow HR Assistant, an intelligent, authoritative HR Management System assistant.
You are assisting user "${userName || 'User'}" with role "${role}".

REAL-TIME MONGODB DATABASE CONTEXT:
${JSON.stringify(contextData, null, 2)}

INSTRUCTIONS:
1. Answer the user's question directly and accurately based ONLY on the live MongoDB database context provided above.
2. If asked "How many employees are there?", check contextData.summary.totalEmployees or count contextData.employees and report the exact number (e.g. "There are currently 3 registered employees in the system...").
3. Always list specific names, IDs, departments, check-in times, leave dates, or salary figures when applicable.
4. Format your response cleanly using Github Markdown (bold text, lists, tables if appropriate).
5. If the user asks a question whose data is missing in MongoDB, clearly state what records exist in MongoDB.`;

      // Call Groq API with openai/gpt-oss-120b model
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });

      if (groqResponse.ok) {
        const groqData: any = await groqResponse.json();
        const content = groqData.choices?.[0]?.message?.content;
        if (content && typeof content === 'string') {
          responseText = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }
      } else {
        console.warn('Groq API HTTP error:', groqResponse.status, await groqResponse.text());
      }
    } catch (err) {
      console.error('Groq API call error:', err);
    }

    // Fallback if Groq API call fails
    if (!responseText) {
      responseText = await this.dynamicDbFallback(query);
    }

    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_a`,
      userId,
      sender: 'assistant',
      message: responseText,
      timestamp: new Date().toISOString(),
      category,
      metadata: { role, queryTime: new Date().toISOString() },
    };

    await this.historyCollection().insertOne(assistantMsg);
    return assistantMsg;
  }

  /**
   * Direct MongoDB Dynamic Fallback Query
   */
  private static async dynamicDbFallback(query: string): Promise<string> {
    const db = getDatabase();
    const lower = query.toLowerCase();

    const employees = await db.collection('employees').find({}).toArray();
    const attendance = await db.collection('attendance').find({}).toArray();
    const leaves = await db.collection('leave_requests').find({}).toArray();
    const slips = await db.collection('salary_slips').find({}).toArray();

    if (lower.includes('employee') || lower.includes('how many')) {
      return `There are currently **${employees.length} employees** in the database:\n\n` +
        employees.map((e: any) => `• **${e.name}** (${e.designation} - ${e.department})`).join('\n');
    } else if (lower.includes('attendance') || lower.includes('check-in')) {
      return `Attendance records found: **${attendance.length} entries**:\n\n` +
        attendance.map((a: any) => `• **${a.employeeName}**: ${a.checkIn || 'Not checked in'} (${a.status})`).join('\n');
    } else if (lower.includes('leave')) {
      return `Leave requests found: **${leaves.length} entries**:\n\n` +
        leaves.map((l: any) => `• **${l.employeeName}**: ${l.type} leave (${l.status})`).join('\n');
    } else if (lower.includes('payroll') || lower.includes('salary')) {
      return `Salary slips found: **${slips.length} entries**:\n\n` +
        slips.map((s: any) => `• **${s.employeeName}**: $${s.netPay} (${s.month} ${s.year})`).join('\n');
    }

    return `Found ${employees.length} employees, ${attendance.length} attendance records, ${leaves.length} leave requests, and ${slips.length} payslips in MongoDB.`;
  }

  /**
   * Get user chat history
   */
  static async getHistory(userId: string): Promise<ChatMessage[]> {
    return this.historyCollection()
      .find({ userId })
      .sort({ timestamp: 1 })
      .toArray();
  }

  /**
   * Clear user chat history
   */
  static async clearHistory(userId: string): Promise<boolean> {
    await this.historyCollection().deleteMany({ userId });
    return true;
  }
}
