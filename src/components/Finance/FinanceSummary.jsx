import useFinanceStore from '../../store/useFinanceStore';

const formatAmount = (value) => `₹${Math.abs(value).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})}`;

export default function FinanceSummary() {
  const getTotals = useFinanceStore((state) => state.getTotals);
  const { totalIncome, totalExpenses, remaining } = getTotals();

  const summaries = [
    {
      label: 'Income this month',
      value: formatAmount(totalIncome),
      detail: 'Including carry-forward',
      section: 'summary-income',
    },
    {
      label: 'Expenses',
      value: formatAmount(totalExpenses),
      detail: 'Recorded this month',
      section: 'summary-expenses',
    },
    {
      label: 'Available after plans',
      value: `${remaining < 0 ? '−' : ''}${formatAmount(remaining)}`,
      detail: 'After savings allocations',
      tone: remaining < 0 ? 'negative' : 'positive',
      section: 'summary-available',
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Monthly summary">
      {summaries.map(({ label, value, detail, tone, section }) => (
        <article
          key={label}
          className="app-surface finance-section-tint min-w-0 p-4"
          style={{
            '--section-accent': `var(--section-${section})`,
            '--section-tint': `var(--section-${section}-bg)`,
          }}
        >
          <h3 className="text-sm font-medium" style={{ color: `var(--section-${section})` }}>{label}</h3>
          <p
            className={`mt-2 truncate text-2xl font-medium leading-tight tabular-nums ${tone === 'negative' ? 'text-[var(--negative)]' : tone === 'positive' ? 'text-[var(--positive)]' : 'text-[var(--text-primary)]'}`}
            style={!tone ? { color: `var(--section-${section})` } : undefined}
          >
            {value}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{detail}</p>
        </article>
      ))}
    </section>
  );
}
