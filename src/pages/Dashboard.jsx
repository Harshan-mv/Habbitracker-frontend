import { useEffect } from 'react';
import { Sun, Moon, LogOut, Activity } from 'lucide-react';
import useStore from '../store/useStore';
import { formatDate, getLast12Days } from '../utils/streakLogic';
import HabitList from '../components/HabitList';
import HeatmapGrid from '../components/HeatmapGrid';
import StatPanel from '../components/StatPanel';
import TaskManager from '../components/Tasks/TaskManager';
import FinanceManager from '../components/Finance/FinanceManager';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout, theme, toggleTheme, fetchHabits, fetchLogs, weekOffset } = useStore();
  const [activeTab, setActiveTab] = useState('habits');

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    const days = getLast12Days(weekOffset);
    const startDate = formatDate(days[0]);
    const endDate = formatDate(days[days.length - 1]);
    fetchLogs(startDate, endDate);
  }, [weekOffset]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* ── Top Nav ── */}
      <header
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold text-sm"
            style={{ background: 'var(--accent-green)' }}
          >
            ✓
          </div>
          <span className="text-base font-semibold tracking-tight">Habit Tracker</span>
        </div>

        <nav className="flex items-center bg-hover p-1.5 rounded-2xl mx-6" style={{ background: 'var(--bg-hover)' }}>
          <button 
            onClick={() => setActiveTab('habits')}
            className={`px-6 py-2.5 rounded-xl text-base font-bold transition-all ${activeTab === 'habits' ? 'bg-white dark:bg-gray-700 shadow-lg text-primary' : 'text-muted hover:text-secondary'}`}
            style={{ 
              backgroundColor: activeTab === 'habits' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'habits' ? 'var(--accent-green)' : 'var(--text-muted)',
              border: activeTab === 'habits' ? '1px solid var(--accent-green)' : '1px solid transparent'
            }}
          >
            Habits
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-6 py-2.5 rounded-xl text-base font-bold transition-all ${activeTab === 'tasks' ? 'bg-white dark:bg-gray-700 shadow-lg text-primary' : 'text-muted hover:text-secondary'}`}
            style={{ 
              backgroundColor: activeTab === 'tasks' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'tasks' ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: activeTab === 'tasks' ? '1px solid var(--accent-blue)' : '1px solid transparent'
            }}
          >
            To Do
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`px-6 py-2.5 rounded-xl text-base font-bold transition-all ${activeTab === 'finance' ? 'bg-white dark:bg-gray-700 shadow-lg text-primary' : 'text-muted hover:text-secondary'}`}
            style={{ 
              backgroundColor: activeTab === 'finance' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'finance' ? 'var(--accent-purple)' : 'var(--text-muted)',
              border: activeTab === 'finance' ? '1px solid var(--accent-purple)' : '1px solid transparent'
            }}
          >
            Finance
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex overflow-hidden p-4 md:p-6">
        <div
          className="flex-1 rounded-2xl overflow-hidden p-4 md:p-6"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}
        >
          {activeTab === 'habits' ? (
            <div
              className="flex flex-row w-full overflow-auto h-full"
              style={{ alignItems: 'flex-start' }}
            >
              {/* LEFT – Habit names */}
              <div
                className="flex-shrink-0 px-4 pt-3 pb-0"
                style={{ borderRight: '1px solid var(--border)', minWidth: '190px', maxWidth: '220px' }}
              >
                <HabitList />
              </div>

              {/* CENTER – Heatmap */}
              <div className="flex-1 px-2 pt-3 pb-0 min-w-0 h-full">
                <HeatmapGrid />
              </div>

              {/* RIGHT – Stats */}
              <div
                className="flex-shrink-0 pt-3 pb-0"
                style={{ borderLeft: '1px solid var(--border)', minWidth: '185px', maxWidth: '220px' }}
              >
                <StatPanel />
              </div>
            </div>
          ) : activeTab === 'tasks' ? (
            <TaskManager />
          ) : (
            <FinanceManager />
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 py-2 text-center flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Habit Tracker — Build better habits, one day at a time.
        </span>
      </footer>
    </div>
  );
}
