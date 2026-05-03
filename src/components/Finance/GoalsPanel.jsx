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
  const { monthData, updateGoals, addToGoal } = useFinanceStore();

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
      max: monthData.savingsTarget > 0 ? monthData.savingsTarget : undefined,
      subtitle: `Target: ₹${(monthData.savingsTarget || 0).toLocaleString('en-IN')} · Total saved: ₹${(monthData.savingsAchieved || 0).toLocaleString('en-IN')}`,
      editFields: [
        { label: 'This Month', field: 'savingsGoal', val: monthData.savingsGoal || 0 },
        { label: 'Target', field: 'savingsTarget', val: monthData.savingsTarget || 0 },
      ],
      showAdd: true,
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
      subtitle: `Target: ₹${(monthData.emergencyTarget || 0).toLocaleString('en-IN')} · Total: ₹${(monthData.emergencyAchieved || 0).toLocaleString('en-IN')}`,
      editFields: [
        { label: 'This Month', field: 'emergencyFund', val: monthData.emergencyFund || 0 },
        { label: 'Target', field: 'emergencyTarget', val: monthData.emergencyTarget || 0 },
      ],
      showAdd: true,
    },
  ];

  return (
    <div
      className="finance-card rounded-2xl p-6"
      style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)' 
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <Target size={16} className="text-accent-blue" />
          Goal Tracking
        </h3>
        {(monthData.carryForward || 0) > 0 && (
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
            style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent-green)' }}
          >
            <ArrowRightLeft size={12} />
            Carry Forward: ₹{monthData.carryForward.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      <div className="space-y-8">
        {goals.map((g) => {
          const Icon = g.icon;
          const pct = g.max > 0 ? Math.min((g.value / g.max) * 100, 100).toFixed(0) : null;
          
          return (
            <div key={g.key} className="group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: g.bg }}
                  >
                    <Icon size={18} style={{ color: g.color }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {g.label}
                    </h4>
                    {g.description && (
                      <p className="text-[10px] opacity-60" style={{ color: 'var(--text-secondary)' }}>
                        {g.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {pct !== null ? (
                    <span className="text-lg font-black tracking-tighter" style={{ color: g.color }}>
                      {pct}%
                    </span>
                  ) : (
                    <span className="text-xs font-bold opacity-40">--</span>
                  )}
                </div>
              </div>

              {g.max > 0 && (
                <div className="mb-3">
                  <ProgressBar value={g.value} max={g.max} color={g.color} />
                </div>
              )}

              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {g.subtitle}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    {g.editFields.map((ef) => (
                      <div key={ef.field} className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-tighter opacity-50 mb-0.5">
                          {ef.label}
                        </span>
                        <EditableValue
                          value={ef.val}
                          color="var(--text-primary)"
                          prefix={ef.label === 'Months Left' || ef.label === 'Total Months' ? '' : '₹'}
                          onSave={(v) => updateGoals({ [ef.field]: v })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {g.showAdd && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => addToGoal(g.key, 1000)}
                      className="px-2 py-1 rounded-md text-[10px] font-bold hover:brightness-125 transition-all"
                      style={{ background: g.bg, color: g.color, border: `1px solid ${g.color}33` }}
                    >
                      +1k
                    </button>
                    <button
                      onClick={() => addToGoal(g.key, 5000)}
                      className="px-2 py-1 rounded-md text-[10px] font-bold hover:brightness-125 transition-all"
                      style={{ background: g.bg, color: g.color, border: `1px solid ${g.color}33` }}
                    >
                      +5k
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
