import { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import useFinanceStore from '../../store/useFinanceStore';
import { GOAL_ICONS, GOAL_TEMPLATES, GOAL_TYPES } from './goalTemplates';

const dateValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

export default function AddGoalModal({ goal, onClose }) {
  const { currentMonth, addGoal, updateGoal } = useFinanceStore();
  const [name, setName] = useState(goal?.name || '');
  const [type, setType] = useState(goal?.type || 'Travel');
  const [icon, setIcon] = useState(goal?.icon || GOAL_TEMPLATES.Travel.icon);
  const [color, setColor] = useState(goal?.color || GOAL_TEMPLATES.Travel.color);
  const [targetAmount, setTargetAmount] = useState(String(goal?.targetAmount || ''));
  const [deadline, setDeadline] = useState(dateValue(goal?.deadline));
  const [monthlyAllocation, setMonthlyAllocation] = useState(String(goal?.monthAllocation || ''));
  const [note, setNote] = useState(goal?.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef(null);

  const suggestedAllocation = useMemo(() => {
    const target = Number(targetAmount);
    if (!target || !deadline) return null;
    const [year, month] = currentMonth.split('-').map(Number);
    const [deadlineYear, deadlineMonth] = deadline.split('-').map(Number);
    const months = (deadlineYear - year) * 12 + deadlineMonth - month + 1;
    if (months <= 0) return null;
    const remaining = Math.max(0, target - (goal?.savedBefore || 0));
    return Math.ceil(remaining / months);
  }, [currentMonth, deadline, goal?.savedBefore, targetAmount]);

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setIcon(GOAL_TEMPLATES[nextType].icon);
    setColor(GOAL_TEMPLATES[nextType].color);
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const target = Number(targetAmount);
    const allocation = Number(monthlyAllocation || 0);
    if (!name.trim()) return setError('Enter a goal name.');
    if (!Number.isFinite(target) || target <= 0) return setError('Target amount must be greater than zero.');
    if (!Number.isFinite(allocation) || allocation < 0) return setError('Monthly allocation cannot be negative.');

    setSaving(true);
    setError('');
    try {
      const details = {
        name: name.trim(),
        type,
        icon,
        color,
        targetAmount: target,
        deadline: deadline || null,
        note: note.trim(),
      };
      if (goal) {
        await updateGoal(goal._id, details);
        if (allocation !== Number(goal.monthAllocation || 0)) {
          await useFinanceStore.getState().setGoalAllocation(goal._id, allocation);
        }
      } else {
        await addGoal({ ...details, monthlyAllocation: allocation });
      }
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Could not save this goal. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-dialog-title"
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
        className="app-panel my-auto max-h-[calc(100vh-32px)] w-full max-w-xl overflow-y-auto bg-[var(--surface)] p-5 sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="goal-dialog-title" className="text-lg font-medium text-[var(--text-primary)]">{goal ? 'Edit goal' : 'Add a goal'}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Set a target and track contributions month by month</p>
          </div>
          <button type="button" className="finance-icon-btn muted" onClick={onClose} aria-label="Close goal form">
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)] sm:col-span-2">
            Goal name
            <input autoFocus required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="finance-input w-full" placeholder="For example, Goa trip" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
            Template
            <select value={type} onChange={(event) => handleTypeChange(event.target.value)} className="finance-input w-full">
              {GOAL_TYPES.map((goalType) => <option key={goalType}>{goalType}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
            Icon
            <select value={icon} onChange={(event) => setIcon(event.target.value)} className="finance-input w-full">
              {GOAL_ICONS.map(({ icon: iconName, label }) => <option key={iconName} value={iconName}>{label}</option>)}
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
            Goal color
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-14 cursor-pointer rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] p-1" aria-label="Goal color" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
            Target amount
            <input required type="number" min="1" step="1" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} className="finance-input w-full" placeholder="50000" />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
            Target date (optional)
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="finance-input w-full" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)]">
            Monthly allocation
            <input
              type="number"
              min="0"
              step="1"
              value={monthlyAllocation}
              onChange={(event) => setMonthlyAllocation(event.target.value)}
              className="finance-input w-full"
              placeholder="5000"
              disabled={Boolean(goal && ['paused', 'archived'].includes(goal.status))}
            />
          </label>

          {suggestedAllocation !== null && !goal && (
            <p className="text-xs text-[var(--text-muted)] sm:col-span-2">
              Suggested allocation: ₹{suggestedAllocation.toLocaleString('en-IN')} per month
              <button type="button" className="ms-2 font-medium text-[var(--accent)] underline underline-offset-2" onClick={() => setMonthlyAllocation(String(suggestedAllocation))}>
                Use suggestion
              </button>
            </p>
          )}

          <label className="flex flex-col gap-1.5 text-sm text-[var(--text-secondary)] sm:col-span-2">
            Note (optional)
            <textarea maxLength={1000} rows={3} value={note} onChange={(event) => setNote(event.target.value)} className="finance-input w-full resize-y py-2" />
          </label>

          {error && <p className="status-message sm:col-span-2" data-tone="error" role="alert">{error}</p>}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="min-h-10 rounded-[var(--radius-control)] border border-[var(--line)] px-4 text-sm text-[var(--text-secondary)]">Cancel</button>
            <button type="submit" disabled={saving} className="min-h-10 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-ink)] disabled:opacity-60">
              {saving ? 'Saving' : goal ? 'Save changes' : 'Add goal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
