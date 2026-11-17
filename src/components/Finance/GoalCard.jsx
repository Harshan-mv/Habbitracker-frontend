import { useState } from 'react';
import { Archive, Check, Pencil, Play, Pause, Trash2 } from 'lucide-react';
import useFinanceStore from '../../store/useFinanceStore';
import { GOAL_ICONS, GOAL_TEMPLATES } from './goalTemplates';

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function GoalCard({ goal, onEdit }) {
  const { updateGoal, deleteGoal, setGoalAllocation } = useFinanceStore();
  const [allocation, setAllocation] = useState(String(goal.monthAllocation || 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const Icon = GOAL_ICONS.find((item) => item.icon === goal.icon)?.Icon || GOAL_TEMPLATES.Custom.Icon;
  const savedTotal = Number(goal.savedTotal || 0);
  const targetAmount = Number(goal.targetAmount || 0);
  const percent = targetAmount > 0 ? Math.min(100, Math.round((savedTotal / targetAmount) * 100)) : 0;
  const completed = savedTotal >= targetAmount;
  const remaining = Math.max(0, targetAmount - savedTotal);
  const allocationAmount = Number(goal.monthAllocation || 0);
  const monthsLeft = allocationAmount > 0 ? Math.ceil(remaining / allocationAmount) : null;

  const saveAllocation = async (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      setAllocation(String(goal.monthAllocation || 0));
      setError('Allocation cannot be negative.');
      return;
    }
    if (amount === allocationAmount) return;
    setSaving(true);
    setError('');
    try {
      await setGoalAllocation(goal._id, amount);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save the allocation.');
      setAllocation(String(goal.monthAllocation || 0));
    } finally {
      setSaving(false);
    }
  };

  const adjustAllocation = (difference) => {
    const next = Math.max(0, allocationAmount + difference);
    setAllocation(String(next));
    saveAllocation(next);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${goal.name}" and its contribution history? This cannot be undone.`)) return;
    try {
      await deleteGoal(goal._id);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not delete this goal.');
    }
  };

  const handleStatus = async (status) => {
    try {
      await updateGoal(goal._id, { status });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not update this goal.');
    }
  };

  const deadlineLabel = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  return (
    <article className="finance-card min-w-0 rounded-[var(--radius-card)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--surface-raised)]" style={{ color: goal.color }}>
            <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-medium text-[var(--text-primary)]">{goal.name}</h4>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              {completed ? 'Completed' : goal.status === 'paused' ? 'Paused' : goal.status === 'archived' ? 'Archived' : goal.type}
              {deadlineLabel ? ` · Due ${deadlineLabel}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="finance-icon-btn muted" onClick={onEdit} aria-label={`Edit ${goal.name}`}>
            <Pencil size={15} aria-hidden="true" />
          </button>
          {goal.status === 'paused' || goal.status === 'archived' ? (
            <button type="button" className="finance-icon-btn muted" onClick={() => handleStatus('active')} aria-label={`Resume ${goal.name}`}>
              <Play size={15} aria-hidden="true" />
            </button>
          ) : !completed && (
            <button type="button" className="finance-icon-btn muted" onClick={() => handleStatus('paused')} aria-label={`Pause ${goal.name}`}>
              <Pause size={15} aria-hidden="true" />
            </button>
          )}
          {goal.status !== 'archived' && (
            <button type="button" className="finance-icon-btn muted" onClick={() => handleStatus('archived')} aria-label={`Archive ${goal.name}`}>
              <Archive size={15} aria-hidden="true" />
            </button>
          )}
          <button type="button" className="finance-icon-btn red" onClick={handleDelete} aria-label={`Delete ${goal.name}`}>
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Total saved</p>
          <p className="mt-1 text-lg font-medium tabular-nums text-[var(--text-primary)]">{money(savedTotal)} <span className="text-sm text-[var(--text-muted)]">of {money(targetAmount)}</span></p>
        </div>
        {completed ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--positive)]"><Check size={16} aria-hidden="true" /> Completed</span>
        ) : (
          <span className="font-mono text-sm tabular-nums text-[var(--text-secondary)]">{percent}%</span>
        )}
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]" role="progressbar" aria-label={`${goal.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${percent}%`, background: goal.color }} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <label htmlFor={`goal-allocation-${goal._id}`} className="text-xs text-[var(--text-muted)]">This month</label>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">₹</span>
            <input
              id={`goal-allocation-${goal._id}`}
              type="number"
              min="0"
              step="1"
              value={allocation}
              disabled={completed || goal.status === 'paused' || goal.status === 'archived' || saving}
              onChange={(event) => setAllocation(event.target.value)}
              onBlur={(event) => saveAllocation(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
              className="finance-input min-w-0 flex-1 tabular-nums"
              aria-label={`Monthly allocation for ${goal.name}`}
            />
            <button type="button" className="min-h-9 rounded-[var(--radius-control)] border border-[var(--line)] px-2.5 text-xs text-[var(--text-secondary)] disabled:opacity-40" disabled={completed || goal.status !== 'active' || saving} onMouseDown={(event) => event.preventDefault()} onClick={() => adjustAllocation(-1000)} aria-label={`Subtract 1,000 from ${goal.name} allocation`}>−₹1k</button>
            <button type="button" className="min-h-9 rounded-[var(--radius-control)] border border-[var(--line)] px-2.5 text-xs text-[var(--text-secondary)] disabled:opacity-40" disabled={completed || goal.status !== 'active' || saving} onMouseDown={(event) => event.preventDefault()} onClick={() => adjustAllocation(1000)} aria-label={`Add 1,000 to ${goal.name} allocation`}>+₹1k</button>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] sm:text-right">
          Saved before this month: {money(goal.savedBefore)}
          {monthsLeft !== null && !completed ? <span className="block">About {monthsLeft} {monthsLeft === 1 ? 'month' : 'months'} at this pace</span> : null}
        </p>
      </div>
      {goal.note && <p className="mt-3 border-t border-[var(--line)] pt-3 text-sm text-[var(--text-secondary)]">{goal.note}</p>}
      {error && <p className="mt-2 text-xs text-[var(--negative)]" role="alert">{error}</p>}
    </article>
  );
}
