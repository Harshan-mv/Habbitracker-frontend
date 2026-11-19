import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarCheck, Check, ChevronDown, ListChecks, LogOut, Moon, Sun, Wallet } from 'lucide-react';
import useStore from '../store/useStore';
import useToastStore from '../store/useToastStore';
import useClickOutside from '../hooks/useClickOutside';
import GoogleIdentityButton from '../components/GoogleIdentityButton';
import { formatDate, getLast12Days } from '../utils/streakLogic';
import HabitList from '../components/HabitList';
import HeatmapGrid from '../components/HeatmapGrid';
import StatPanel from '../components/StatPanel';
import TaskManager from '../components/Tasks/TaskManager';
import FinanceManager from '../components/Finance/FinanceManager';

const TABS = [
  { key: 'habits', label: 'Habits', icon: CalendarCheck },
  { key: 'tasks', label: 'To Do', icon: ListChecks },
  { key: 'finance', label: 'Finance', icon: Wallet },
];

export default function Dashboard() {
  const { user, logout, theme, toggleTheme, linkGoogle, fetchHabits, fetchLogs, weekOffset, habitsError, logsError } = useStore();
  const userMenuRef = useRef(null);
  const userMenuTriggerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('habits');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [googleLinkLoading, setGoogleLinkLoading] = useState(false);

  const closeUserMenu = useCallback(() => setUserMenuOpen(false), []);
  useClickOutside(userMenuRef, closeUserMenu, userMenuOpen);

  const handleGoogleLink = async (credential) => {
    closeUserMenu();
    userMenuTriggerRef.current?.focus();
    setGoogleLinkLoading(true);
    try {
      await linkGoogle(credential);
    } finally {
      setGoogleLinkLoading(false);
    }
  };

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeUserMenu();
      userMenuTriggerRef.current?.focus();
    };

    if (!userMenuOpen) return undefined;
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeUserMenu, userMenuOpen]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    const days = getLast12Days(weekOffset);
    fetchLogs(formatDate(days[0]), formatDate(days[days.length - 1]));
  }, [fetchLogs, weekOffset]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--page)]">
      <header className="border-b border-[var(--line)] bg-[var(--page)]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <a href="/" className="inline-flex items-center gap-2.5 text-[var(--text-primary)] no-underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--accent)] text-[var(--accent-ink)]">
              <Check size={17} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold">Habit Tracker</span>
          </a>

          <nav aria-label="Main sections" className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-2 md:w-auto">
            {TABS.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    setActiveTab(key);
                    closeUserMenu();
                  }}
                  className={`flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] px-3 text-sm transition-colors md:flex-none md:px-4 ${active ? 'bg-[var(--surface-raised)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'}`}
                >
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="order-2 flex items-center gap-2 md:order-3">
            <div ref={userMenuRef} className="relative">
              <button
                ref={userMenuTriggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-controls="account-menu"
                className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] px-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)] [&::-webkit-details-marker]:hidden"
                aria-label={`User menu for ${user?.name || 'account'}`}
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <span className="max-w-28 truncate">{user?.name || 'Account'}</span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              <div
                id="account-menu"
                role="menu"
                aria-label="Account options"
                hidden={!userMenuOpen}
                className="absolute end-0 top-[calc(100%+8px)] z-30 w-56 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-2 shadow-[var(--shadow-raised)]"
              >
                <p role="none" className="truncate px-3 py-2 text-xs text-[var(--text-muted)]">{user?.email || user?.name || 'Your account'}</p>
                {!user?.googleLinked && (
                  <div role="group" aria-label="Link Google account" className="border-b border-[var(--line)] px-1 pb-2">
                    <p role="none" className="px-2 py-1 text-xs font-medium text-[var(--text-muted)]">Link Google account</p>
                    <GoogleIdentityButton
                      onCredential={handleGoogleLink}
                      onError={() => useToastStore.getState().addToast('Google sign-in failed. Please try again.', 'error')}
                      theme={theme}
                      loading={googleLinkLoading}
                      label="Link Google"
                    />
                  </div>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    toggleTheme();
                    closeUserMenu();
                    userMenuTriggerRef.current?.focus();
                  }}
                  className="flex min-h-10 w-full items-center gap-2 rounded-[var(--radius-control)] px-3 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
                >
                  {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
                  Switch to {theme === 'dark' ? 'light' : 'dark'} mode
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeUserMenu();
                    logout();
                  }}
                  className="flex min-h-10 w-full items-center gap-2 rounded-[var(--radius-control)] px-3 text-left text-sm text-[var(--negative)] hover:bg-[var(--surface-raised)]"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 px-3 py-4 md:px-6 md:py-6">
        <section className="app-panel flex min-h-[min(760px,calc(100vh-140px))] w-full min-w-0 flex-col overflow-hidden p-3 md:p-5" aria-label={`${activeTab} workspace`}>
          {activeTab === 'habits' ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              {(habitsError || logsError) && (
                <div className="status-message flex flex-wrap items-center justify-between gap-2" data-tone="error" role="alert">
                  <span>{habitsError || logsError}</span>
                  <button
                    type="button"
                    className="rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--surface)]"
                    onClick={() => {
                      fetchHabits();
                      const days = getLast12Days(weekOffset);
                      fetchLogs(formatDate(days[0]), formatDate(days[days.length - 1]));
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-auto">
                <div className="flex h-full min-w-[980px] items-start">
                  <div className="w-[200px] shrink-0 border-e border-[var(--line)] px-3 pt-2">
                    <HabitList />
                  </div>
                  <div className="min-w-[590px] flex-1 px-3 pt-2">
                    <HeatmapGrid />
                  </div>
                  <div className="w-[200px] shrink-0 border-s border-[var(--line)] pt-2">
                    <StatPanel />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'tasks' ? (
            <TaskManager />
          ) : (
            <FinanceManager />
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--line)] px-4 py-2 text-center text-xs text-[var(--text-muted)]">
        Habit Tracker · Routines, tasks, and monthly plans
      </footer>
    </div>
  );
}
