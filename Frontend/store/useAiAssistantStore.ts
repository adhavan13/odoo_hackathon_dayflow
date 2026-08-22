import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
  category?: 'attendance' | 'leave' | 'payroll' | 'employee' | 'policy' | 'general';
}

interface AiAssistantState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  inputQuery: string;
  toggleOpen: () => void;
  toggleMinimize: () => void;
  setInputQuery: (query: string) => void;
  sendMessage: (customQuery?: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  clearHistory: () => Promise<void>;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const useAiAssistantStore = create<AiAssistantState>((set, get) => ({
  isOpen: false,
  isMinimized: false,
  messages: [
    {
      id: 'welcome_msg',
      sender: 'assistant',
      message: "👋 **Welcome to Dayflow HR Assistant.**\n\nI am connected to your live MongoDB workspace database. Ask me any question about employees, attendance logs, leave requests, or payroll records.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
    },
  ],
  isLoading: false,
  inputQuery: '',

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen, isMinimized: false })),
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
  setInputQuery: (query: string) => set({ inputQuery: query }),

  fetchHistory: async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/ai-assistant/history`, {
        headers: getAuthHeaders(),
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
    } catch (err) {
      console.warn('Failed to fetch AI chat history:', err);
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
      const res = await fetch(`${BACKEND_URL}/ai-assistant/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
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
            timestamp: new Date(data.data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: data.data.category,
          };
          set((state) => ({
            messages: [...state.messages, assistantMsg],
            isLoading: false,
          }));
          return;
        }
      }
    } catch (error) {
      console.error('Error sending query to AI assistant endpoint:', error);
    }

    // Error fallback if endpoint could not be reached
    const errorMsg: ChatMessage = {
      id: `a_${Date.now()}`,
      sender: 'assistant',
      message: "⚠️ Could not connect to the Dayflow Backend service. Please ensure the backend server is running on port 4000.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'general',
    };

    set((state) => ({
      messages: [...state.messages, errorMsg],
      isLoading: false,
    }));
  },

  clearHistory: async () => {
    set({
      messages: [
        {
          id: 'welcome_msg_reset',
          sender: 'assistant',
          message: "Chat history cleared. What would you like to query from MongoDB?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'general',
        },
      ],
    });
    try {
      await fetch(`${BACKEND_URL}/ai-assistant/history`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.warn('Failed to clear history:', err);
    }
  },
}));
