import { LayoutGrid, List, Search } from 'lucide-react';

const CONTROL_CLASS = 'min-h-10 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-primary)]';
const STATUS_FILTER_TOKENS = {
  'Not Started': ['var(--status-todo)', 'var(--status-todo-bg)'],
  'In Progress': ['var(--status-progress)', 'var(--status-progress-bg)'],
  Blocked: ['var(--status-blocked)', 'var(--status-blocked-bg)'],
  Done: ['var(--status-done)', 'var(--status-done-bg)'],
};
const PRIORITY_FILTER_TOKENS = {
  High: ['var(--priority-high)', 'var(--priority-high-bg)'],
  Medium: ['var(--priority-medium)', 'var(--priority-medium-bg)'],
  Low: ['var(--priority-low)', 'var(--priority-low-bg)'],
};

export default function TaskFilters({
  filters,
  setFilters,
  view,
  setView,
  search,
  setSearch,
  sortMode,
  setSortMode,
}) {
  const statusTokens = STATUS_FILTER_TOKENS[filters.status];
  const priorityTokens = PRIORITY_FILTER_TOKENS[filters.priority];

  return (
    <div className="grid gap-3">
      <label className="relative block min-w-0">
        <span className="sr-only">Search tasks</span>
        <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search tasks"
          className={`${CONTROL_CLASS} w-full ps-9`}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-1 flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)] sm:min-w-36">
          Status
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className={`${CONTROL_CLASS} ${statusTokens ? 'font-medium' : ''}`}
            style={statusTokens ? { color: statusTokens[0], backgroundColor: statusTokens[1], borderColor: statusTokens[0] } : undefined}
          >
            <option value="All">All statuses</option>
            <option value="Not Started">Not started</option>
            <option value="In Progress">In progress</option>
            <option value="Done">Done</option>
            <option value="Blocked">Blocked</option>
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)] sm:min-w-36">
          Priority
          <select
            value={filters.priority}
            onChange={(event) => setFilters({ ...filters, priority: event.target.value })}
            className={`${CONTROL_CLASS} ${priorityTokens ? 'font-medium' : ''}`}
            style={priorityTokens ? { color: priorityTokens[0], backgroundColor: priorityTokens[1], borderColor: priorityTokens[0] } : undefined}
          >
            <option value="All">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>

        {view === 'list' && (
          <label className="flex flex-1 flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)] sm:min-w-36">
            Sort
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              className={`${CONTROL_CLASS} border-[var(--accent)]`}
            >
              <option value="date">Due date</option>
              <option value="manual">Manual order</option>
            </select>
          </label>
        )}

        <div className="flex min-h-10 items-center gap-1 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] p-1" role="group" aria-label="Task view">
          <button
            type="button"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={`flex min-h-8 flex-1 items-center justify-center gap-2 rounded-[6px] px-3 text-sm transition-colors sm:flex-none ${view === 'list' ? 'bg-[var(--accent)] font-medium text-[var(--accent-ink)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'}`}
          >
            <List size={16} aria-hidden="true" />
            List
          </button>
          <button
            type="button"
            aria-pressed={view === 'kanban'}
            onClick={() => setView('kanban')}
            className={`flex min-h-8 flex-1 items-center justify-center gap-2 rounded-[6px] px-3 text-sm transition-colors sm:flex-none ${view === 'kanban' ? 'bg-[var(--accent)] font-medium text-[var(--accent-ink)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]'}`}
          >
            <LayoutGrid size={16} aria-hidden="true" />
            Board
          </button>
        </div>
      </div>
    </div>
  );
}
