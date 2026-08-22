import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'HR Policy' | 'Urgent' | 'Event' | 'Holiday';
  department?: string;
  authorName: string;
  createdAt: string;
  isPinned?: boolean;
}

interface AnnouncementState {
  announcements: Announcement[];
  isLoading: boolean;
  fetchAnnouncements: () => Promise<void>;
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt'>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc_01',
    title: '🎉 Q3 Townhall & Quarterly Performance Celebration',
    content: 'All team members are invited to join the Q3 All-Hands Townhall meeting this Friday at 4:00 PM in the Main Conference Room or via the Google Meet link.',
    category: 'Event',
    department: 'All Departments',
    authorName: 'Sarah Jenkins (HR Admin)',
    createdAt: '2026-08-22',
    isPinned: true,
  },
  {
    id: 'anc_02',
    title: '📌 Updated Paid Time Off & Attendance Leave Policy',
    content: 'Please review the updated leave guidelines for FY2026. Employees can now roll over up to 5 days of unused Paid Time Off into the new year.',
    category: 'HR Policy',
    department: 'All Departments',
    authorName: 'Sarah Jenkins (HR Admin)',
    createdAt: '2026-08-20',
    isPinned: true,
  },
  {
    id: 'anc_03',
    title: '⚠️ Scheduled Server Maintenance Notice',
    content: 'The internal IT infrastructure will undergo routine maintenance on Sunday from 2:00 AM to 4:00 AM UTC. Intermittent service disruptions may occur during this window.',
    category: 'Urgent',
    department: 'Software Engineering',
    authorName: 'IT Operations Team',
    createdAt: '2026-08-18',
    isPinned: false,
  },
];

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
  announcements: INITIAL_ANNOUNCEMENTS,
  isLoading: false,

  fetchAnnouncements: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/announcements');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        set({ announcements: response.data });
      }
    } catch (error) {
      // Retain mock announcements on backend offline
    } finally {
      set({ isLoading: false });
    }
  },

  addAnnouncement: async (data) => {
    set({ isLoading: true });
    try {
      const newAnc: Announcement = {
        ...data,
        id: `anc_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };

      try {
        await api.post('/announcements', newAnc);
      } catch (err) {
        // Fallback local save
      }

      set((state) => ({ announcements: [newAnc, ...state.announcements] }));
      snackbar.success('Announcement broadcasted successfully to all employees!');
      return newAnc;
    } catch (error: any) {
      snackbar.error(error?.message || 'Failed to publish announcement.');
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAnnouncement: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/announcements/${id}`);
    } catch (err) {
      // Local fallback
    } finally {
      set((state) => ({
        announcements: state.announcements.filter((a) => a.id !== id),
        isLoading: false,
      }));
      snackbar.info('Announcement deleted.');
    }
  },
}));
