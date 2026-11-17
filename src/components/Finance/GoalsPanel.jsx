import { useRef, useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { Target, Shield, CreditCard, Pencil, ArrowRightLeft, RotateCcw, Plus } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';
import GoalCard from './GoalCard';
import AddGoalModal from './AddGoalModal';

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--surface-raised)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: color,
          transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
}

function EditableValue({ value, onSave, prefix = '₹', color }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const save = () => {
    const number = Number(val);
    if (Number.isFinite(number) && number >= 0) onSave(number);
    else setVal(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{prefix}</span>
        <input
          className="finance-input w-24 text-base font-bold"
          type="number"
          min="0"
          step="1"
          aria-label="Edit goal amount"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          onBlur={save}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Edit amount ${value}`}
      className="flex min-h-9 items-center gap-2 group"
      onClick={() => { setVal(value); setEditing(true); }}
    >
      <span className="text-base font-medium tabular-nums" style={{ color }}>
        {prefix}{Number(value).toLocaleString('en-IN')}
      </span>
      <Pencil
        size={12}
        className="opacity-100 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      />
    </button>
  );
}

export default function GoalsPanel() {
  const { monthData, updateGoals, addToGoal, resetGoal, deleteGoal, customGoals, isLoadingGoals, goalsError, fetchGoals } = useFinanceStore();
  const dialogFallbackRef = useRef(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleConfirmDelete = async () => {
    if (deleteTarget) await deleteGoal(deleteTarget.goal._id);
  };

  const goals = [
    {
      key: 'emi',
      label: 'EMI tracker',
      icon: CreditCard,
      color: 'var(--warning)',
      bg: 'var(--surface-raised)',
      value: monthData.emiTotalMonths - monthData.emiMonthsLeft,
      max: monthData.emiTotalMonths,
      subtitle: `${monthData.emiMonthsLeft} months remaining`,
      align: 'left',
      editFields: [
        { label: 'Months left', field: 'emiMonthsLeft', val: monthData.emiMonthsLeft },
        { label: 'Total months', field: 'emiTotalMonths', val: monthData.emiTotalMonths },
      ],
    },
    {
      key: 'savings',
      label: 'Savings goal',
      description: 'Monthly allocation, carried across months',
      icon: Target,
      color: 'var(--accent)',
      bg: 'var(--surface-raised)',
      value: monthData.savingsAchieved,
      max: monthData.savingsTarget > 0 ? monthData.savingsTarget : undefined,
      subtitle: `Total saved: ₹${(monthData.savingsAchieved || 0).toLocaleString('en-IN')} (Previous: ₹${(monthData.prevSavingsAchieved || 0).toLocaleString('en-IN')} + This Month: ₹${(monthData.savingsGoal || 0).toLocaleString('en-IN')})`,
      align: 'left',
      editFields: [
        { label: 'This month', field: 'savingsGoal', val: monthData.savingsGoal || 0 },
        { label: 'Target', field: 'savingsTarget', val: monthData.savingsTarget || 0 },
      ],
      showAdd: true,
      canReset: true,
    },
    {
      key: 'emergency',
      label: 'Emergency fund',
      description: 'Monthly allocation, carried forward',
      icon: Shield,
      color: 'var(--info)',
      bg: 'var(--surface-raised)',
      value: monthData.emergencyAchieved,
      max: monthData.emergencyTarget > 0 ? monthData.emergencyTarget : undefined,
      subtitle: `Total saved: ₹${(monthData.emergencyAchieved || 0).toLocaleString('en-IN')} (Previous: ₹${(monthData.prevEmergencyAchieved || 0).toLocaleString('en-IN')} + This Month: ₹${(monthData.emergencyFund || 0).toLocaleString('en-IN')})`,
      align: 'left',
      editFields: [
        { label: 'This month', field: 'emergencyFund', val: monthData.emergencyFund || 0 },
        { label: 'Target', field: 'emergencyTarget', val: monthData.emergencyTarget || 0 },
      ],
      showAdd: true,
      canReset: true,
    },
  ];

  return (
    <div ref={dialogFallbackRef} tabIndex={-1} className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          <Target size={14} /> Goal Tracking
        </h3>
        {(monthData.carryForward || 0) > 0 && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
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
              className="finance-card rounded-[var(--radius-card)] p-4 sm:p-5 group relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: g.bg }}
                  >
                    <Icon size={20} style={{ color: g.color }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {g.label}
                    </h4>
                    {g.description && (
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {g.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {pct !== null && (
                    <span className="text-lg font-medium tabular-nums" style={{ color: g.color }}>
                      {pct}%
                    </span>
                  )}
                  {g.canReset && (
                    <button
                      onClick={() => confirm('Reset accumulated total?') && resetGoal(g.key)}
                      className="finance-icon-btn red"
                      title="Reset Total"
                      aria-label={`Reset ${g.label}`}
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
                        <span className="mb-1 text-xs font-medium text-[var(--text-secondary)]">
                          {ef.label}
                        </span>
                        <EditableValue
                          value={ef.val}
                          color="var(--text-primary)"
                          prefix={ef.label === 'Months left' || ef.label === 'Total months' ? '' : '₹'}
                          onSave={(v) => updateGoals({ [ef.field]: v })}
                        />
                      </div>
                    ))}
                  </div>

                  {g.showAdd && (
                    <div className="ms-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addToGoal(g.key, 1000)}
                        className="min-h-9 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)]"
                        aria-label={`Add 1,000 to ${g.label}`}
                      >
                        +₹1k
                      </button>
                      <button
                        type="button"
                        onClick={() => addToGoal(g.key, 5000)}
                        className="min-h-9 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-xs font-medium hover:bg-[var(--surface-hover)]"
                        aria-label={`Add 5,000 to ${g.label}`}
                      >
                        +₹5k
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isLoadingGoals && (
          <p className="py-2 text-sm text-[var(--text-muted)]" role="status">Loading custom goals</p>
        )}
        {goalsError && (
          <div className="status-message flex flex-wrap items-center justify-between gap-2" data-tone="error" role="alert">
            <span>{goalsError}</span>
            <button type="button" className="rounded-[var(--radius-control)] px-3 py-1.5 text-sm" onClick={() => fetchGoals(useFinanceStore.getState().currentMonth)}>
              Try again
            </button>
          </div>
        )}
        {customGoals.map((goal) => (
          <GoalCard
            key={`${goal._id}-${goal.monthAllocation || 0}`}
            goal={goal}
            onEdit={() => setEditingGoal(goal)}
            onDeleteRequest={(item, triggerElement) => setDeleteTarget({ goal: item, triggerElement })}
          />
        ))}
        <button
          type="button"
          onClick={() => { setEditingGoal(null); setShowGoalForm(true); }}
          className="flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-[var(--line)] text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-raised)] hover:text-[var(--accent)]"
        >
          <Plus size={16} aria-hidden="true" /> Add Goal
        </button>
      </div>
      {(showGoalForm || editingGoal) && (
        <AddGoalModal
          goal={editingGoal}
          onClose={() => { setShowGoalForm(false); setEditingGoal(null); }}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this goal?"
          itemName={deleteTarget.goal.name}
          triggerElement={deleteTarget.triggerElement}
          fallbackFocusRef={dialogFallbackRef}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
