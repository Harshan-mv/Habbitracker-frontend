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
        style={{ height: `${HEADER_HEIGHT}px`, borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="flex-1 text-center">
          <div className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>Current streak</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>Longest</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-[11px] leading-tight" style={{ color: 'var(--text-muted)' }}>Completions</div>
        </div>
      </div>

      {/* ── One stat row per habit – exact ROW_HEIGHT ── */}
      {isLoadingHabits || isLoadingLogs ? (
        // Skeleton loading state
        Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center px-3 gap-2 flex-shrink-0"
            style={{ height: `${ROW_HEIGHT}px`, borderBottom: '1px solid var(--glass-border)' }}
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
                borderBottom: '1px solid var(--glass-border)',
              }}
            >
              {/* Current */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-medium tabular-nums"
                  style={{
                    borderColor: current > 0 ? 'var(--accent)' : 'var(--line)',
                    color: current > 0 ? 'var(--accent)' : 'var(--text-secondary)',
                    background: 'var(--surface-raised)',
                  }}
                >
                  {current}
                </div>
              </div>

              {/* Longest */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-medium tabular-nums"
                  style={{
                    borderColor: 'var(--line)',
                    color: 'var(--text-secondary)',
                    background: 'var(--surface-raised)',
                  }}
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
