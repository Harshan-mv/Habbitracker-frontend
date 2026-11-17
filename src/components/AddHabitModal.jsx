import { useState } from 'react';
import useStore from '../store/useStore';

const PRESET_COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#22c55e', // green
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#ef4444', // red
];

export default function AddHabitModal({ onClose, existingHabit }) {
  const [name, setName] = useState(existingHabit?.name || '');
  const [color, setColor] = useState(existingHabit?.color || PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addHabit, updateHabit } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      if (existingHabit) {
        await updateHabit(existingHabit._id, name.trim(), color);
      } else {
        await addHabit(name.trim(), color);
      }
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save this habit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        background: 'rgba(0,0,0,0.58)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-dialog-title"
        className="app-panel mx-4 w-full max-w-md p-5 sm:p-7"
        style={{
          background: 'var(--surface)',
        }}
      >
        <h2 id="habit-dialog-title" className="mb-5 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          {existingHabit ? 'Edit habit' : 'New habit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="habit-name" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Habit name</label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wake up @6, Running, Read..."
              autoFocus
              required
              className="w-full rounded-[var(--radius-control)] px-3 py-3 text-sm outline-none transition-colors"
              style={{
                border: '1px solid var(--glass-border)',
                background: 'var(--surface-raised)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = color;
                e.target.style.boxShadow = 'var(--focus-ring)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--glass-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <p className="mb-2.5 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Marker color</p>
            <div className="flex gap-3 flex-wrap p-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Choose ${c} marker`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition-colors"
                  style={{
                    background: c,
                    outline: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  {color === c && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview – glass */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {name || 'Habit preview'}
            </span>
          </div>

          {error && <div className="status-message" data-tone="error" role="alert">{error}</div>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 flex-1 rounded-[var(--radius-control)] py-2 text-sm font-medium transition-colors"
              style={{
                background: 'var(--surface-raised)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="min-h-11 flex-1 rounded-[var(--radius-control)] py-2 text-sm font-semibold transition-colors"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-ink)',
                opacity: loading || !name.trim() ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving…' : existingHabit ? 'Update' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
