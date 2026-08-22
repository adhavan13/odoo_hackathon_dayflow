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

  static getSuggestions(_role: string) {
    return [];
  }

  /**
   * RAG Vector / Collection Retrieval Engine
   */
  private static async retrieveRagContext() {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Ensure database seed data is populated
    try {
      await EmployeeService.getAllEmployees();
      await AttendanceService.getHistory();
      await LeaveService.getLeaveRequests();
      await PayrollService.getSalarySlips();
    } catch {
      // Continue
    }

    const [employees, users, companies, attendanceLogs, leaveRequests, salarySlips, salaryStructures] = await Promise.all([
      db.collection('employees').find({}).toArray(),
      db.collection('users').find({}).toArray(),
      db.collection('companies').find({}).toArray(),
      db.collection('attendance').find({}).toArray(),
      db.collection('leave_requests').find({}).toArray(),
      db.collection('salary_slips').find({}).toArray(),
      db.collection('salary_structures').find({}).toArray(),
    ]);

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

    const todayAttendance = attendanceLogs.filter((log: any) => log.date === today);

    return {
      portalMetadata: {
        dateToday: today,
        companyName: companies[0]?.name || 'Dayflow HRMS',
      },
      workforceSummary: {
        totalEmployees: employees.length,
        totalUsers: users.length,
        todayAttendanceCount: todayAttendance.length,
        presentToday: todayAttendance.filter((a: any) => a.status === 'present').length,
        lateToday: todayAttendance.filter((a: any) => a.status === 'late').length,
        pendingLeavesCount: leaveRequests.filter((l: any) => l.status === 'pending').length,
        approvedLeavesCount: leaveRequests.filter((l: any) => l.status === 'approved').length,
        totalPayslipsCount: salarySlips.length,
      },
      employees: employeeList,
      users: users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
      todayAttendance,
      allAttendanceLogs: attendanceLogs,
      leaveRequests,
      payroll: {
        salarySlips,
        salaryStructures,
      },
    };
  }

  /**
   * Process query using RAG + Groq API with Anti-Hallucination rules
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

    // Save user message
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
      const ragContext = await this.retrieveRagContext();

      const systemPrompt = `You are Dayflow HR Assistant, the dedicated enterprise RAG assistant for Dayflow HRMS. You are assisting "${userName || 'User'}" (${role}).

RETRIEVED ENTERPRISE DATABASE CONTEXT:
${JSON.stringify(ragContext, null, 2)}

STRICT RAG & ANTI-HALLUCINATION INSTRUCTIONS:
1. IDENTITY & IDENTITY BOUNDARIES:
   - You are exclusively "Dayflow HR Assistant", an enterprise HR knowledge engine.
   - NEVER claim to be GPT-4, OpenAI, Llama, Claude, Groq, or any generic LLM model.
   - If asked "What model are you using?", "Who built you?", or similar questions about your underlying AI architecture, ALWAYS respond:
     "I am Dayflow HR Assistant, your enterprise HR Knowledge Base assistant for Dayflow HRMS."

2. FACTUAL STRICTNESS & ANTI-HALLUCINATION:
   - Base all answers STRICTLY on the retrieved enterprise database context above.
   - NEVER fabricate employee names, salary amounts, attendance times, or leave dates.
   - If the user asks about records or details not present in the database, clearly state:
     "I do not find records matching that request in the active HR database."

3. FORMATTING REQUIREMENTS:
   - Format all responses using standard GitHub Markdown.
   - When presenting lists of employees, attendance logs, or salary slips, format them using crisp Markdown tables (\`| Header 1 | Header 2 |\`) or bulleted lists with bold field names.
   - Keep answers clean, concise, structured, and easy to read.`;

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
          temperature: 0.1,
          max_tokens: 1200,
        }),
      });

      if (groqResponse.ok) {
        const groqData: any = await groqResponse.json();
        const content = groqData.choices?.[0]?.message?.content;
        if (content && typeof content === 'string') {
          responseText = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }
      }
    } catch (err) {
      console.error('RAG Groq execution error:', err);
    }

    if (!responseText) {
      responseText = await this.strictRagFallback(query);
    }

    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_a`,
      userId,
      sender: 'assistant',
      message: responseText,
      timestamp: new Date().toISOString(),
      category,
      metadata: { role, processedAt: new Date().toISOString() },
    };

    await this.historyCollection().insertOne(assistantMsg);
    return assistantMsg;
  }

  /**
   * Factual Fallback Engine
   */
  private static async strictRagFallback(query: string): Promise<string> {
    const db = getDatabase();
    const lower = query.toLowerCase();

    if (lower.includes('model') || lower.includes('gpt') || lower.includes('version')) {
      return "I am **Dayflow HR Assistant**, your enterprise HR Knowledge Base assistant for Dayflow HRMS.";
    }

    const employees = await db.collection('employees').find({}).toArray();
    if (lower.includes('employee') || lower.includes('how many')) {
      return `There are **${employees.length} active employees** recorded in the database:\n\n` +
        `| Code | Name | Department | Designation |\n|---|---|---|---|\n` +
        employees.map((e: any) => `| \`${e.employeeCode || e.id}\` | ${e.name} | ${e.department} | ${e.designation} |`).join('\n');
    }

    return "I am Dayflow HR Assistant. I can help you search active employee profiles, attendance logs, leave applications, or salary slips.";
  }

  static async getHistory(userId: string): Promise<ChatMessage[]> {
    return this.historyCollection()
      .find({ userId })
      .sort({ timestamp: 1 })
      .toArray();
  }

  static async clearHistory(userId: string): Promise<boolean> {
    await this.historyCollection().deleteMany({ userId });
    return true;
  }
}
