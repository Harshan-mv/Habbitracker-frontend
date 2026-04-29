import { create } from 'zustand';
import api from '../utils/axiosConfig';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoadingTasks: false,

  fetchTasks: async () => {
    set({ isLoadingTasks: true });
    try {
      const res = await api.get('/tasks');
      set({ tasks: res.data });
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      set({ isLoadingTasks: false });
    }
  },

  addTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      set((state) => ({ tasks: [...state.tasks, res.data] }));
    } catch (error) {
      console.error('Failed to add task', error);
    }
  },

  updateTask: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...updates } : t)),
    }));
    try {
      const res = await api.put(`/tasks/${id}`, updates);
      // Ensure backend sync
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data : t)),
      }));
    } catch (error) {
      console.error('Failed to update task', error);
      get().fetchTasks(); // rollback on error
    }
  },

  deleteTask: async (id) => {
    // Optimistic delete
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.error('Failed to delete task', error);
      get().fetchTasks(); // rollback on error
    }
  },

  reorderTasks: async (startIndex, endIndex, filters = {}) => {
    const { tasks } = get();

    // Reordering usually happens within a filtered view (e.g. sorted by Date, or filtered by Status)
    // However, the spec says "tasks can be grabbed by a handle and reordered vertically. Priority badge updates on drop."
    // Wait, the spec says "drag-and-drop reorder by this [Priority]". This implies drag and drop reordering *changes* priority? Or is it manually sorting and updating a priority?
    // Let's re-read: "Drag & Drop Priority Reordering — tasks can be grabbed by a handle and reordered vertically. Priority badge updates on drop."
    // This sounds like if I drag it to the top, it becomes High priority? Or maybe there are Kanban columns for High/Medium/Low?
    // In Kanban board, we drag between status/priority. In a list view, dragging and dropping changes its manual 'order'.
    // We will just update 'order' locally and send batch update to server.

    const newTasks = Array.from(tasks);
    const [removed] = newTasks.splice(startIndex, 1);
    newTasks.splice(endIndex, 0, removed);

    // Update 'order' property for the list based on new index to maintain sorting
    const updatedTasks = newTasks.map((t, index) => ({ ...t, order: index }));

    set({ tasks: updatedTasks });

    try {
      // Send bulk update to backend
      const updates = updatedTasks.map(t => ({ id: t._id, order: t.order }));
      await api.put('/tasks/batch', { updates });
    } catch (error) {
      console.error('Failed to batch update tasks', error);
      get().fetchTasks(); // rollback on error
    }
  }
}));

export default useTaskStore;
