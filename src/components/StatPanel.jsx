import useStore from '../store/useStore';
import { calculateStreaks } from '../utils/streakLogic';
import Skeleton from './Skeleton';

const ROW_HEIGHT = 56;   // must match HabitList & HeatmapGrid
const HEADER_HEIGHT = 58;
const FOOTER_HEIGHT = 40;

export default function StatPanel() {
  const { habits, logs, isLoadingHabits, isLoadingLogs } = useStore();

  return (
    <div className="flex flex-col h-full" style={{ minWidth: '185px' }}>

      {/* ── Header – exact same height as date-header row ── */}
      <div
        className="flex items-end pb-3 px-3 gap-2"
        style={{ height: `${HEADER_HEIGHT}px`, borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex-1 text-center">
          <div className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>current</div>
          <div className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-secondary)' }}>streak</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>longest</div>
          <div className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-secondary)' }}>streak</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>total</div>
          <div className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-secondary)' }}>count</div>
        </div>
      </div>

      {/* ── One stat row per habit – exact ROW_HEIGHT ── */}
      {isLoadingHabits || isLoadingLogs ? (
        // Skeleton loading state
        Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center px-3 gap-2 flex-shrink-0"
            style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex-1 flex items-center justify-center">
              <Skeleton variant="circle" width="32px" height="32px" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Skeleton variant="circle" width="32px" height="32px" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Skeleton width="20px" height="14px" />
            </div>
          </div>
        ))
      ) : (
        habits.map((habit) => {
          const { current, longest, total } = calculateStreaks(logs, habit._id);
          return (
            <div
              key={habit._id}
              className="flex items-center px-3 gap-2 flex-shrink-0"
              style={{
                height: `${ROW_HEIGHT}px`,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {/* Current */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: habit.color, color: habit.color }}
                >
                  {current}
                </div>
              </div>

              {/* Longest */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: habit.color, color: habit.color }}
                >
                  {longest}
                </div>
              </div>

              {/* Total */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {total}
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* ── Footer spacer – same height as count row ── */}
      <div style={{ height: `${FOOTER_HEIGHT}px` }} />
    </div>
  );
}
