import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import useStore from '../store/useStore';
import AddHabitModal from './AddHabitModal';
import Skeleton from './Skeleton';

export default function HabitList() {
  const { habits, deleteHabit, isLoadingHabits, habitsError } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async (id) => {
    setDeleteError('');
    try {
      await deleteHabit(id);
      setConfirmDelete(null);
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Could not remove this habit. Try again.');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ minWidth: '180px' }}>
      {/* Header row - aligns with heatmap date header */}
      <div className="pb-3 flex items-end" style={{ height: '58px' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        Habits
        </span>
      </div>

      {/* Habit rows */}
      <div className="flex-1">
        {isLoadingHabits ? (
          // Skeleton loading state
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2 py-3"
              style={{ borderBottom: '1px solid var(--glass-border)', height: '56px' }}
            >
              <Skeleton variant="circle" width="12px" height="12px" className="flex-shrink-0" />
              <Skeleton width="100px" height="14px" />
            </div>
          ))
        ) : (
          habits.map((habit) => (
            <div
              key={habit._id}
              className="group flex items-center gap-2 py-3 transition-colors hover:bg-[var(--surface-raised)]"
              style={{ borderBottom: '1px solid var(--glass-border)', height: '56px' }}
            >
              {/* Color dot + name */}
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: habit.color }}
                />
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {habit.name}
                </span>
              </div>

              {/* Actions remain available on touch screens and keyboard focus. */}
              <div className="flex gap-1 opacity-100 md:opacity-70 md:group-hover:opacity-100 flex-shrink-0">
                <button
                  onClick={() => { setEditingHabit(habit); setShowModal(true); }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
                  title="Edit habit"
                  aria-label={`Edit ${habit.name}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setConfirmDelete(habit._id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--negative)]"
                  title="Delete habit"
                  aria-label={`Delete ${habit.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Confirm delete */}
              {confirmDelete === habit._id && (
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(habit._id)}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ background: 'var(--negative)', color: '#fff' }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {!isLoadingHabits && !habitsError && habits.length === 0 && (
          <div className="py-8 text-sm text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">No habits yet</p>
            <p className="mt-1 text-xs">Add one to start your daily record</p>
          </div>
        )}
        {deleteError && <p className="mt-2 text-xs text-[var(--negative)]" role="alert">{deleteError}</p>}
      </div>

      {/* Add new habit button */}
      <div className="pt-2 pb-1" style={{ height: '40px' }}>
        <button
          onClick={() => { setEditingHabit(null); setShowModal(true); }}
          className="flex min-h-9 items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
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
