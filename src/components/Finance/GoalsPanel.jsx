import React, { useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { Target, Shield, CreditCard, Pencil, ArrowRightLeft } from 'lucide-react';

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
        }}
      />
    </div>
  );
}

function EditableValue({ value, onSave, prefix = '₹', color }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const save = () => {
    onSave(Number(val));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{prefix}</span>
        <input
          className="finance-input w-20 text-sm"
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && save()}
          onBlur={save}
        />
      </div>
    );
  }

  return (
    <button
      className="flex items-center gap-1 group"
      onClick={() => { setVal(value); setEditing(true); }}
    >
      <span className="text-sm font-bold" style={{ color }}>
        {prefix}{Number(value).toLocaleString('en-IN')}
      </span>
      <Pencil
        size={10}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      />
    </button>
  );
}

export default function GoalsPanel() {
  const { monthData, updateGoals } = useFinanceStore();

  const goals = [
    {
      key: 'emi',
      label: 'EMI Tracker',
      icon: CreditCard,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      value: monthData.emiTotalMonths - monthData.emiMonthsLeft,
      max: monthData.emiTotalMonths,
      subtitle: `${monthData.emiMonthsLeft} months remaining`,
      editFields: [
        { label: 'Months Left', field: 'emiMonthsLeft', val: monthData.emiMonthsLeft },
        { label: 'Total Months', field: 'emiTotalMonths', val: monthData.emiTotalMonths },
      ],
    },
    {
      key: 'savings',
      label: 'Savings Goal',
      description: 'Monthly allocation → accumulates across months',
      icon: Target,
      color: 'var(--accent-green)',
      bg: 'rgba(74,222,128,0.1)',
      value: monthData.savingsAchieved,
      max: monthData.savingsGoal > 0 ? undefined : undefined,
      subtitle: `This month: ₹${(monthData.savingsGoal || 0).toLocaleString('en-IN')} · Total saved: ₹${(monthData.savingsAchieved || 0).toLocaleString('en-IN')}`,
      editFields: [
        { label: 'This Month', field: 'savingsGoal', val: monthData.savingsGoal || 0 },
      ],
      showAccumulated: true,
    },
    {
      key: 'emergency',
      label: 'Emergency Fund',
      description: 'Monthly allocation → carries forward',
      icon: Shield,
      color: 'var(--accent-purple)',
      bg: 'rgba(167,139,250,0.1)',
      value: monthData.emergencyAchieved,
      max: monthData.emergencyTarget > 0 ? monthData.emergencyTarget : undefined,
      subtitle: `This month: ₹${(monthData.emergencyFund || 0).toLocaleString('en-IN')} · Total: ₹${(monthData.emergencyAchieved || 0).toLocaleString('en-IN')} · Target: ₹${(monthData.emergencyTarget || 0).toLocaleString('en-IN')}`,
      editFields: [
        { label: 'This Month', field: 'emergencyFund', val: monthData.emergencyFund || 0 },
        { label: 'Target', field: 'emergencyTarget', val: monthData.emergencyTarget || 0 },
      ],
    },
  ];

  return (
    <div
      className="finance-card rounded-2xl p-4"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Goal Tracking
        </h3>
        {(monthData.carryForward || 0) > 0 && (
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1"
            style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent-green)' }}
          >
            <ArrowRightLeft size={10} />
            Carry Forward: ₹{monthData.carryForward.toLocaleString('en-IN')}
          </span>
        )}
      </div>
      <div className="space-y-4">
        {goals.map((g) => {
          const Icon = g.icon;
          const pct = g.max > 0 ? Math.min((g.value / g.max) * 100, 100).toFixed(0) : null;
          return (
            <div key={g.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: g.bg }}
                  >
                    <Icon size={13} style={{ color: g.color }} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {g.label}
                    </span>
                    {g.description && (
                      <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {g.description}
                      </p>
                    )}
                  </div>
                </div>
                {pct !== null && (
                  <span className="text-xs font-bold" style={{ color: g.color }}>
                    {pct}%
                  </span>
                )}
              </div>
              {g.max > 0 && <ProgressBar value={g.value} max={g.max} color={g.color} />}
              <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {g.subtitle}
                </span>
                <div className="flex items-center gap-2">
                  {g.editFields.map((ef) => (
                    <EditableValue
                      key={ef.field}
                      value={ef.val}
                      color="var(--text-secondary)"
                      prefix={ef.label === 'Months Left' || ef.label === 'Total Months' ? '' : '₹'}
                      onSave={(v) => updateGoals({ [ef.field]: v })}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
