import { create } from 'zustand';
import api from '../utils/axiosConfig';

const useStore = create((set, get) => ({
  // ─── Auth ───────────────────────────────────────────
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    set({ user: res.data.user, token: res.data.token });
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    set({ user: res.data.user, token: res.data.token });
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

  fetchHabits: async () => {
    set({ isLoadingHabits: true });
    try {
      const res = await api.get('/habits');
      set({ habits: res.data });
    } finally {
      set({ isLoadingHabits: false });
    }
  },

  addHabit: async (name, color) => {
    const res = await api.post('/habits', { name, color });
    set((state) => ({ habits: [...state.habits, res.data] }));
  },

  updateHabit: async (id, name, color) => {
    const res = await api.put(`/habits/${id}`, { name, color });
    set((state) => ({
      habits: state.habits.map((h) => (h._id === id ? res.data : h)),
    }));
  },

  deleteHabit: async (id) => {
    await api.delete(`/habits/${id}`);
    set((state) => ({ habits: state.habits.filter((h) => h._id !== id) }));
  },

  // ─── Logs ───────────────────────────────────────────
  logs: [],
  isLoadingLogs: false,

  fetchLogs: async (startDate, endDate) => {
    set({ isLoadingLogs: true });
    try {
      const res = await api.get(`/logs?startDate=${startDate}&endDate=${endDate}`);
      set({ logs: res.data });
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  toggleLog: async (habitId, dateStr) => {
    const { logs } = get();
    const existing = logs.find((l) => l.habitId === habitId && l.date === dateStr);
    if (existing) {
      await api.delete('/logs', { data: { habitId, date: dateStr } });
      set((state) => ({
        logs: state.logs.filter((l) => !(l.habitId === habitId && l.date === dateStr)),
      }));
    } else {
      const res = await api.post('/logs', { habitId, date: dateStr });
      set((state) => ({ logs: [...state.logs, res.data] }));
    }
  },
}));

export default useStore;
