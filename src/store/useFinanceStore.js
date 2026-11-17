import { create } from 'zustand';
import api, { createIdempotencyKey } from '../utils/axiosConfig';
import useToastStore from './useToastStore';

const CATEGORIES = ['EMI', 'Transport', 'Food', 'Health', 'Investment', 'Entertainment', 'Emergency Fund', 'Other'];
const INCOME_TYPES = ['Salary', 'Business', 'Investment', 'Other'];
const CATEGORY_COLORS = {
  EMI: '#b89253',
  Transport: '#5d8a9b',
  Food: '#789b68',
  Health: '#9a7187',
  Investment: '#6580a5',
  Entertainment: '#a17855',
  'Emergency Fund': '#668b80',
  Other: '#85858a',
  Salary: '#789b68',
  Business: '#6580a5',
  'Savings Goal': '#9ebf86',
  'Emergency Fund Alloc': '#83a9c8',
};

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
  savingsTarget: 0,
  savingsAchieved: 0,
  emergencyFund: 0,
  emergencyAchieved: 0,
  emergencyTarget: 100000,
  emiMonthsLeft: 0,
  emiTotalMonths: 0,
  carryForward: 0,
  prevSavingsAchieved: 0,
  prevEmergencyAchieved: 0,
  note: '',
});

const uid = () => Math.random().toString(36).slice(2, 9);

