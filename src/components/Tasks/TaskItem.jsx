/* eslint-disable react-hooks/refs -- Drag-and-drop requires forwarding its refs and props to the item. */
import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, GripVertical, MessageSquare, Trash2 } from 'lucide-react';
import { differenceInCalendarDays, format, isPast, isToday } from 'date-fns';
import useTaskStore from '../../store/useTaskStore';

const STATUSES = ['Not Started', 'In Progress', 'Done', 'Blocked'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUS_TOKENS = {
  'Not Started': ['var(--status-todo)', 'var(--status-todo-bg)'],
  'In Progress': ['var(--status-progress)', 'var(--status-progress-bg)'],
  Blocked: ['var(--status-blocked)', 'var(--status-blocked-bg)'],
  Done: ['var(--status-done)', 'var(--status-done-bg)'],
};
const PRIORITY_TOKENS = {
  High: ['var(--priority-high)', 'var(--priority-high-bg)'],
  Medium: ['var(--priority-medium)', 'var(--priority-medium-bg)'],
  Low: ['var(--priority-low)', 'var(--priority-low-bg)'],
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd');
};

const toDateValue = (value) => (value ? new Date(`${value}T12:00:00`).toISOString() : '');

function calculateProgress(timeline) {
  if (!timeline?.startDate || !timeline?.endDate) return 0;
  const start = new Date(timeline.startDate);
  const end = new Date(timeline.endDate);
  const today = new Date();
  const totalDays = differenceInCalendarDays(end, start);
  if (totalDays <= 0) return today >= end ? 100 : 0;
  if (today < start) return 0;
  return Math.min(100, Math.max(0, (differenceInCalendarDays(today, start) / totalDays) * 100));
}

export default function TaskItem({ task, provided, isDragging, viewMode = 'list' }) {
  const { updateTask, deleteTask } = useTaskStore();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [budgetDraft, setBudgetDraft] = useState(String(task.budget?.amount ?? 0));
  const [remarksDraft, setRemarksDraft] = useState(task.remarks || '');
  const [timelineDraft, setTimelineDraft] = useState({
    startDate: toDateInput(task.timeline?.startDate),
    endDate: toDateInput(task.timeline?.endDate),
  });
  const [showDetails, setShowDetails] = useState(false);

  const progress = useMemo(() => calculateProgress(task.timeline), [task.timeline]);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== 'Done';
  const isDueToday = dueDate && isToday(dueDate) && task.status !== 'Done';
  const [statusColor, statusBackground] = STATUS_TOKENS[task.status] || ['var(--text-secondary)', 'var(--surface-raised)'];
  const [priorityColor, priorityBackground] = PRIORITY_TOKENS[task.priority] || ['var(--text-secondary)', 'var(--surface-raised)'];
  const itemAccent = viewMode === 'board' ? priorityColor : statusColor;
  const cardStyle = {
    ...provided.draggableProps.style,
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderInlineStart: `3px solid ${itemAccent}`,
    opacity: task.status === 'Done' ? 0.88 : 1,
  };

  const saveTitle = () => {
    setEditingTitle(false);
    const nextTitle = titleDraft.trim();
    if (nextTitle && nextTitle !== task.title) updateTask(task._id, { title: nextTitle });
    else setTitleDraft(task.title);
  };

  const saveBudget = () => {
    const amount = Number(budgetDraft);
    if (!Number.isFinite(amount) || amount < 0) {
      setBudgetDraft(String(task.budget?.amount ?? 0));
      return;
    }
    if (amount !== Number(task.budget?.amount || 0)) {
      updateTask(task._id, {
        budget: { ...task.budget, amount, currency: task.budget?.currency || '₹' },
      });
    }
  };

  const saveRemarks = () => {
    if (remarksDraft !== (task.remarks || '')) updateTask(task._id, { remarks: remarksDraft });
  };

  const saveTimeline = (field, value) => {
    const next = { ...timelineDraft, [field]: value };
    setTimelineDraft(next);
    updateTask(task._id, {
      timeline: {
        ...task.timeline,
        [field]: toDateValue(value),
      },
    });
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    } else if (event.key === 'Escape') {
      setTitleDraft(task.title);
      setEditingTitle(false);
    }
  };

  return (
    <article
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`rounded-[var(--radius-card)] border p-3 transition-colors sm:p-4 ${isDragging ? 'shadow-lg' : ''}`}
      style={cardStyle}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...provided.dragHandleProps}
          className="finance-icon-btn muted -ms-1 h-9 w-8 shrink-0 cursor-grab active:cursor-grabbing"
          aria-label={`Reorder ${task.title}`}
          title="Drag to reorder"
        >
          <GripVertical size={17} aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleTitleKeyDown}
              aria-label="Task title"
              className="finance-input w-full font-medium"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className={`block max-w-full truncate text-left text-sm font-medium hover:underline underline-offset-4 ${task.status === 'Done' ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}
              aria-label={`Edit task title: ${task.title}`}
            >
              {task.title}
            </button>
          )}

          {task.timeline?.startDate && task.timeline?.endDate && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span>Timeline</span>
                <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-raised)]"
                role="progressbar"
                aria-label={`Timeline progress for ${task.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((visible) => !visible)}
          className={`finance-icon-btn muted h-9 w-9 shrink-0 ${showDetails ? 'bg-[var(--surface-raised)]' : ''}`}
          aria-label={`${showDetails ? 'Hide' : 'Show'} details for ${task.title}`}
          aria-expanded={showDetails}
        >
          <MessageSquare size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => deleteTask(task._id)}
          className="finance-icon-btn red h-9 w-9 shrink-0"
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3 border-t border-[var(--line)] pt-3">
        <label className="flex min-w-32 flex-1 flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)]">Status</span>
          <span className="flex items-center gap-1.5">
            {task.status === 'Done' && <CheckCircle2 size={14} className="text-[var(--positive)]" aria-hidden="true" />}
            <select
              value={task.status}
              onChange={(event) => updateTask(task._id, { status: event.target.value })}
              aria-label={`Status for ${task.title}`}
              className="min-h-9 min-w-0 flex-1 rounded-[var(--radius-control)] border px-2 text-xs font-medium"
              style={{ color: statusColor, backgroundColor: statusBackground, borderColor: statusColor }}
            >
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </span>
        </label>

        <label className="flex min-w-24 flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)]">Priority</span>
          <select
            value={task.priority}
            onChange={(event) => updateTask(task._id, { priority: event.target.value })}
            aria-label={`Priority for ${task.title}`}
            className="min-h-9 rounded-[var(--radius-control)] border px-2 text-xs font-medium"
            style={{ color: priorityColor, backgroundColor: priorityBackground, borderColor: priorityColor }}
          >
            {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </label>

        <label className="flex min-w-24 flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)]">Budget</span>
          <span className="flex min-h-9 items-center gap-1.5">
            <span className="text-xs text-[var(--text-muted)]">{task.budget?.currency || '₹'}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={budgetDraft}
              onChange={(event) => setBudgetDraft(event.target.value)}
              onBlur={saveBudget}
              onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
              aria-label={`Budget for ${task.title}`}
              className="finance-input min-h-9 w-24 px-2 text-xs tabular-nums"
            />
          </span>
        </label>

        <label className="flex min-w-36 flex-col gap-1">
          <span className="text-xs text-[var(--text-muted)]">Due date</span>
          <span className="flex min-h-9 items-center gap-1.5">
            <CalendarDays size={14} className={isOverdue ? 'text-[var(--negative)]' : isDueToday ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'} aria-hidden="true" />
            <input
              type="date"
              value={toDateInput(task.dueDate)}
              onChange={(event) => updateTask(task._id, { dueDate: toDateValue(event.target.value) })}
              aria-label={`Due date for ${task.title}`}
              className="min-h-9 min-w-0 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-2 text-xs"
              style={{ color: isOverdue ? 'var(--negative)' : isDueToday ? 'var(--warning)' : 'var(--text-primary)' }}
            />
            {isOverdue && <span className="text-xs font-medium text-[var(--negative)]">Overdue</span>}
            {isDueToday && <span className="text-xs font-medium text-[var(--warning)]">Due today</span>}
          </span>
        </label>
      </div>

      {showDetails && (
        <div className="mt-3 grid gap-3 border-t border-[var(--line)] pt-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
            Start date
            <input
              type="date"
              value={timelineDraft.startDate}
              onChange={(event) => saveTimeline('startDate', event.target.value)}
              className="finance-input"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
            End date
            <input
              type="date"
              value={timelineDraft.endDate}
              onChange={(event) => saveTimeline('endDate', event.target.value)}
              className="finance-input"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)] sm:col-span-2">
            Notes
            <textarea
              value={remarksDraft}
              onChange={(event) => setRemarksDraft(event.target.value)}
              onBlur={saveRemarks}
              rows={3}
              maxLength={2000}
              className="finance-input resize-y py-2"
              placeholder="Add notes for this task"
            />
          </label>
        </div>
      )}
    </article>
  );
}
