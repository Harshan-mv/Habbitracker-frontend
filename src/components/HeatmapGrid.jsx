import { ChevronLeft, ChevronRight, Check, Lock } from 'lucide-react';
import { format, isToday } from 'date-fns';
import useStore from '../store/useStore';
import { getLast12Days, formatDate, isLoggedOnDate } from '../utils/streakLogic';
import Skeleton from './Skeleton';

const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 58;
const FOOTER_HEIGHT = 40;

function getCellColor(baseColor, streakCount) {
  if (streakCount === 0) return 'rgba(255,255,255,0.04)';
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  const intensity = Math.min(0.35 + (streakCount / 7) * 0.65, 1);
  return `rgba(${r},${g},${b},${intensity})`;
}

export default function HeatmapGrid() {
  const { habits, logs, weekOffset, setWeekOffset, toggleLog, isLoadingHabits, isLoadingLogs } = useStore();
  const days = getLast12Days(weekOffset);

  const handleCellClick = async (habitId, dateStr, clickable) => {
    if (!clickable) return;
    await toggleLog(habitId, dateStr);
  };

  const dayCompletedCounts = days.map((day) => {
    const dateStr = formatDate(day);
    return habits.filter((h) => isLoggedOnDate(logs, h._id, dateStr)).length;
  });

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="min-w-0">

        {/* ── Date header row ── */}
        <div
          className="flex items-end pb-3 gap-1"
          style={{ height: `${HEADER_HEIGHT}px` }}
        >
          {/* Left arrow */}
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            type="button"
            aria-label="Show earlier dates"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft size={14} />
          </button>

          {days.map((day) => {
            const todayFlag = isToday(day);
            const dateStr = formatDate(day);
            return (
              <div key={dateStr} className="flex-1 flex flex-col items-center" style={{ minWidth: '44px' }}>
                <span className="mb-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {format(day, 'MMM d')}
                </span>
                {todayFlag ? (
                  <div
                    className="flex h-9 w-9 flex-col items-center justify-center rounded-[var(--radius-control)]"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--accent-ink)',
                    }}
                  >
                    <span className="text-xs font-semibold leading-none">{format(day, 'd')}</span>
                    <span className="text-[11px] leading-none font-medium">{format(day, 'EEE')}</span>
                  </div>
                ) : (
                  <div className="flex h-9 w-9 flex-col items-center justify-center">
                    <span className="text-sm font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>{format(day, 'd')}</span>
                    <span className="text-[11px] leading-none font-medium" style={{ color: 'var(--text-muted)' }}>{format(day, 'EEE')}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Right arrow */}
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            type="button"
            disabled={weekOffset === 0}
            aria-label="Show later dates"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* ── Habit rows ── */}
        {isLoadingHabits || isLoadingLogs ? (
          // Skeleton loading state for grid
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-1 flex-shrink-0"
              style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid var(--glass-border)' }}
            >
              <div className="w-7 flex-shrink-0" />
              {days.map((_, j) => (
                <div key={j} className="flex-1 flex items-center justify-center" style={{ minWidth: '44px' }}>
                  <Skeleton width="38px" height="38px" variant="rect" />
                </div>
              ))}
              <div className="w-7 flex-shrink-0" />
            </div>
          ))
        ) : (
          habits.map((habit) => (
            <div
              key={habit._id}
              className="flex items-center gap-1 flex-shrink-0"
              style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid var(--glass-border)' }}
            >
              <div className="w-7 flex-shrink-0" />

              {days.map((day) => {
                const dateStr = formatDate(day);
                const done = isLoggedOnDate(logs, habit._id, dateStr);
                // Only TODAY is clickable — past days are locked, future are locked
                const clickable = isToday(day) && weekOffset === 0;
                const isPast = !isToday(day) && new Date(dateStr) < new Date();

                // Streak intensity for coloring
                let streakLen = 0;
                if (done) {
                  let cur = day;
                  while (isLoggedOnDate(logs, habit._id, formatDate(cur))) {
                    streakLen++;
                    cur = new Date(cur.getTime() - 86400000);
                  }
                }

                const cellColor = done
                  ? getCellColor(habit.color, streakLen)
                  : clickable
                    ? 'var(--surface-raised)'
                    : isPast
                        ? 'var(--page)'
                        : 'var(--surface-raised)';

                return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => handleCellClick(habit._id, dateStr, clickable)}
                      disabled={!clickable}
                      aria-label={`${habit.name}, ${format(day, 'EEEE, MMMM d')}: ${done ? 'complete' : 'incomplete'}${clickable ? ', toggle completion' : ', locked'}`}
                      aria-pressed={done}
                      className="relative flex-1 rounded-[var(--radius-control)] transition-colors flex items-center justify-center disabled:cursor-not-allowed"
                      style={{
                        height: '38px',
                        minWidth: '44px',
                        background: cellColor,
                        border: isToday(day) && weekOffset === 0
                          ? '1px solid var(--accent)'
                          : '1px solid var(--line)',
                        opacity: isPast && !done ? 0.45 : 1,
                        color: 'var(--on-heatmap)',
                      }}
                      title={
                      clickable
                        ? `${habit.name} — Click to ${done ? 'unmark' : 'mark'} today`
                        : isPast
                          ? `${habit.name} — ${dateStr} (past days are locked)`
                          : `${habit.name} — ${dateStr}`
                    }
                  >
                    {done ? (
                      <Check size={14} color="currentColor" strokeWidth={2} aria-hidden="true" />
                    ) : isPast ? (
                      <Lock size={12} color="var(--text-muted)" strokeWidth={1.7} aria-hidden="true" />
                    ) : null}
                  </button>
                );
              })}

              <div className="w-7 flex-shrink-0" />
            </div>
          ))
        )}

        {/* ── Daily count row ── */}
        <div className="flex items-center gap-1" style={{ height: `${FOOTER_HEIGHT}px` }}>
          <div className="w-7 flex-shrink-0" />
          {dayCompletedCounts.map((count, i) => (
            <div
              key={i}
              className="flex-1 flex items-center justify-center"
              style={{ minWidth: '44px' }}
            >
              {count > 0 && (
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {count}
                </span>
              )}
            </div>
          ))}
          <div className="w-7 flex-shrink-0" />
        </div>

      </div>
    </div>
  );
}
