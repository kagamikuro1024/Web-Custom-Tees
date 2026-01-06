import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Register
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          
          localStorage.setItem('accessToken', data.data.accessToken);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Registration successful!');
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Login
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', credentials);
          
          localStorage.setItem('accessToken', data.data.accessToken);
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Login successful!');
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
          toast.success('Logged out successfully');
        }
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({
            user: data.data,
            isAuthenticated: true,
          });
          return data.data;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Check if user is admin
      isAdmin: () => {
        return get().user?.role === 'admin';
      },

      // Update user data
      setUser: (userData) => {
        set({ user: userData });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
