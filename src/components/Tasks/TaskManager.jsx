import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import useTaskStore from '../../store/useTaskStore';
import TaskList from './TaskList';
import TaskKanban from './TaskKanban';
import TaskFilters from './TaskFilters';

export default function TaskManager() {
  const { tasks, fetchTasks, addTask, taskError, taskLoadError, isLoadingTasks } = useTaskStore();
  const [view, setView] = useState('list');
  const [sortMode, setSortMode] = useState('date');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'All', priority: 'All' });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [budget, setBudget] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = useMemo(() => tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filters.status === 'All' || task.status === filters.status;
      const matchesPriority = filters.priority === 'All' || task.priority === filters.priority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (view === 'list' && sortMode === 'date') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB || (a.order ?? 0) - (b.order ?? 0);
      }
      return (a.order ?? 0) - (b.order ?? 0);
    }), [tasks, search, filters, view, sortMode]);
  const totalBudget = filteredTasks.reduce((sum, task) => sum + (Number(task.budget?.amount) || 0), 0);
  const currency = tasks.find((task) => task.budget?.currency)?.budget.currency || '₹';

  const handleAddTask = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      setFormError('Add a task title before saving.');
      return;
    }

    setFormError('');
    setSaving(true);
    try {
      await addTask({
        title: title.trim(),
        status: 'Not Started',
        priority: 'Medium',
        ...(dueDate ? { dueDate: new Date(`${dueDate}T12:00:00`).toISOString() } : {}),
        budget: { amount: Number(budget) || 0, currency: '₹' },
      });
      setTitle('');
      setDueDate('');
      setBudget('');
      setShowForm(false);
    } catch (error) {
      setFormError(error.response?.data?.error || 'The task could not be saved. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <TaskFilters
        filters={filters}
        setFilters={setFilters}
        view={view}
        setView={setView}
        search={search}
        setSearch={setSearch}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />

      {taskError && (
        <div className="status-message flex flex-wrap items-center justify-between gap-2" data-tone="error" role="alert">
          <span>{taskError}</span>
          <button type="button" className="px-3 py-1.5 text-sm font-medium hover:bg-[var(--surface)]" onClick={fetchTasks}>
            Try again
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddTask} className="app-surface grid gap-3 p-4 sm:grid-cols-[minmax(180px,1fr)_160px_140px_auto_auto] sm:items-end">
          <div className="sm:col-span-1">
            <label htmlFor="new-task-title" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Task title</label>
            <input
              id="new-task-title"
              autoFocus
              required
              maxLength={160}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="finance-input w-full"
              placeholder="What needs doing?"
            />
          </div>
          <div>
            <label htmlFor="new-task-due-date" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Due date</label>
            <input id="new-task-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="finance-input w-full" />
          </div>
          <div>
            <label htmlFor="new-task-budget" className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">Budget</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">₹</span>
              <input id="new-task-budget" type="number" min="0" step="1" value={budget} onChange={(event) => setBudget(event.target.value)} className="finance-input w-full" placeholder="0" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="min-h-9 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-ink)] disabled:opacity-60">
            {saving ? 'Saving' : 'Save task'}
          </button>
          <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} className="finance-icon-btn muted justify-self-end" aria-label="Cancel adding task">
            <X size={17} aria-hidden="true" />
          </button>
          {formError && <p className="text-sm text-[var(--negative)] sm:col-span-full" role="alert">{formError}</p>}
        </form>
      )}

      <div className="relative min-h-0 flex-1">
        {view === 'list' ? (
          <TaskList
            tasks={filteredTasks}
            sortMode={sortMode}
            onReorder={() => setSortMode('manual')}
            isLoading={isLoadingTasks}
            hasError={Boolean(taskLoadError)}
            hasFilters={Boolean(search || filters.status !== 'All' || filters.priority !== 'All')}
          />
        ) : (
          <TaskKanban tasks={filteredTasks} isLoading={isLoadingTasks} />
        )}
      </div>

      {!isLoadingTasks && !taskLoadError && (
        <div className="flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <span className="text-sm text-[var(--text-secondary)]">Budget in this view</span>
          <span className="font-medium tabular-nums text-[var(--text-primary)]">
            {currency}{totalBudget.toLocaleString('en-IN')}
          </span>
        </div>
      )}

      {!showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-[var(--line)] bg-[var(--surface)] text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--text-primary)]"
        >
          <Plus size={17} aria-hidden="true" />
          Add task
        </button>
      )}
    </div>
  );
}
