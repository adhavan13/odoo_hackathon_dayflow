import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  category?: 'attendance' | 'leave' | 'payroll' | 'employee' | 'policy' | 'general';
}

interface Suggestion {
  id: string;
  label: string;
  query: string;
  category: string;
}

interface AiAssistantState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  suggestions: Suggestion[];
  isLoading: boolean;
  inputQuery: string;
  toggleOpen: () => void;
  toggleMinimize: () => void;
  setInputQuery: (query: string) => void;
  sendMessage: (customQuery?: string) => Promise<void>;
  fetchSuggestions: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const defaultSuggestions: Suggestion[] = [
  { id: 's1', label: "Today's Attendance Summary", query: "Give me a summary of employee check-ins and absences for today.", category: 'attendance' },
  { id: 's2', label: 'Pending Leave Applications', query: 'Which employees have pending leave requests waiting for approval?', category: 'leave' },
  { id: 's3', label: 'Monthly Payroll Overview', query: 'What is the current monthly payroll expenditure breakdown?', category: 'payroll' },
  { id: 's4', label: 'Employee Directory Stats', query: 'Show a breakdown of active employees by department.', category: 'employee' },
];

export const useAiAssistantStore = create<AiAssistantState>((set, get) => ({
  isOpen: false,
  isMinimized: false,
  messages: [
    {
      id: 'welcome_msg',
      sender: 'assistant',
      message: "👋 **Hello! I am your Dayflow HR AI Assistant.**\n\nHow can I help you today? You can ask me about employee records, live attendance, pending leaves, payroll, or company policies.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
    },
  ],
  suggestions: defaultSuggestions,
  isLoading: false,
  inputQuery: '',

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen, isMinimized: false })),
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
  setInputQuery: (query: string) => set({ inputQuery: query }),

  fetchSuggestions: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BACKEND_URL}/ai-assistant/suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          set({ suggestions: data.data });
        }
      }
    } catch {
      // Keep default suggestions fallback
    }
  },

  fetchHistory: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      const res = await fetch(`${BACKEND_URL}/ai-assistant/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const formatted: ChatMessage[] = data.data.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.message,
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: msg.category,
          }));
          set({ messages: formatted });
        }
      }
    } catch {
      // Ignore if offline
    }
  },

  sendMessage: async (customQuery?: string) => {
    const query = customQuery || get().inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      message: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      inputQuery: '',
      isLoading: true,
    }));

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BACKEND_URL}/ai-assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const assistantMsg: ChatMessage = {
            id: data.data.id || `a_${Date.now()}`,
            sender: 'assistant',
            message: data.data.message,
            timestamp: new Date(data.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: data.data.category,
          };
          set((state) => ({
            messages: [...state.messages, assistantMsg],
            isLoading: false,
          }));
          return;
        }
      }
    } catch {
      // Fallback response generator if server is disconnected
    }

    // Dynamic Client-side Fallback
    setTimeout(() => {
      const lower = query.toLowerCase();
      let fallbackText = "🤖 I am currently running in offline preview mode. Connect to backend MongoDB API for live workspace calculations!";
      let category: ChatMessage['category'] = 'general';

      if (lower.includes('attendance') || lower.includes('check-in')) {
        category = 'attendance';
        fallbackText = "📊 **Attendance Intelligence (Preview)**\n\n• **Workforce Present Today:** 3/3 employees (100%)\n• **Check-ins Logged:** Alex Rivera (09:00 AM), Sarah Jenkins (08:45 AM), Michael Chen (09:30 AM - Late)\n• **Absences:** 0 recorded today.";
      } else if (lower.includes('leave')) {
        category = 'leave';
        fallbackText = "🗓️ **Leave Management (Preview)**\n\n• **Pending Approvals:** 1 request\n  - *Alex Rivera*: Casual Leave (2026-08-25 to 2026-08-27, 3 days)\n• **Approved Recently:** Michael Chen (Sick Leave, 2 days)";
      } else if (lower.includes('payroll') || lower.includes('salary')) {
        category = 'payroll';
        fallbackText = "💰 **Payroll Overview (Preview)**\n\n• **Total Expenditure:** $145,200 / month\n• **Disbursed Payslips:** Alex Rivera ($9,200), Sarah Jenkins ($11,500)\n• **Status:** Active & fully audited";
      }

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        message: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category,
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isLoading: false,
      }));
    }, 600);
  },

  clearHistory: async () => {
    set({
      messages: [
        {
          id: 'welcome_msg_reset',
          sender: 'assistant',
          message: "🧹 Chat history cleared. How can I assist you next?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'general',
        },
      ],
    });
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        await fetch(`${BACKEND_URL}/ai-assistant/history`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Ignore
    }
  },
}));
