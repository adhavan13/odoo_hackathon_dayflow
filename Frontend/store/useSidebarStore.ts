import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  openGroups: string[];
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
  toggleGroup: (groupTitle: string) => void;
  expandGroup: (groupTitle: string) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  openGroups: ['Dashboard', 'Attendance', 'Leave Management', 'Payroll & Salary', 'My Profile', 'Leave & Time-Off'],

  toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
  toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),

  toggleGroup: (groupTitle) =>
    set((state) => {
      const exists = state.openGroups.includes(groupTitle);
      return {
        openGroups: exists
          ? state.openGroups.filter((g) => g !== groupTitle)
          : [...state.openGroups, groupTitle],
      };
    }),

  expandGroup: (groupTitle) =>
    set((state) => ({
      openGroups: state.openGroups.includes(groupTitle)
        ? state.openGroups
        : [...state.openGroups, groupTitle],
    })),
}));
