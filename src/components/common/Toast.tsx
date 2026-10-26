import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToastManager, type Toast } from '@/hooks/useToast';

const icons = {
  success: <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />,
  error: <XCircle size={18} className="text-red-500 flex-shrink-0" />,
  info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
};

const styles = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md',
        'animate-slide-up text-sm max-w-sm w-full',
        styles[toast.type],
      )}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 text-gray-800">{toast.message}</p>
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/** Renders the global toast container. Mount once in the app root. */
export function ToastContainer() {
  const { toasts, removeToast } = useToastManager();

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
