import React from 'react';
import { Filter, List, LayoutGrid, Search } from 'lucide-react';
import { clsx } from 'clsx';

export default function TaskFilters({ 
  filters, 
  setFilters, 
  view, 
  setView, 
  search, 
  setSearch 
}) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-2xl">
          <input 
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-12 py-4 rounded-2xl border text-lg outline-none transition-all focus:border-accent-green focus:shadow-lg focus:scale-[1.01]"
            style={{ 
              background: 'var(--bg-secondary)', 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
          />
          <Search size={22} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="flex items-center gap-6">
          {/* Status & Priority Filters */}
          <div className="flex items-center gap-4 bg-hover p-2 rounded-2xl border border-border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)' }}>
            <div className="flex flex-col px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted mb-0.5" style={{ color: 'var(--text-muted)' }}>Status</span>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer hover:text-accent-green transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <option value="All">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
            
            <div className="w-[1px] h-8 bg-border" style={{ background: 'var(--border)' }} />

            <div className="flex flex-col px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted mb-0.5" style={{ color: 'var(--text-muted)' }}>Priority</span>
              <select 
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer hover:text-accent-green transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-hover p-1.5 rounded-2xl border border-border" style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)' }}>
            <button 
              onClick={() => setView('list')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm",
                view === 'list' ? "bg-white dark:bg-gray-700 shadow-md text-primary" : "text-muted hover:text-secondary"
              )}
              style={{ 
                backgroundColor: view === 'list' ? 'var(--bg-secondary)' : 'transparent',
                color: view === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: view === 'list' ? '1px solid var(--border)' : '1px solid transparent'
              }}
            >
              <List size={20} />
              <span>List</span>
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm",
                view === 'kanban' ? "bg-white dark:bg-gray-700 shadow-md text-primary" : "text-muted hover:text-secondary"
              )}
              style={{ 
                backgroundColor: view === 'kanban' ? 'var(--bg-secondary)' : 'transparent',
                color: view === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: view === 'kanban' ? '1px solid var(--border)' : '1px solid transparent'
              }}
            >
              <LayoutGrid size={20} />
              <span>Board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
