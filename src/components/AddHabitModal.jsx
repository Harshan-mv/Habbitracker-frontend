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
  const { addHabit, updateHabit } = useStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (existingHabit) {
        await updateHabit(existingHabit._id, name.trim(), color);
      } else {
        await addHabit(name.trim(), color);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          {existingHabit ? 'Edit Habit' : 'New Habit'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wake up @6, Running, Read..."
              autoFocus
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onFocus={(e) => e.target.style.borderColor = color}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2.5" style={{ color: 'var(--text-secondary)' }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center"
                  style={{
                    background: c,
                    transform: color === c ? 'scale(1.25)' : 'scale(1)',
                    boxShadow: color === c ? `0 0 0 2px var(--bg-card), 0 0 0 4px ${c}` : 'none',
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

          {/* Preview */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {name || 'Habit preview'}
            </span>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: color, color: '#fff', opacity: loading || !name.trim() ? 0.6 : 1 }}
            >
              {loading ? 'Saving…' : existingHabit ? 'Update' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
