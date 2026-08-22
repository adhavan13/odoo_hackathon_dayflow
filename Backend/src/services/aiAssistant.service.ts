import { getDatabase } from '../config/database';
import { config } from '../config/env.config';

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
   * Quick suggestions based on user role
   */
  static getSuggestions(role: 'HR' | 'EMPLOYEE' | string) {
    if (role === 'HR' || role === 'admin') {
      return [
        {
          id: 'sugg-1',
          label: "Today's Attendance Summary",
          query: "Give me a summary of employee check-ins and absences for today.",
          category: 'attendance',
        },
        {
          id: 'sugg-2',
          label: 'Pending Leave Applications',
          query: 'Which employees have pending leave requests waiting for approval?',
          category: 'leave',
        },
        {
          id: 'sugg-3',
          label: 'Monthly Payroll Overview',
          query: 'What is the current monthly payroll expenditure breakdown?',
          category: 'payroll',
        },
        {
          id: 'sugg-4',
          label: 'Employee Directory Stats',
          query: 'Show a breakdown of active employees by department.',
          category: 'employee',
        },
      ];
    }

    return [
      {
        id: 'sugg-emp-1',
        label: 'My Leave Balance',
        query: 'What is my remaining paid, sick, and casual leave balance?',
        category: 'leave',
      },
      {
        id: 'sugg-emp-2',
        label: "Today's Check-in Status",
        query: 'Did I check in today and how many hours have I logged?',
        category: 'attendance',
      },
      {
        id: 'sugg-emp-3',
        label: 'Latest Salary Slip',
        query: 'Show details of my latest generated salary slip.',
        category: 'payroll',
      },
      {
        id: 'sugg-emp-4',
        label: 'Company Time-off Policy',
        query: 'What is the company policy regarding sick leaves and holidays?',
        category: 'policy',
      },
    ];
  }

  /**
   * Fetch live workspace context from MongoDB collections
   */
  private static async getWorkspaceContext() {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // 1. Employees
    const employees = await db.collection('employees').find({}).toArray();
    const employeeSummary = employees.map((e: any) => ({
      id: e.id,
      code: e.employeeCode || e.id,
      name: e.name,
      email: e.email,
      department: e.department,
      designation: e.designation,
      status: e.status,
    }));

    // 2. Attendance
    const attendanceLogs = await db.collection('attendance').find({}).toArray();
    const todayLogs = attendanceLogs.filter((log: any) => log.date === today);

    // 3. Leave Requests
    const leaveRequests = await db.collection('leave_requests').find({}).toArray();

    // 4. Salary Slips
    const salarySlips = await db.collection('salary_slips').find({}).toArray();

    return {
      todayDate: today,
      totalEmployees: employees.length,
      employees: employeeSummary,
      todayAttendance: todayLogs,
      allAttendanceCount: attendanceLogs.length,
      leaveRequests,
      salarySlips,
      companyPolicies: {
        workingHours: '09:00 AM - 05:30 PM (Mon-Fri)',
        gracePeriodMinutes: 15,
        leaveQuota: '18 Paid Leaves, 12 Casual Leaves, 10 Sick Leaves annually',
        payrollCycle: 'Last working day of each month',
      },
    };
  }

  /**
   * Process query using Groq LLM API with live MongoDB context
   */
  static async processQuery(query: string, userId: string, role: string, userName?: string): Promise<ChatMessage> {
    const lowerQuery = query.toLowerCase();
    let category: ChatMessage['category'] = 'general';

    if (lowerQuery.includes('attendance') || lowerQuery.includes('check-in') || lowerQuery.includes('late')) {
      category = 'attendance';
    } else if (lowerQuery.includes('leave') || lowerQuery.includes('time-off') || lowerQuery.includes('vacation')) {
      category = 'leave';
    } else if (lowerQuery.includes('payroll') || lowerQuery.includes('salary') || lowerQuery.includes('pay')) {
      category = 'payroll';
    } else if (lowerQuery.includes('employee') || lowerQuery.includes('staff') || lowerQuery.includes('department')) {
      category = 'employee';
    } else if (lowerQuery.includes('policy') || lowerQuery.includes('hours') || lowerQuery.includes('rule')) {
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
      const contextData = await this.getWorkspaceContext();

      const systemPrompt = `You are Dayflow HR AI, an intelligent, professional HR Management System Assistant (similar to Keka HR).
You are assisting an user named "${userName || 'User'}" with role "${role}".

REAL-TIME WORKSPACE DATA FROM MONGODB DATABASE:
${JSON.stringify(contextData, null, 2)}

INSTRUCTIONS:
1. Answer the user's question accurately using the live MongoDB workspace data provided above.
2. Format your response cleanly using GitHub Markdown (use bold text, lists, bullet points, and emojis).
3. If asked about attendance, leave requests, payroll, or employees, cite precise numbers, names, and statuses from the database.
4. Maintain a helpful, professional, and friendly tone.`;

      // Call Groq API via fetch
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
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      if (groqResponse.ok) {
        const groqData: any = await groqResponse.json();
        const content = groqData.choices?.[0]?.message?.content;
        if (content && typeof content === 'string') {
          // Clean up reasoning blocks if any
          responseText = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }
      }
    } catch (err) {
      console.error('Groq API Error, falling back to local context solver:', err);
    }

    // Fallback if Groq response is empty
    if (!responseText) {
      responseText = await this.fallbackContextSolver(query, userName);
    }

    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_a`,
      userId,
      sender: 'assistant',
      message: responseText,
      timestamp: new Date().toISOString(),
      category,
      metadata: { role, processedWith: 'groq-gpt-oss-120b' },
    };

    await this.historyCollection().insertOne(assistantMsg);
    return assistantMsg;
  }

  /**
   * Fallback solver in case Groq API is unreachable
   */
  private static async fallbackContextSolver(query: string, userName?: string): Promise<string> {
    const db = getDatabase();
    const lowerQuery = query.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    if (lowerQuery.includes('attendance') || lowerQuery.includes('check-in')) {
      const logs = await db.collection('attendance').find({}).toArray();
      const todayLogs = logs.filter((log: any) => log.date === today);
      return `📊 **Attendance Report (${today})**\n\n` +
        `• **Active Records Today:** ${todayLogs.length}\n` +
        `• **Present Employees:** ${todayLogs.filter((l: any) => l.status === 'present').length}\n\n` +
        (todayLogs.length > 0
          ? todayLogs.map((l: any) => `- **${l.employeeName}**: Check-in at ${l.checkIn || 'N/A'}`).join('\n')
          : 'No check-ins logged for today yet.');
    } else if (lowerQuery.includes('leave')) {
      const leaves = await db.collection('leave_requests').find({}).toArray();
      const pending = leaves.filter((l: any) => l.status === 'pending');
      return `🗓️ **Leave Management Overview**\n\n` +
        `• **Pending Approvals:** ${pending.length}\n` +
        (pending.length > 0
          ? pending.map((l: any) => `- **${l.employeeName}**: ${l.days} days (${l.type})`).join('\n')
          : '🎉 No pending leave requests.');
    }

    return `🤖 **Hello ${userName || 'User'}! I am your Dayflow HR AI Assistant.**\n\nHow can I help you today? Ask me about attendance, leave requests, payroll, or employees!`;
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
