import { Check, X } from 'lucide-react';
import useToastStore from '../store/useToastStore';

export default function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast"
          data-tone={toast.tone}
          role={toast.tone === 'error' ? 'alert' : 'status'}
        >
          <div className="flex items-start gap-2">
            {toast.tone === 'success' && <Check size={16} aria-hidden="true" />}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            className="finance-icon-btn muted -my-1 -me-2"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(toast.id)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
