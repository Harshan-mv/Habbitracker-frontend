import React, { useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { Target, Shield, CreditCard, Pencil, ArrowRightLeft, RotateCcw } from 'lucide-react';

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
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{prefix}</span>
        <input
          className="finance-input w-24 text-base font-bold"
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
      <span className="text-base font-bold" style={{ color }}>
        {prefix}{Number(value).toLocaleString('en-IN')}
      </span>
      <Pencil
        size={12}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      />
    </button>
  );
}

export default function GoalsPanel() {
  const { monthData, updateGoals, addToGoal, resetGoal } = useFinanceStore();

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
      align: 'right',
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
      align: 'left',
      editFields: [
        { label: 'This Month', field: 'savingsGoal', val: monthData.savingsGoal || 0 },
        { label: 'Target', field: 'savingsTarget', val: monthData.savingsTarget || 0 },
      ],
      showAdd: true,
      canReset: true,
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
      align: 'center',
      editFields: [
        { label: 'This Month', field: 'emergencyFund', val: monthData.emergencyFund || 0 },
        { label: 'Target', field: 'emergencyTarget', val: monthData.emergencyTarget || 0 },
      ],
      showAdd: true,
      canReset: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Target size={14} /> Goal Tracking
        </h3>
        {(monthData.carryForward || 0) > 0 && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1" style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent-green)' }}>
            <ArrowRightLeft size={10} /> ₹{monthData.carryForward.toLocaleString('en-IN')} Carry
          </span>
        )}
      </div>

      <div className="grid gap-4">
        {goals.map((g) => {
          const Icon = g.icon;
          const pct = g.max > 0 ? Math.min((g.value / g.max) * 100, 100).toFixed(0) : null;
          
          return (
            <div 
              key={g.key} 
              className="finance-card rounded-2xl p-5 group relative overflow-hidden"
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {/* Status Indicator */}
              <div 
                className="absolute top-0 left-0 w-1 h-full" 
                style={{ background: g.color }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ background: g.bg }}
                  >
                    <Icon size={20} style={{ color: g.color }} />
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
                <div className="flex items-center gap-3">
                  {pct !== null && (
                    <span className="text-lg font-black tracking-tighter" style={{ color: g.color }}>
                      {pct}%
                    </span>
                  )}
                  {g.canReset && (
                    <button
                      onClick={() => confirm('Reset accumulated total?') && resetGoal(g.key)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 text-red-500"
                      title="Reset Total"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>

              {g.max > 0 && (
                <div className="mb-4">
                  <ProgressBar value={g.value} max={g.max} color={g.color} />
                </div>
              )}

              <div className={`flex flex-col mt-2 gap-3 ${
                g.align === 'right' ? 'items-end' : 
                g.align === 'center' ? 'items-center' : 'items-start'
              }`}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  {g.subtitle}
                </span>
                
                <div className={`flex items-center gap-6 w-full ${
                  g.align === 'right' ? 'justify-end' : 
                  g.align === 'center' ? 'justify-center' : 'justify-start'
                }`}>
                  <div className="flex items-center gap-6">
                    {g.editFields.map((ef) => (
                      <div key={ef.field} className={`flex flex-col ${
                        g.align === 'right' ? 'items-end' : 
                        g.align === 'center' ? 'items-center' : 'items-start'
                      }`}>
                        <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-1">
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

                  {g.showAdd && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => addToGoal(g.key, 1000)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold hover:brightness-125 transition-all"
                        style={{ background: g.bg, color: g.color, border: `1px solid ${g.color}33` }}
                      >
                        +1k
                      </button>
                      <button
                        onClick={() => addToGoal(g.key, 5000)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold hover:brightness-125 transition-all"
                        style={{ background: g.bg, color: g.color, border: `1px solid ${g.color}33` }}
                      >
                        +5k
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
