import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import useStore from '../store/useStore';
import AddHabitModal from './AddHabitModal';

export default function HabitList() {
  const { habits, deleteHabit } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (id) => {
    await deleteHabit(id);
    setConfirmDelete(null);
  };

  return (
    <div className="flex flex-col h-full" style={{ minWidth: '180px' }}>
      {/* Header row - aligns with heatmap date header */}
      <div className="pb-3 flex items-end" style={{ height: '58px' }}>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          ALL HABITS
        </span>
      </div>

      {/* Habit rows */}
      <div className="flex-1">
        {habits.map((habit) => (
          <div
            key={habit._id}
            className="flex items-center gap-2 group py-3"
            style={{ borderBottom: '1px solid var(--border)', height: '56px' }}
          >
            {/* Color dot + name */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: habit.color }} />
              <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {habit.name}
              </span>
            </div>

            {/* Action buttons - visible on hover */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
              <button
                onClick={() => { setEditingHabit(habit); setShowModal(true); }}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = habit.color}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                title="Edit habit"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setConfirmDelete(habit._id)}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                title="Delete habit"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Confirm delete */}
            {confirmDelete === habit._id && (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleDelete(habit._id)}
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  No
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new habit button */}
      <div className="pt-2 pb-1" style={{ height: '40px' }}>
        <button
          onClick={() => { setEditingHabit(null); setShowModal(true); }}
          className="flex items-center gap-1.5 text-sm transition-colors duration-150"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Plus size={14} />
          New Habit
        </button>
      </div>

      {showModal && (
        <AddHabitModal
          existingHabit={editingHabit}
          onClose={() => { setShowModal(false); setEditingHabit(null); }}
        />
      )}
    </div>
  );
}
