import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import useTaskStore from '../../store/useTaskStore';
import TaskList from './TaskList';
import TaskKanban from './TaskKanban';
import TaskFilters from './TaskFilters';

export default function TaskManager() {
  const { tasks, fetchTasks, addTask } = useTaskStore();
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'All', priority: 'All' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = () => {
    addTask({
      title: 'New Task',
      status: 'Not Started',
      priority: 'Medium',
      dueDate: new Date().toISOString()
    });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filters.status === 'All' || task.status === filters.status;
    const matchesPriority = filters.priority === 'All' || task.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    // Primary sort by date if in list view
    if (view === 'list') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return a.order - b.order;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden p-2">
      <TaskFilters 
        filters={filters} 
        setFilters={setFilters} 
        view={view} 
        setView={setView} 
        search={search}
        setSearch={setSearch}
      />

      <div className="flex-1 overflow-hidden relative">
        {view === 'list' ? (
          <TaskList tasks={filteredTasks} />
        ) : (
          <TaskKanban tasks={filteredTasks} />
        )}
      </div>

      <button 
        onClick={handleAddTask}
        className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed transition-all group font-semibold"
        style={{ 
          borderColor: 'var(--glass-border)', 
          color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-green)';
          e.currentTarget.style.color = 'var(--accent-green)';
          e.currentTarget.style.background = 'rgba(74,222,128,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        }}
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <Plus size={20} />
        </div>
        Add New Task
      </button>
    </div>
  );
}
