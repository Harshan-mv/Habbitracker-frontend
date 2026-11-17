import useFinanceStore from '../../store/useFinanceStore';

export default function FinanceNoteSection() {
  const { monthData, updateNote, isSaving, financeError } = useFinanceStore();

  return (
    <section className="app-surface p-4 sm:p-5" aria-labelledby="finance-note-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id="finance-note-heading" className="text-sm font-medium text-[var(--text-primary)]">Monthly note</h3>
        <span className="text-xs text-[var(--text-muted)]" aria-live="polite">
          {isSaving ? 'Saving' : financeError ? 'Not saved' : 'Auto-saves'}
        </span>
      </div>
      <label htmlFor="finance-note" className="sr-only">Notes for this month’s finances</label>
      <textarea
        id="finance-note"
        className="min-h-32 w-full resize-y rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] p-3 text-sm text-[var(--text-primary)]"
        placeholder="Add a note about this month’s plan"
        value={monthData.note || ''}
        maxLength={2000}
        onChange={(event) => updateNote(event.target.value)}
      />
      {financeError?.includes('monthly notes') && (
        <p className="mt-2 text-xs text-[var(--negative)]" role="status">{financeError}</p>
      )}
    </section>
  );
}
