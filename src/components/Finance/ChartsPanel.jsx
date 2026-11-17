import useFinanceStore from '../../store/useFinanceStore';

const formatAmount = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

function OutflowBreakdown({ breakdown }) {
  const entries = breakdown
    .filter((entry) => Number(entry.amount) > 0)
    .sort((a, b) => b.amount - a.amount);
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  if (!total) {
    return (
      <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--line)] px-4 py-8 text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">No outflow recorded</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Add an expense or allocation to see your breakdown</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Total outflow</p>
          <p className="mt-1 text-2xl font-medium tabular-nums" style={{ color: 'var(--section-outflow)' }}>{formatAmount(total)}</p>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{entries.length} categories</span>
      </div>
      <ul className="mt-4 space-y-4">
        {entries.map(({ key, name, amount, color }) => {
          const percentage = Math.round((amount / total) * 100);
          return (
            <li key={key}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-[var(--text-secondary)]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                  <span className="truncate">{name}</span>
                </span>
                <span className="shrink-0 tabular-nums text-[var(--text-primary)]">
                  {formatAmount(amount)} <span className="text-xs text-[var(--text-muted)]">({percentage}%)</span>
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]"
                role="progressbar"
                aria-label={`${name} share of outflow`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
              >
                <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: color }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ChartsPanel() {
  const getCategoryBreakdown = useFinanceStore((state) => state.getCategoryBreakdown);
  const breakdown = getCategoryBreakdown();

  return (
    <section
      className="app-surface finance-section-tint p-4 sm:p-5"
      style={{ '--section-accent': 'var(--section-outflow)', '--section-tint': 'var(--section-outflow-bg)' }}
      aria-labelledby="outflow-heading"
    >
      <div className="mb-4">
        <h3 id="outflow-heading" className="text-sm font-medium" style={{ color: 'var(--section-outflow)' }}>Outflow breakdown</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Expenses and planned allocations by category</p>
      </div>
      <OutflowBreakdown breakdown={breakdown} />
    </section>
  );
}