const useFinanceStore = create((set, get) => {
  const currentMonthKey = getMonthKey();

  return {
    CATEGORIES,
    INCOME_TYPES,
    customGoals: [],
    customCategories: [],
    isLoadingGoals: false,
    isLoadingCategories: false,
    goalsError: null,
    categoriesError: null,
    currentMonth: currentMonthKey,
    monthData: defaultMonthData(),
    isLoading: false,
    isSaving: false,
    financeError: null,
    financeLoadError: null,

    // ── Fetch month from backend ──────────────────────────
    fetchMonth: async (monthKey) => {
      const key = monthKey || get().currentMonth;
      set({ isLoading: true, financeError: null, financeLoadError: null });
      try {
        const res = await api.get(`/finance/${key}`);
        set({ currentMonth: key, monthData: res.data, isLoading: false, financeLoadError: null });
      } catch (error) {
        const message = error.response?.data?.error || 'Could not load this month’s finance data. Try again.';
        set({ isLoading: false, financeError: message, financeLoadError: message });
        useToastStore.getState().addToast(message, 'error');
      }
    },

    fetchGoals: async (monthKey = get().currentMonth) => {
      set({ isLoadingGoals: true, goalsError: null, customGoals: [] });
      try {
        const res = await api.get(`/finance/goals?month=${monthKey}`);
        set({ customGoals: res.data, isLoadingGoals: false });
      } catch (error) {
        const message = error.response?.data?.error || 'Could not load custom goals. Try again.';
        set({ isLoadingGoals: false, goalsError: message });
        useToastStore.getState().addToast(message, 'error');
      }
    },

    addGoal: async (goalData) => {
      try {
        const res = await api.post('/finance/goals', {
          ...goalData,
          month: get().currentMonth,
        }, { headers: { 'Idempotency-Key': createIdempotencyKey() } });
        set((state) => ({ customGoals: [...state.customGoals, res.data], goalsError: null }));
        useToastStore.getState().addToast('Goal added');
        return res.data;
      } catch (error) {
        const message = error.response?.data?.error || 'Could not add this goal.';
        set({ goalsError: message });
        useToastStore.getState().addToast(message, 'error');
        throw error;
      }
    },

    updateGoal: async (id, updates) => {
      const previousGoals = get().customGoals;
      const previousGoal = previousGoals.find((goal) => goal._id === id);
      if (!previousGoal) return;

      set((state) => ({
        customGoals: state.customGoals.map((goal) => (
          goal._id === id ? { ...goal, ...updates } : goal
        )),
        goalsError: null,
      }));
      try {
        const res = await api.put(`/finance/goals/${id}`, updates, {
          headers: { 'Idempotency-Key': createIdempotencyKey() },
        });
        set((state) => ({
          customGoals: state.customGoals.map((goal) => (
            goal._id === id ? { ...goal, ...res.data } : goal
          )),
        }));
        useToastStore.getState().addToast('Goal updated');
      } catch (error) {
        const message = error.response?.data?.error || 'Could not save this goal.';
        set({ customGoals: previousGoals, goalsError: message });
        useToastStore.getState().addToast(message, 'error');
        throw error;
      }
    },

    deleteGoal: async (id) => {
      const previousGoals = get().customGoals;
      set((state) => ({
        customGoals: state.customGoals.filter((goal) => goal._id !== id),
        goalsError: null,
      }));
      try {
        await api.delete(`/finance/goals/${id}`, {
          headers: { 'Idempotency-Key': createIdempotencyKey() },
        });
        useToastStore.getState().addToast('Goal deleted');
      } catch (error) {
        const message = error.response?.data?.error || 'Could not delete this goal.';
        set({ customGoals: previousGoals, goalsError: message });
        useToastStore.getState().addToast(message, 'error');
        throw error;
      }
    },

    setGoalAllocation: async (id, amount) => {
      const previousGoals = get().customGoals;
      const previousGoal = previousGoals.find((goal) => goal._id === id);
      if (!previousGoal) return;
      const delta = amount - (previousGoal.monthAllocation || 0);
      set((state) => ({
        customGoals: state.customGoals.map((goal) => (
          goal._id === id
            ? {
              ...goal,
              monthAllocation: amount,
              savedTotal: Math.max(0, (goal.savedTotal || 0) + delta),
              status: Math.max(0, (goal.savedTotal || 0) + delta) >= goal.targetAmount ? 'completed' : (
                goal.status === 'completed' ? 'active' : goal.status
              ),
            }
            : goal
        )),
        goalsError: null,
      }));
      try {
        const res = await api.put(
          `/finance/goals/${id}/allocations/${get().currentMonth}`,
          { amount },
          { headers: { 'Idempotency-Key': createIdempotencyKey() } },
        );
        set((state) => ({
          customGoals: state.customGoals.map((goal) => (
            goal._id === id ? { ...goal, ...res.data } : goal
          )),
        }));
      } catch (error) {
        const message = error.response?.data?.error || 'Could not save this month’s allocation.';
        set({ customGoals: previousGoals, goalsError: message });
        useToastStore.getState().addToast(message, 'error');
        throw error;
      }
    },

    fetchCategories: async () => {
      set({ isLoadingCategories: true, categoriesError: null });
      try {
        const res = await api.get('/finance/categories');
        set({ customCategories: res.data, isLoadingCategories: false });
      } catch (error) {
        const message = error.response?.data?.error || 'Could not load custom categories.';
        set({ isLoadingCategories: false, categoriesError: message });
        useToastStore.getState().addToast(message, 'error');
      }
    },

    addCategory: async (categoryData) => {
      try {
        const res = await api.post('/finance/categories', categoryData);
        set((state) => ({ customCategories: [...state.customCategories, res.data], categoriesError: null }));
        useToastStore.getState().addToast('Category added');
        return res.data;
      } catch (error) {
        const message = error.response?.data?.error || 'Could not add this category.';
        set({ categoriesError: message });
        useToastStore.getState().addToast(message, 'error');
        throw error;
      }
    },

    deleteCategory: async (id) => {
      const previousCategories = get().customCategories;
      set((state) => ({
        customCategories: state.customCategories.filter((category) => category._id !== id),
        categoriesError: null,
      }));
      try {
        await api.delete(`/finance/categories/${id}`);
        useToastStore.getState().addToast('Category deleted');
      } catch (error) {
        const message = error.response?.data?.error || 'Could not delete this category.';
        set({ customCategories: previousCategories, categoriesError: message });
        useToastStore.getState().addToast(message, 'error');
        throw error;
      }
    },

    getCategoryOptions: (kind) => {
      const builtins = (kind === 'expense' ? CATEGORIES : INCOME_TYPES).map((name) => ({
        name,
        color: CATEGORY_COLORS[name] || '#85858a',
        isCustom: false,
      }));
      const custom = get().customCategories
        .filter((category) => category.kind === kind)
        .map((category) => ({ ...category, isCustom: true }));
      return [...builtins, ...custom];
    },

    // ── Save current month to backend ─────────────────────
    _save: async () => {
      const { currentMonth, monthData } = get();
      set({ isSaving: true });
      try {
        const res = await api.put(`/finance/${currentMonth}`, monthData, {
          headers: { 'Idempotency-Key': createIdempotencyKey() },
        });
        if (monthData.note && res.data.note !== monthData.note) {
          set({ financeError: 'The current finance API does not save monthly notes. Other finance changes may still be saved.' });
        } else {
          set({ financeError: null });
        }
      } catch (error) {
        const message = error.response?.data?.error || 'Could not save your finance changes. Try again.';
        set({ financeError: message });
        useToastStore.getState().addToast(message, 'error');
      } finally {
        set({ isSaving: false });
      }
    },

    _update: (updater) => {
      set((state) => {
        const newData = updater(state.monthData);
        return { monthData: newData };
      });
      set({ isSaving: true });
      clearTimeout(get()._saveTimer);
      const timer = setTimeout(() => {
        if (get()._saveTimer !== timer) return;
        set({ _saveTimer: null });
        get()._save();
      }, 400);
      set({ _saveTimer: timer });
    },

    _saveTimer: null,

    _flushPendingSave: async () => {
      const timer = get()._saveTimer;
      if (!timer) return;
      clearTimeout(timer);
      set({ _saveTimer: null });
      await get()._save();
    },

    // ── Month navigation ──────────────────────────────────
    setMonth: async (monthKey) => {
      await get()._flushPendingSave();
      await get().fetchMonth(monthKey);
    },

    prevMonth: () => {
      const { currentMonth } = get();
      const [y, m] = currentMonth.split('-').map(Number);
      const d = new Date(y, m - 2, 1);
      get().setMonth(getMonthKey(d));
    },

    nextMonth: () => {
      const { currentMonth } = get();
      const [y, m] = currentMonth.split('-').map(Number);
      const d = new Date(y, m, 1);
      get().setMonth(getMonthKey(d));
    },

    // ── Income ────────────────────────────────────────────
    addIncome: (name, amount, sourceType = '') => {
      get()._update((d) => ({
        ...d,
        incomes: [...d.incomes, { _id: uid(), name, amount: Number(amount), sourceType }],
      }));
    },

    updateIncome: (id, name, amount, sourceType = '') => {
      get()._update((d) => ({
        ...d,
        incomes: d.incomes.map((i) =>
          (i._id || i.id) === id ? { ...i, name, amount: Number(amount), sourceType } : i
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

    // ── Notes ─────────────────────────────────────────────
    updateNote: (note) => {
      get()._update((d) => ({ ...d, note }));
    },

    // ── Goals ─────────────────────────────────────────────
    updateGoals: (fields) => {
      // Convert string values to numbers
      const numFields = {};
      for (const [k, v] of Object.entries(fields)) {
        numFields[k] = Number(v);
      }
      get()._update((d) => {
        const newData = { ...d, ...numFields };
        
        // Recalculate totals dynamically
        if ('savingsGoal' in numFields) {
          newData.savingsAchieved = (newData.prevSavingsAchieved || 0) + newData.savingsGoal;
        }
        if ('emergencyFund' in numFields) {
          newData.emergencyAchieved = (newData.prevEmergencyAchieved || 0) + newData.emergencyFund;
        }
        
        return newData;
      });
    },

    addToGoal: (type, amount) => {
      const amt = Number(amount);
      if (type === 'savings') {
        get()._update((d) => {
          const newGoal = (d.savingsGoal || 0) + amt;
          return {
            ...d,
            savingsGoal: newGoal,
            savingsAchieved: (d.prevSavingsAchieved || 0) + newGoal,
          };
        });
      } else if (type === 'emergency') {
        get()._update((d) => {
          const newGoal = (d.emergencyFund || 0) + amt;
          return {
            ...d,
            emergencyFund: newGoal,
            emergencyAchieved: (d.prevEmergencyAchieved || 0) + newGoal,
          };
        });
      }
    },

    resetGoal: (type) => {
      if (type === 'savings') {
        get()._update((d) => ({ ...d, prevSavingsAchieved: 0, savingsAchieved: d.savingsGoal || 0 }));
      } else if (type === 'emergency') {
        get()._update((d) => ({ ...d, prevEmergencyAchieved: 0, emergencyAchieved: d.emergencyFund || 0 }));
      }
    },

    // ── Computed ──────────────────────────────────────────
    getTotals: () => {
      const { monthData } = get();
      
      const incomesTotal = monthData.incomes.reduce((s, i) => s + i.amount, 0);
      const expensesTotal = monthData.expenses.reduce((s, e) => s + e.amount, 0);
      
      const totalIncome = incomesTotal + (monthData.carryForward || 0);
      const totalExpenses = expensesTotal;
      
      const customAllocated = get().customGoals
        .filter((goal) => ['active', 'completed'].includes(goal.status))
        .reduce((sum, goal) => sum + (Number(goal.monthAllocation) || 0), 0);
      const totalAllocated = (monthData.savingsGoal || 0) + (monthData.emergencyFund || 0) + customAllocated;
      const remaining = totalIncome - totalExpenses - totalAllocated;

      return { totalIncome, totalExpenses, totalAllocated, remaining };
    },

    getCategoryBreakdown: () => {
      const { monthData } = get();
      const map = {};
      const categoryOptions = get().getCategoryOptions('expense');
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
      const entries = Object.entries(map).map(([name, amount]) => ({
        key: `category:${name}`,
        name,
        amount,
        color: name === 'Savings Goal' || name === 'Emergency Fund Alloc'
          ? CATEGORY_COLORS[name]
          : categoryOptions.find((category) => category.name === name)?.color || CATEGORY_COLORS.Other,
      }));
      for (const goal of get().customGoals) {
        if (
          ['active', 'completed'].includes(goal.status)
          && Number(goal.monthAllocation) > 0
        ) {
          entries.push({
            key: `goal:${goal._id}`,
            name: goal.name,
            amount: Number(goal.monthAllocation),
            color: goal.color,
          });
        }
      }
      return entries;
    },

    getTradingCapital: () => {
      const { monthData } = get();
      return monthData.expenses
        .filter((e) => e.category === 'Investment')
        .reduce((s, e) => s + e.amount, 0);
    },


  };
});

export default useFinanceStore;
