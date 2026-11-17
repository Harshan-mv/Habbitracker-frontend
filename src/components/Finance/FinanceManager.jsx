import { useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import useFinanceStore from '../../store/useFinanceStore';
import FinanceSummary from './FinanceSummary';
import IncomeSection from './IncomeSection';
import ExpenseSection from './ExpenseSection';
import ChartsPanel from './ChartsPanel';
import GoalsPanel from './GoalsPanel';
import TradingPanel from './TradingPanel';
import FinanceNoteSection from './FinanceNoteSection';
import CategoryManager from './CategoryManager';
import Skeleton from '../Skeleton';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FinanceManager() {
  const {
    currentMonth,
    prevMonth,
    nextMonth,
    fetchMonth,
    fetchGoals,
    fetchCategories,
    isLoading,
    isSaving,
    financeError,
    financeLoadError,
  } = useFinanceStore();
  const [year, month] = currentMonth.split('-').map(Number);
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  useEffect(() => {
    fetchMonth();
    fetchCategories();
  }, [fetchMonth, fetchCategories]);

  useEffect(() => {
    fetchGoals(currentMonth);
  }, [currentMonth, fetchGoals]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays size={18} className="text-[var(--text-secondary)]" aria-hidden="true" />
          <h2 className="text-lg font-medium text-[var(--text-primary)]">Finance planning</h2>
          <span className="text-xs text-[var(--text-muted)]" aria-live="polite">
            {isSaving ? 'Saving' : 'Auto-saves'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="finance-icon-btn muted border border-[var(--line)] bg-[var(--surface)]"
            aria-label="Previous month"
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <span className="min-w-32 px-3 text-center text-sm font-medium tabular-nums text-[var(--text-primary)]" aria-live="polite">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="finance-icon-btn muted border border-[var(--line)] bg-[var(--surface)]"
            aria-label="Next month"
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      {financeError && !financeLoadError && (
        <div className="status-message flex flex-wrap items-center justify-between gap-2" data-tone="error" role="alert">
          <span>{financeError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto" aria-label="Loading finance data">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height="76px" variant="rect" className="app-surface" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-4">
              <Skeleton height="250px" variant="rect" className="app-surface" />
              <Skeleton height="300px" variant="rect" className="app-surface" />
            </div>
            <div className="space-y-4">
              <Skeleton height="280px" variant="rect" className="app-surface" />
              <Skeleton height="220px" variant="rect" className="app-surface" />
              <Skeleton height="200px" variant="rect" className="app-surface" />
            </div>
          </div>
        </div>
      ) : financeLoadError ? (
        <div className="flex min-h-48 flex-1 flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--line)] px-6 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">Finance data could not be loaded</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{financeLoadError}</p>
          <button type="button" className="mt-4 min-h-10 rounded-[var(--radius-control)] bg-[var(--surface-raised)] px-4 text-sm font-medium" onClick={() => fetchMonth(currentMonth)}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <FinanceSummary />
          <div className="min-h-0 flex-1 overflow-y-auto pe-1">
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-4">
                <IncomeSection />
                <ExpenseSection />
                <CategoryManager />
                <FinanceNoteSection />
              </div>
              <div className="space-y-4">
                <ChartsPanel />
                <GoalsPanel />
                <TradingPanel />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
