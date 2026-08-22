import { create } from 'zustand';
import { api } from '@/utils/api';
import { snackbar } from '@/utils/snackbar';
import { generateLoginId, generateTemporaryPassword } from '@/utils/idGenerator';

export interface Employee {
  id: string;
  loginId: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  designation: string;
  phone?: string;
  avatarUrl?: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joinDate: string;
  temporaryPassword?: string;
}

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  fetchEmployees: () => Promise<void>;
  selectEmployee: (emp: Employee | null) => void;
  addEmployee: (empData: Omit<Employee, 'id' | 'loginId'> & { firstName?: string; lastName?: string }) => Promise<Employee>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [
    {
      id: 'usr_admin_01',
      loginId: 'OISAJE20220001',
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
      loginId: 'OIALRI20230002',
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

  addEmployee: async (empInput) => {
    set({ isLoading: true });
    try {
      const nameParts = empInput.name.trim().split(' ');
      const firstName = empInput.firstName || nameParts[0] || 'Emp';
      const lastName = empInput.lastName || nameParts.slice(1).join(' ') || 'User';

      const joinYear = new Date(empInput.joinDate || Date.now()).getFullYear();
      const serialNum = get().employees.length + 1;

      const generatedId = generateLoginId(firstName, lastName, joinYear, serialNum);
      const tempPass = generateTemporaryPassword();

      const newEmp: Employee = {
        ...empInput,
        id: `emp_${Date.now()}`,
        loginId: generatedId,
        temporaryPassword: tempPass,
      };

      try {
        await api.post('/employees', newEmp);
      } catch (e) {
        // Fallback for offline mode
      }

      set((state) => ({ employees: [...state.employees, newEmp] }));
      snackbar.success(`Created employee: Login ID ${generatedId}`);
      return newEmp;
    } catch (error: any) {
      snackbar.error(error.message || 'Failed to add employee');
      throw error;
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
