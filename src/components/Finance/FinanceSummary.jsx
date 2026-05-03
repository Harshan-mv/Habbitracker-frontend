import React from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const fmt = (n) =>
  '₹' +
  Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function FinanceSummary() {
  const getTotals = useFinanceStore((s) => s.getTotals);
  const { totalIncome, totalExpenses, remaining } = getTotals();

  const cards = [
    {
      label: 'Total Income',
      value: fmt(totalIncome),
      icon: TrendingUp,
      color: 'var(--accent-green)',
      bg: 'rgba(74,222,128,0.08)',
    },
    {
      label: 'Total Expenses',
      value: fmt(totalExpenses),
      icon: TrendingDown,
      color: 'var(--accent-red)',
      bg: 'rgba(248,113,113,0.08)',
    },
    {
      label: 'Remaining',
      value: (remaining < 0 ? '-' : '') + fmt(remaining),
      icon: Wallet,
      color: remaining >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
      bg: remaining >= 0 ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
    },
  ];

  return (
    <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="rounded-2xl p-4 flex items-center gap-3 transition-all"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: bg }}
          >
            <Icon size={18} style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>
              {label}
            </p>
            <p className="text-lg font-bold leading-tight" style={{ color }}>
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
