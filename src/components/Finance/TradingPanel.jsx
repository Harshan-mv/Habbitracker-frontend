import React from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { BarChart3 } from 'lucide-react';

export default function TradingPanel() {
  const { monthData, updateTrading, getTradingCapital } = useFinanceStore();
  const capital = getTradingCapital();
  const netPnL = monthData.realizedPnL - monthData.charges;
  const isProfit = netPnL >= 0;

  return (
    <div
      className="finance-card rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(167,139,250,0.12)' }}
        >
          <BarChart3 size={15} style={{ color: 'var(--accent-purple)' }} />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Trading P&L
        </h3>
      </div>

      <div className="space-y-3">
        {/* Capital (auto from Investment expenses) */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Capital Deployed</span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-purple)' }}>
            ₹{capital.toLocaleString('en-IN')}
          </span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />

        {/* Realized P&L */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Realized P&L</span>
          <input
            className="finance-input w-28 text-right text-sm font-semibold"
            type="number"
            value={monthData.realizedPnL || ''}
            placeholder="0"
            onChange={(e) => updateTrading('realizedPnL', e.target.value)}
            style={{ color: monthData.realizedPnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
          />
        </div>

        {/* Charges */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Charges / Brokerage</span>
          <input
            className="finance-input w-28 text-right text-sm font-semibold"
            type="number"
            value={monthData.charges || ''}
            placeholder="0"
            onChange={(e) => updateTrading('charges', e.target.value)}
            style={{ color: 'var(--accent-red)' }}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />

        {/* Net P&L */}
        <div
          className="flex items-center justify-between p-3 rounded-xl"
          style={{
            background: isProfit ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          }}
        >
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            Net P&L
          </span>
          <span
            className="text-base font-extrabold"
            style={{ color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}
          >
            {isProfit ? '+' : '-'}₹{Math.abs(netPnL).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
