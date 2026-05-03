import React, { useEffect } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import FinanceSummary from './FinanceSummary';
import IncomeSection from './IncomeSection';
import ExpenseSection from './ExpenseSection';
import ChartsPanel from './ChartsPanel';
import GoalsPanel from './GoalsPanel';
import TradingPanel from './TradingPanel';
import Skeleton from '../Skeleton';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function FinanceManager() {
  const { currentMonth, prevMonth, nextMonth, fetchMonth, isLoading } = useFinanceStore();
  const [y, m] = currentMonth.split('-').map(Number);
  const monthLabel = `${MONTH_NAMES[m - 1]} ${y}`;

  useEffect(() => {
    fetchMonth();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden p-1">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: 'var(--accent-purple)' }} />
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Financial Planner
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-primary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="text-sm font-semibold px-4 py-1.5 rounded-lg min-w-[140px] text-center"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)' }}
          >
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-primary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex-shrink-0">
        {isLoading ? (
          <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Skeleton height="72px" variant="rect" style={{ borderRadius: '16px' }} />
            <Skeleton height="72px" variant="rect" style={{ borderRadius: '16px' }} />
            <Skeleton height="72px" variant="rect" style={{ borderRadius: '16px' }} />
          </div>
        ) : (
          <FinanceSummary />
        )}
      </div>

      {/* Main Content — Two Columns */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarGutter: 'stable' }}
      >
        {isLoading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="space-y-4">
              <Skeleton height="250px" variant="rect" style={{ borderRadius: '16px' }} />
              <Skeleton height="350px" variant="rect" style={{ borderRadius: '16px' }} />
            </div>
            <div className="space-y-4">
              <Skeleton height="300px" variant="rect" style={{ borderRadius: '16px' }} />
              <Skeleton height="200px" variant="rect" style={{ borderRadius: '16px' }} />
              <Skeleton height="200px" variant="rect" style={{ borderRadius: '16px' }} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Left Column: Income + Expenses */}
            <div className="space-y-4">
              <IncomeSection />
              <ExpenseSection />
            </div>

            {/* Right Column: Charts + Goals + Trading */}
            <div className="space-y-4">
              <ChartsPanel />
              <GoalsPanel />
              <TradingPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
