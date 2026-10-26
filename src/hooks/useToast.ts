import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let externalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

/** Call this to show a toast from outside React components (e.g., services). */
export function showToast(type: ToastType, message: string): void {
  externalAddToast?.({ type, message });
}

export function useToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register the external caller
  useEffect(() => {
    externalAddToast = addToast;
    return () => { externalAddToast = null; };
  }, [addToast]);

  return { toasts, addToast, removeToast };
}

export function useToast() {
  const addToast = useCallback((type: ToastType, message: string) => {
    showToast(type, message);
  }, []);

  return {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
  };
}

export const useNotify = useToast;
