import { create } from 'zustand';
import api, { createIdempotencyKey } from '../utils/axiosConfig';
import useToastStore from './useToastStore';

const requestMessage = (error, fallback) => error.response?.data?.error || error.response?.data?.message || fallback;

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoadingTasks: false,
  taskError: null,
  taskLoadError: null,

  fetchTasks: async () => {
    set({ isLoadingTasks: true, taskError: null, taskLoadError: null });
    try {
      const res = await api.get('/tasks');
      set({ tasks: res.data, taskLoadError: null });
    } catch (error) {
      const message = requestMessage(error, 'Could not load tasks. Try again.');
      set({ taskError: message, taskLoadError: message });
      useToastStore.getState().addToast(message, 'error');
    } finally {
      set({ isLoadingTasks: false });
    }
  },

  addTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData, {
        headers: { 'Idempotency-Key': createIdempotencyKey() },
      });
      set((state) => ({ tasks: [...state.tasks, res.data], taskError: null }));
      useToastStore.getState().addToast('Task added');
      return res.data;
    } catch (error) {
      const message = requestMessage(error, 'Could not add this task.');
      set({ taskError: message });
      useToastStore.getState().addToast(message, 'error');
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    const previousTask = get().tasks.find((task) => task._id === id);
    if (!previousTask) return;

    set((state) => ({
      tasks: state.tasks.map((task) => (task._id === id ? { ...task, ...updates } : task)),
      taskError: null,
    }));

    try {
      const res = await api.put(`/tasks/${id}`, updates);
      set((state) => ({
        tasks: state.tasks.map((task) => (task._id === id ? res.data : task)),
      }));
      return res.data;
    } catch (error) {
      const message = requestMessage(error, 'Could not save this task change.');
      set((state) => ({
        tasks: state.tasks.map((task) => (task._id === id ? previousTask : task)),
        taskError: message,
      }));
      useToastStore.getState().addToast(message, 'error');
    }
  },

  deleteTask: async (id) => {
    const previousTasks = get().tasks;
    const removedTask = previousTasks.find((task) => task._id === id);
    set((state) => ({ tasks: state.tasks.filter((task) => task._id !== id), taskError: null }));

    try {
      await api.delete(`/tasks/${id}`);
      useToastStore.getState().addToast('Task deleted');
    } catch (error) {
      const message = requestMessage(error, 'Could not delete this task.');
      set({ tasks: previousTasks, taskError: message });
      useToastStore.getState().addToast(message, 'error');
      if (!removedTask) throw error;
    }
  },

  reorderTasks: async (sourceIndex, destinationIndex, visibleTasks) => {
    if (!visibleTasks || sourceIndex === destinationIndex) return;

    const previousTasks = get().tasks;
    const reorderedVisible = Array.from(visibleTasks);
    const [moved] = reorderedVisible.splice(sourceIndex, 1);
    reorderedVisible.splice(destinationIndex, 0, moved);

    const visibleIds = new Set(reorderedVisible.map((task) => task._id));
    const orderedTasks = [...previousTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const slots = orderedTasks.flatMap((task, index) => (visibleIds.has(task._id) ? [index] : []));
    slots.forEach((slot, index) => {
      orderedTasks[slot] = reorderedVisible[index];
    });

    const updatedTasks = orderedTasks.map((task, order) => ({ ...task, order }));
    set({ tasks: updatedTasks, taskError: null });

    try {
      const updates = updatedTasks.map((task) => ({ id: task._id, order: task.order }));
      await api.put('/tasks/batch', { updates });
      useToastStore.getState().addToast('Task order saved');
    } catch (error) {
      const message = requestMessage(error, 'Could not save the new task order.');
      set({ tasks: previousTasks, taskError: message });
      useToastStore.getState().addToast(message, 'error');
    }
  },
}));

export default useTaskStore;
