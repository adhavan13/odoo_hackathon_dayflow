import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  designation: string;
  phone?: string;
  avatarUrl?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
}

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  fetchEmployees: () => Promise<void>;
  selectEmployee: (emp: Employee | null) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [
    {
      id: 'usr_admin_01',
      name: 'Sarah Jenkins',
      email: 'sarah.j@company.com',
      role: 'admin',
      department: 'Human Resources',
      designation: 'HR Officer / Admin',
      phone: '+1 555-0192',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'Active',
      joinDate: '2022-01-15',
    },
    {
      id: 'usr_emp_02',
      name: 'Alex Rivera',
      email: 'alex.rivera@company.com',
      role: 'employee',
      department: 'Software Engineering',
      designation: 'Senior Frontend Developer',
      phone: '+1 555-0193',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active',
      joinDate: '2023-03-01',
    },
  ],
  selectedEmployee: null,
  isLoading: false,

  fetchEmployees: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/employees');
      if (response.data) {
        set({ employees: response.data });
      }
    } catch (error) {
      // Retain mock employees on API offline
    } finally {
      set({ isLoading: false });
    }
  },

  selectEmployee: (selectedEmployee) => set({ selectedEmployee }),

  addEmployee: async (empData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/employees', empData);
      snackbar.success('Employee created successfully');
      const newEmp: Employee = response.data || { ...empData, id: `emp_${Date.now()}` };
      set((state) => ({ employees: [...state.employees, newEmp] }));
    } catch (error: any) {
      snackbar.error(error.message || 'Failed to add employee');
    } finally {
      set({ isLoading: false });
    }
  },

  updateEmployee: async (id, empData) => {
    set({ isLoading: true });
    try {
      await api.put(`/employees/${id}`, empData);
      snackbar.success('Employee updated successfully');
      set((state) => ({
        employees: state.employees.map((e) => (e.id === id ? { ...e, ...empData } : e)),
      }));
    } catch (error: any) {
      snackbar.error(error.message || 'Failed to update employee');
    } finally {
      set({ isLoading: false });
    }
  },
}));
