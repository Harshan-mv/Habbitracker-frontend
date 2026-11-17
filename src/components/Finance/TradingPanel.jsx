import useFinanceStore from '../../store/useFinanceStore';

const formatAmount = (value) => `₹${Math.abs(value).toLocaleString('en-IN')}`;

export default function TradingPanel() {
  const { monthData, updateTrading, getTradingCapital } = useFinanceStore();
  const capital = getTradingCapital();
  const netPnL = monthData.realizedPnL - monthData.charges;

  return (
    <section className="app-surface p-4 sm:p-5" aria-labelledby="trading-heading">
      <div className="mb-4">
        <h3 id="trading-heading" className="text-sm font-medium text-[var(--text-primary)]">Trading summary</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Based on investment expenses and recorded results</p>
      </div>

      <dl className="space-y-3">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] pb-3">
          <dt className="text-sm text-[var(--text-secondary)]">Capital deployed</dt>
          <dd className="text-sm font-medium tabular-nums text-[var(--text-primary)]">{formatAmount(capital)}</dd>
        </div>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-[var(--text-secondary)]">Realized P&amp;L</span>
          <input
            className="finance-input w-32 text-right tabular-nums"
            type="number"
            value={monthData.realizedPnL || ''}
            placeholder="0"
            aria-label="Realized profit and loss"
            onChange={(event) => updateTrading('realizedPnL', event.target.value)}
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-[var(--text-secondary)]">Charges / brokerage</span>
          <input
            className="finance-input w-32 text-right tabular-nums"
            type="number"
            min="0"
            value={monthData.charges || ''}
            placeholder="0"
            aria-label="Charges and brokerage"
            onChange={(event) => updateTrading('charges', event.target.value)}
          />
        </label>
        <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-3">
          <dt className="text-sm font-medium text-[var(--text-primary)]">Net P&amp;L</dt>
          <dd className={`text-base font-medium tabular-nums ${netPnL >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}>
            {netPnL < 0 ? '−' : ''}{formatAmount(netPnL)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
