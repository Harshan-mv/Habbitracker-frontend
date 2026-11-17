import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import useFinanceStore from '../../store/useFinanceStore';

export default function CategoryManager() {
  const {
    isLoadingCategories,
    categoriesError,
    getCategoryOptions,
    addCategory,
    deleteCategory,
  } = useFinanceStore();
  const [kind, setKind] = useState('expense');
  const [name, setName] = useState('');
  const [color, setColor] = useState('#789b68');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const options = getCategoryOptions(kind);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setFormError('Enter a category name.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await addCategory({ kind, name: name.trim(), color });
      setName('');
    } catch (error) {
      setFormError(error.response?.data?.error || 'Could not add this category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="app-surface p-4 sm:p-5" aria-labelledby="category-manager-heading">
      <div className="mb-4">
        <h3 id="category-manager-heading" className="text-sm font-medium text-[var(--text-primary)]">Income and expense categories</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Add labels for your source types and spending</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] p-1" role="group" aria-label="Category kind">
        {['expense', 'income'].map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={kind === option}
            onClick={() => setKind(option)}
            className={`min-h-9 rounded-[6px] text-sm capitalize transition-colors ${kind === option ? 'bg-[var(--surface)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            {option}
          </button>
        ))}
      </div>

      {categoriesError && <p className="mb-3 text-sm text-[var(--negative)]" role="alert">{categoriesError}</p>}
      {isLoadingCategories ? (
        <p className="py-3 text-sm text-[var(--text-muted)]" role="status">Loading categories</p>
      ) : (
        <ul className="mb-4 space-y-2" aria-label={`${kind} categories`}>
          {options.map((category) => (
            <li key={category._id || `${kind}-${category.name}`} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
              <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--text-secondary)]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: category.color }} aria-hidden="true" />
                <span className="truncate">{category.name}</span>
                {!category.isCustom && <span className="text-xs text-[var(--text-muted)]">Built in</span>}
              </span>
              {category.isCustom && (
                <button type="button" className="finance-icon-btn red h-8 w-8" aria-label={`Delete ${category.name} category`} onClick={() => deleteCategory(category._id)}>
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-2 border-t border-[var(--line)] pt-4">
        <label className="min-w-32 flex-1 text-xs text-[var(--text-secondary)]">
          New {kind} type
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} className="finance-input mt-1 w-full" placeholder={kind === 'expense' ? 'For example, Pet care' : 'For example, Freelance'} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-[var(--text-secondary)]">
          Color
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-9 w-12 cursor-pointer rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] p-1" aria-label="Category color" />
        </label>
        <button type="submit" disabled={saving} className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-ink)] disabled:opacity-60">
          <Plus size={15} aria-hidden="true" /> Add
        </button>
        {formError && <p className="w-full text-xs text-[var(--negative)]" role="alert">{formError}</p>}
      </form>
    </section>
  );
}
