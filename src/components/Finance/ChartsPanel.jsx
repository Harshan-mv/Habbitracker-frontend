import React, { useEffect, useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';

const CATEGORY_COLORS = {
  EMI: '#f59e0b',
  Transport: '#3b82f6',
  Food: '#ef4444',
  Health: '#10b981',
  Investment: '#8b5cf6',
  Entertainment: '#ec4899',
  'Emergency Fund': '#f97316',
  Other: '#6b7280',
  'Savings Goal': '#22c55e',
  'Emergency Fund Alloc': '#a78bfa',
};

/* ─── SVG Donut Chart ─── */
function DonutChart({ breakdown }) {
  const entries = Object.entries(breakdown).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Add expenses or allocations to see breakdown
        </p>
      </div>
    );
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex items-center gap-5">
      <svg width="150" height="150" viewBox="0 0 150 150" className="flex-shrink-0">
        {entries.map(([cat, val]) => {
          const fraction = val / total;
          const dashLen = circumference * fraction;
          const dashOffset = -circumference * cumulative;
          cumulative += fraction;
          return (
            <circle
              key={cat}
              cx="75"
              cy="75"
              r={radius}
              fill="none"
              stroke={CATEGORY_COLORS[cat] || '#6b7280'}
              strokeWidth="20"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={mounted ? dashOffset : circumference}
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1), stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)',
                transformOrigin: '75px 75px',
                transform: 'rotate(-90deg)',
              }}
            />
          );
        })}
        <text
          x="75"
          y="72"
          textAnchor="middle"
          className="text-xs font-bold"
          style={{ fill: 'var(--text-primary)', fontSize: '13px' }}
        >
          ₹{total.toLocaleString('en-IN')}
        </text>
        <text
          x="75"
          y="88"
          textAnchor="middle"
          style={{ fill: 'var(--text-muted)', fontSize: '9px' }}
        >
          Total Outflow
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {entries.map(([cat, val]) => (
          <div key={cat} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: CATEGORY_COLORS[cat] || '#6b7280' }}
            />
            <span
              className="text-xs flex-1 truncate"
              style={{ color: 'var(--text-secondary)' }}
            >
              {cat}
            </span>
            <span
              className="text-xs font-semibold flex-shrink-0"
              style={{ color: 'var(--text-primary)' }}
            >
              {((val / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Charts Panel ─── */
export default function ChartsPanel() {
  const getCategoryBreakdown = useFinanceStore((s) => s.getCategoryBreakdown);
  const breakdown = getCategoryBreakdown();

  return (
    <div className="space-y-4">
      {/* Donut */}
      <div
        className="finance-card rounded-2xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3
          className="text-xs font-bold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Outflow Breakdown
        </h3>
        <DonutChart breakdown={breakdown} />
      </div>
    </div>
  );
}
