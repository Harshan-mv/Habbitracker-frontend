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

  const tabConfig = [
    { key: 'habits', label: 'Habits', color: '#4ade80', glow: 'rgba(74,222,128,0.25)' },
    { key: 'tasks', label: 'To Do', color: '#60a5fa', glow: 'rgba(96,165,250,0.25)' },
    { key: 'finance', label: 'Finances', color: '#a78bfa', glow: 'rgba(167,139,250,0.25)' },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Glass Top Nav ── */}
      <header
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              boxShadow: '0 0 16px rgba(74,222,128,0.4)',
            }}
          >
            ✓
          </div>
          <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Habit Tracker</span>
        </div>

        {/* Glass Tab Navigation */}
        <nav
          className="flex items-center p-1.5 rounded-2xl mx-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-6 py-2.5 rounded-xl text-base font-bold transition-all duration-300"
              style={{
                backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeTab === tab.key ? tab.color : 'var(--text-muted)',
                border: activeTab === tab.key ? `1px solid ${tab.color}40` : '1px solid transparent',
                boxShadow: activeTab === tab.key ? `0 0 20px ${tab.glow}, inset 0 1px 0 rgba(255,255,255,0.06)` : 'none',
                backdropFilter: activeTab === tab.key ? 'blur(8px)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-lg transition-all duration-200"
            style={{
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--glass-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(239,68,68,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex overflow-hidden p-4 md:p-6">
        <div
          className="flex-1 rounded-2xl overflow-hidden p-4 md:p-6"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur-strong))',
            WebkitBackdropFilter: 'blur(var(--glass-blur-strong))',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow), var(--glass-inset-shadow)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {activeTab === 'habits' ? (
            <div
              className="flex flex-row w-full overflow-auto h-full"
              style={{ alignItems: 'flex-start' }}
            >
              {/* LEFT – Habit names */}
              <div
                className="flex-shrink-0 px-4 pt-3 pb-0"
                style={{ borderRight: '1px solid var(--glass-border)', minWidth: '190px', maxWidth: '220px' }}
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
                style={{ borderLeft: '1px solid var(--glass-border)', minWidth: '185px', maxWidth: '220px' }}
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
      <footer
        className="px-6 py-2 text-center flex-shrink-0"
        style={{
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Habit Tracker — Build better habits, one day at a time.
        </span>
      </footer>
    </div>
  );
}
