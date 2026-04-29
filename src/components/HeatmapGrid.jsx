import { ChevronLeft, ChevronRight, Check, Lock } from 'lucide-react';
import { format, isToday, subDays, parseISO } from 'date-fns';
import useStore from '../store/useStore';
import { getLast12Days, formatDate, isLoggedOnDate } from '../utils/streakLogic';
import Skeleton from './Skeleton';

const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 58;
const FOOTER_HEIGHT = 40;

function getCellColor(baseColor, streakCount) {
  if (streakCount === 0) return 'var(--bg-hover)';
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
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-hover)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ChevronLeft size={14} />
          </button>

          {days.map((day) => {
            const todayFlag = isToday(day);
            const dateStr = formatDate(day);
            return (
              <div key={dateStr} className="flex-1 flex flex-col items-center" style={{ minWidth: '44px' }}>
                <span className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>
                  {format(day, 'MMM')}
                </span>
                {todayFlag ? (
                  <div
                    className="w-9 h-9 rounded-full flex flex-col items-center justify-center"
                    style={{ background: 'var(--accent-green)' }}
                  >
                    <span className="text-xs font-bold leading-none text-black">{format(day, 'd')}</span>
                    <span className="text-[9px] leading-none text-black font-medium">{format(day, 'EEE').toUpperCase()}</span>
                  </div>
                ) : (
                  <div className="w-9 h-9 flex flex-col items-center justify-center">
                    <span className="text-sm font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>{format(day, 'd')}</span>
                    <span className="text-[9px] leading-none font-medium" style={{ color: 'var(--text-muted)' }}>{format(day, 'EEE').toUpperCase()}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Right arrow */}
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-hover)',
              opacity: weekOffset === 0 ? 0.3 : 1,
              cursor: weekOffset === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => weekOffset !== 0 && (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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
              style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid var(--border)' }}
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
              style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid var(--border)' }}
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
                    ? 'var(--bg-hover)'
                    : isPast
                      ? 'var(--bg-primary)'   // darker for locked past
                      : 'var(--bg-hover)';    // future

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleCellClick(habit._id, dateStr, clickable)}
                    className="flex-1 rounded-lg transition-all duration-200 flex items-center justify-center relative group"
                    style={{
                      height: '38px',
                      minWidth: '44px',
                      background: cellColor,
                      cursor: clickable ? 'pointer' : 'not-allowed',
                      border: isToday(day) && weekOffset === 0
                        ? `1.5px solid ${habit.color}`
                        : '1px solid transparent',
                      opacity: isPast && !done ? 0.45 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (clickable) {
                        e.currentTarget.style.transform = 'scale(0.93)';
                        e.currentTarget.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.opacity = isPast && !done ? '0.45' : '1';
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
                      <Check size={12} color="rgba(255,255,255,0.85)" strokeWidth={3} />
                    ) : isPast ? (
                      <Lock size={9} color="var(--text-muted)" strokeWidth={2} className="opacity-50" />
                    ) : null}
                  </div>
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
