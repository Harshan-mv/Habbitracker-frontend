import { create } from 'zustand';
import api from '../utils/axiosConfig';

const CATEGORIES = ['EMI', 'Transport', 'Food', 'Health', 'Investment', 'Entertainment', 'Emergency Fund', 'Other'];

const getMonthKey = (date) => {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const defaultMonthData = () => ({
  incomes: [],
  expenses: [],
  realizedPnL: 0,
  charges: 0,
  savingsGoal: 0,
  savingsAchieved: 0,
  emergencyFund: 0,
  emergencyAchieved: 0,
  emergencyTarget: 100000,
  emiMonthsLeft: 0,
  emiTotalMonths: 0,
  carryForward: 0,
});

const uid = () => Math.random().toString(36).slice(2, 9);

const useFinanceStore = create((set, get) => {
  const currentMonthKey = getMonthKey();

  return {
    CATEGORIES,
    currentMonth: currentMonthKey,
    monthData: defaultMonthData(),
    isLoading: false,

    // ── Fetch month from backend ──────────────────────────
    fetchMonth: async (monthKey) => {
      const key = monthKey || get().currentMonth;
      set({ isLoading: true });
      try {
        const res = await api.get(`/finance/${key}`);
        set({ currentMonth: key, monthData: res.data, isLoading: false });
      } catch (error) {
        console.error('Failed to fetch finance data', error);
        set({ isLoading: false });
      }
    },

    // ── Save current month to backend ─────────────────────
    _save: async () => {
      const { currentMonth, monthData } = get();
      try {
        await api.put(`/finance/${currentMonth}`, monthData);
      } catch (error) {
        console.error('Failed to save finance data', error);
      }
    },

    _update: (updater) => {
      set((state) => {
        const newData = updater(state.monthData);
        return { monthData: newData };
      });
      // Debounced save to backend
      clearTimeout(get()._saveTimer);
      const timer = setTimeout(() => get()._save(), 400);
      set({ _saveTimer: timer });
    },

    _saveTimer: null,

    // ── Month navigation ──────────────────────────────────
    setMonth: (monthKey) => {
      get().fetchMonth(monthKey);
    },

    prevMonth: () => {
      const { currentMonth } = get();
      const [y, m] = currentMonth.split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      get().fetchMonth(getMonthKey(d));
    },

    nextMonth: () => {
      const { currentMonth } = get();
      const [y, m] = currentMonth.split('-').map(Number);
      const d = new Date(y, m, 1);
      get().fetchMonth(getMonthKey(d));
    },

    // ── Income ────────────────────────────────────────────
    addIncome: (name, amount) => {
      get()._update((d) => ({
        ...d,
        incomes: [...d.incomes, { _id: uid(), name, amount: Number(amount) }],
      }));
    },

    updateIncome: (id, name, amount) => {
      get()._update((d) => ({
        ...d,
        incomes: d.incomes.map((i) =>
          (i._id || i.id) === id ? { ...i, name, amount: Number(amount) } : i
        ),
      }));
    },

    deleteIncome: (id) => {
      get()._update((d) => ({
        ...d,
        incomes: d.incomes.filter((i) => (i._id || i.id) !== id),
      }));
    },

    // ── Expenses ──────────────────────────────────────────
    addExpense: (name, amount, category) => {
      get()._update((d) => ({
        ...d,
        expenses: [...d.expenses, { _id: uid(), name, amount: Number(amount), category }],
      }));
    },

    updateExpense: (id, name, amount, category) => {
      get()._update((d) => ({
        ...d,
        expenses: d.expenses.map((e) =>
          (e._id || e.id) === id ? { ...e, name, amount: Number(amount), category } : e
        ),
      }));
    },

    deleteExpense: (id) => {
      get()._update((d) => ({
        ...d,
        expenses: d.expenses.filter((e) => (e._id || e.id) !== id),
      }));
    },

    // ── Trading ───────────────────────────────────────────
    updateTrading: (field, value) => {
      get()._update((d) => ({ ...d, [field]: Number(value) }));
    },

    // ── Goals ─────────────────────────────────────────────
    updateGoals: (fields) => {
      // Convert string values to numbers
      const numFields = {};
      for (const [k, v] of Object.entries(fields)) {
        numFields[k] = Number(v);
      }
      get()._update((d) => ({ ...d, ...numFields }));
    },

    // ── Computed ──────────────────────────────────────────
    getTotals: () => {
      const { monthData } = get();
      const totalIncome = monthData.incomes.reduce((s, i) => s + i.amount, 0) + (monthData.carryForward || 0);
      const totalExpenses = monthData.expenses.reduce((s, e) => s + e.amount, 0);
      const totalAllocated = (monthData.savingsGoal || 0) + (monthData.emergencyFund || 0);
      const remaining = totalIncome - totalExpenses - totalAllocated;
      return { totalIncome, totalExpenses, totalAllocated, remaining };
    },

    getCategoryBreakdown: () => {
      const { monthData } = get();
      const map = {};
      // Include expenses
      for (const e of monthData.expenses) {
        map[e.category] = (map[e.category] || 0) + e.amount;
      }
      // Include savings goal and emergency fund as allocations in the chart
      if (monthData.savingsGoal > 0) {
        map['Savings Goal'] = (map['Savings Goal'] || 0) + monthData.savingsGoal;
      }
      if (monthData.emergencyFund > 0) {
        map['Emergency Fund Alloc'] = (map['Emergency Fund Alloc'] || 0) + monthData.emergencyFund;
      }
      return map;
    },

    getTradingCapital: () => {
      const { monthData } = get();
      return monthData.expenses
        .filter((e) => e.category === 'Investment')
        .reduce((s, e) => s + e.amount, 0);
    },

    // 6-month cashflow history from backend
    getCashflowHistory: async () => {
      try {
        const res = await api.get('/finance/history/6');
        return res.data.map((m) => ({
          label: new Date(m.month + '-01').toLocaleString('default', { month: 'short' }),
          savings: m.savings,
          income: m.income,
          expenses: m.expenses,
        }));
      } catch {
        return [];
      }
    },
  };
});

export default useFinanceStore;
