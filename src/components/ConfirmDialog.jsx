import { useEffect, useId, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function ConfirmDialog({
  title,
  itemName,
  triggerElement,
  fallbackFocusRef,
  onCancel,
  onConfirm,
}) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const loadingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const id = useId();

  useEffect(() => {
    const fallbackFocusElement = fallbackFocusRef?.current;
    cancelButtonRef.current?.focus();
    return () => {
      const target = triggerElement?.isConnected ? triggerElement : fallbackFocusElement;
      target?.focus();
    };
  }, [fallbackFocusRef, triggerElement]);

  const handleClose = () => {
    if (!loadingRef.current) onCancel();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!dialogRef.current.contains(document.activeElement)) {
      event.preventDefault();
      cancelButtonRef.current?.focus();
    }
  };

  const handleConfirm = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setErrorMessage('');
    try {
      await onConfirm();
      onCancel();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error
          || error.response?.data?.message
          || error.message
          || 'Could not delete this item. Try again.',
      );
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
      onClick={(event) => event.target === event.currentTarget && handleClose()}
    >
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onKeyDown={handleKeyDown}
        className="app-panel w-full max-w-md bg-[var(--surface)] p-5 shadow-[var(--shadow-raised)] sm:p-6"
      >
        <h2 id={`${id}-title`} className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <p id={`${id}-description`} className="mt-2 text-sm text-[var(--text-secondary)]">
          Delete “{itemName}”? This cannot be undone.
        </p>
        {errorMessage && (
          <p className="status-message mt-4" data-tone="error" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            autoFocus
            disabled={loading}
            onClick={handleClose}
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-4 text-sm font-medium text-[var(--text-secondary)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            aria-busy={loading}
            onClick={handleConfirm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--danger-button-bg)] px-4 text-sm font-medium text-[var(--danger-button-text)] disabled:cursor-wait disabled:opacity-70"
          >
            {loading && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </section>
    </div>
  );
}
