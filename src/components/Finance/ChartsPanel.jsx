import React, { useEffect, useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';

const CATEGORY_COLORS = {
  EMI: '#f59e0b',
  Transport: '#3b82f6',
  Food: '#ef4444',
  Health: '#10b981',
  Trading: '#8b5cf6',
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

/* ─── SVG Bar Chart (6-month cashflow) ─── */
function CashflowChart({ history }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-28">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Loading cashflow data...</p>
      </div>
    );
  }

  const maxVal = Math.max(...history.map((m) => Math.abs(m.savings)), 1);
  const barW = 28;
  const chartH = 100;
  const gap = 14;
  const totalW = history.length * (barW + gap) - gap;

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      <svg
        width={totalW + 40}
        height={chartH + 36}
        viewBox={`0 0 ${totalW + 40} ${chartH + 36}`}
        className="mx-auto"
      >
        {/* zero line */}
        <line
          x1="20"
          y1={chartH / 2 + 4}
          x2={totalW + 20}
          y2={chartH / 2 + 4}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        {history.map((m, i) => {
          const x = 20 + i * (barW + gap);
          const normalizedH = (Math.abs(m.savings) / maxVal) * (chartH / 2 - 4);
          const isPositive = m.savings >= 0;
          const barColor = isPositive ? 'var(--accent-green)' : 'var(--accent-red)';
          const y = isPositive ? chartH / 2 + 4 - normalizedH : chartH / 2 + 4;
          return (
            <g key={i}>
              <rect
                x={x}
                y={isPositive ? (mounted ? y : chartH / 2 + 4) : chartH / 2 + 4}
                width={barW}
                height={mounted ? normalizedH : 0}
                rx="4"
                fill={barColor}
                opacity="0.85"
                style={{ transition: 'all 0.6s cubic-bezier(.4,0,.2,1)' }}
              />
              <text
                x={x + barW / 2}
                y={chartH + 18}
                textAnchor="middle"
                style={{ fill: 'var(--text-muted)', fontSize: '9px' }}
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Charts Panel ─── */
export default function ChartsPanel() {
  const getCategoryBreakdown = useFinanceStore((s) => s.getCategoryBreakdown);
  const getCashflowHistory = useFinanceStore((s) => s.getCashflowHistory);
  const [history, setHistory] = useState([]);

  const breakdown = getCategoryBreakdown();

  useEffect(() => {
    getCashflowHistory().then(setHistory);
  }, []);

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

      {/* Bar */}
      <div
        className="finance-card rounded-2xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h3
          className="text-xs font-bold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          6-Month Cashflow
        </h3>
        <CashflowChart history={history} />
      </div>
    </div>
  );
}
