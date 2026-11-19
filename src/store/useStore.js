import { create } from 'zustand';
import api from '../utils/axiosConfig';
import useToastStore from './useToastStore';

const persistSession = (session, set) => {
  localStorage.setItem('token', session.token);
  localStorage.setItem('user', JSON.stringify(session.user));
  set({ user: session.user, token: session.token });
};

const useStore = create((set, get) => ({
  // ─── Auth ───────────────────────────────────────────
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    persistSession(res.data, set);
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    persistSession(res.data, set);
  },

  googleLogin: async (credential) => {
    const res = await api.post('/auth/google', { credential });
    persistSession(res.data, set);
  },

  linkGoogle: async (credential) => {
    try {
      const res = await api.post('/auth/google/link', { credential });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      set({ user: res.data.user });
      useToastStore.getState().addToast('Google account linked');
      return true;
    } catch (error) {
      useToastStore.getState().addToast(
        error.response?.data?.message || 'Could not link this Google account. Please try again.',
        'error',
      );
      return false;
    }
  },

  requestPasswordReset: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  verifyPasswordResetCode: async (email, code) => {
    const res = await api.post('/auth/verify-otp', { email, code });
    return res.data.resetToken;
  },

  resetPassword: async (email, resetToken, password) => {
    const res = await api.post('/auth/reset-password', { email, resetToken, password });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, habits: [], logs: [] });
  },

  // ─── Theme ──────────────────────────────────────────
  theme: localStorage.getItem('theme') || 'dark',

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    set({ theme: next });
  },

  // ─── Calendar offset ────────────────────────────────
  weekOffset: 0,
  setWeekOffset: (offset) => set({ weekOffset: offset }),

  // ─── Habits ─────────────────────────────────────────
  habits: [],
  isLoadingHabits: false,
  habitsError: null,

  fetchHabits: async () => {
    set({ isLoadingHabits: true, habitsError: null });
    try {
      const res = await api.get('/habits');
      set({ habits: res.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Could not load habits. Try again.';
      set({ habitsError: message });
      useToastStore.getState().addToast(message, 'error');
    } finally {
      set({ isLoadingHabits: false });
    }
  },

  addHabit: async (name, color) => {
    try {
      const res = await api.post('/habits', { name, color });
      set((state) => ({ habits: [...state.habits, res.data] }));
      useToastStore.getState().addToast('Habit added');
    } catch (error) {
      useToastStore.getState().addToast(error.response?.data?.message || 'Could not add this habit.', 'error');
      throw error;
    }
  },

  updateHabit: async (id, name, color) => {
    try {
      const res = await api.put(`/habits/${id}`, { name, color });
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? res.data : h)),
      }));
      useToastStore.getState().addToast('Habit updated');
    } catch (error) {
      useToastStore.getState().addToast(error.response?.data?.message || 'Could not update this habit.', 'error');
      throw error;
    }
  },

  deleteHabit: async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      set((state) => ({ habits: state.habits.filter((h) => h._id !== id) }));
      useToastStore.getState().addToast('Habit removed');
    } catch (error) {
      useToastStore.getState().addToast(error.response?.data?.message || 'Could not remove this habit.', 'error');
      throw error;
    }
  },

  // ─── Logs ───────────────────────────────────────────
  logs: [],
  isLoadingLogs: false,
  logsError: null,

  fetchLogs: async (startDate, endDate) => {
    set({ isLoadingLogs: true, logsError: null });
    try {
      const res = await api.get(`/logs?startDate=${startDate}&endDate=${endDate}`);
      set({ logs: res.data });
    } catch (error) {
      const message = error.response?.data?.message || 'Could not load habit history. Try again.';
      set({ logsError: message });
      useToastStore.getState().addToast(message, 'error');
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  toggleLog: async (habitId, dateStr) => {
    const { logs } = get();
    const existing = logs.find((l) => l.habitId === habitId && l.date === dateStr);
    if (existing) {
      set((state) => ({
        logs: state.logs.filter((l) => !(l.habitId === habitId && l.date === dateStr)),
      }));
      try {
        await api.delete('/logs', { data: { habitId, date: dateStr } });
        useToastStore.getState().addToast('Habit marked incomplete');
      } catch (error) {
        set({ logs });
        useToastStore.getState().addToast(error.response?.data?.message || 'Could not update this day.', 'error');
      }
    } else {
      const optimisticLog = { _id: `pending-${habitId}-${dateStr}`, habitId, date: dateStr };
      set((state) => ({ logs: [...state.logs, optimisticLog] }));
      try {
        const res = await api.post('/logs', { habitId, date: dateStr });
        set((state) => ({
          logs: state.logs.map((log) => (log._id === optimisticLog._id ? res.data : log)),
        }));
        useToastStore.getState().addToast('Habit marked complete');
      } catch (error) {
        set((state) => ({
          logs: state.logs.filter((log) => log._id !== optimisticLog._id),
        }));
        useToastStore.getState().addToast(error.response?.data?.message || 'Could not mark this habit complete.', 'error');
      }
    }
  },
}));

export default useStore;
