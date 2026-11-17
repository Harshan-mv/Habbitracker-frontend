import useFinanceStore from '../../store/useFinanceStore';

const formatAmount = (value) => `₹${Math.abs(value).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})}`;

export default function FinanceSummary() {
  const getTotals = useFinanceStore((state) => state.getTotals);
  const { totalIncome, totalExpenses, remaining } = getTotals();

  const summaries = [
    { label: 'Income this month', value: formatAmount(totalIncome), detail: 'Including carry-forward' },
    { label: 'Expenses', value: formatAmount(totalExpenses), detail: 'Recorded this month' },
    {
      label: 'Available after plans',
      value: `${remaining < 0 ? '−' : ''}${formatAmount(remaining)}`,
      detail: 'After savings allocations',
      tone: remaining < 0 ? 'negative' : 'positive',
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Monthly summary">
      {summaries.map(({ label, value, detail, tone }) => (
        <article key={label} className="app-surface min-w-0 p-4">
          <h3 className="text-sm text-[var(--text-secondary)]">{label}</h3>
          <p
            className={`mt-2 truncate text-2xl font-medium leading-tight tabular-nums ${tone === 'negative' ? 'text-[var(--negative)]' : tone === 'positive' ? 'text-[var(--positive)]' : 'text-[var(--text-primary)]'}`}
          >
            {value}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{detail}</p>
        </article>
      ))}
    </section>
  );
}
