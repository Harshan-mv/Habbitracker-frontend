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
        {/* Search Bar – Glass */}
        <div className="relative flex-1 max-w-2xl">
          <input 
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-6 pr-12 py-4 rounded-2xl border text-lg outline-none transition-all focus:scale-[1.01]"
            style={{ 
              background: 'rgba(255,255,255,0.04)', 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderColor: 'var(--glass-border)', 
              color: 'var(--text-primary)',
              boxShadow: 'var(--glass-shadow), var(--glass-inset-shadow)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-green)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(74,222,128,0.15), var(--glass-inset-shadow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow), var(--glass-inset-shadow)';
            }}
          />
          <Search size={22} className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="flex items-center gap-6">
          {/* Status & Priority Filters – Glass */}
          <div
            className="flex items-center gap-4 p-2 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-inset-shadow)',
            }}
          >
            <div className="flex flex-col px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Status</span>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <option value="All">All Status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
            
            <div className="w-[1px] h-8" style={{ background: 'var(--glass-border)' }} />

            <div className="flex flex-col px-3">
              <span className="text-[10px] uppercase font-bold tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Priority</span>
              <select 
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="bg-transparent border-none text-sm font-bold outline-none cursor-pointer transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <option value="All">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* View Toggle – Glass */}
          <div
            className="flex items-center p-1.5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm"
              style={{ 
                backgroundColor: view === 'list' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: view === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: view === 'list' ? '1px solid var(--glass-border)' : '1px solid transparent',
                boxShadow: view === 'list' ? 'var(--glass-inset-shadow)' : 'none',
              }}
            >
              <List size={20} />
              <span>List</span>
            </button>
            <button 
              onClick={() => setView('kanban')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm"
              style={{ 
                backgroundColor: view === 'kanban' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: view === 'kanban' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: view === 'kanban' ? '1px solid var(--glass-border)' : '1px solid transparent',
                boxShadow: view === 'kanban' ? 'var(--glass-inset-shadow)' : 'none',
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
