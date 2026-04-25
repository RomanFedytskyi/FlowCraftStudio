import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { createId } from '@utils/id';

export type ToastTone = 'success' | 'error' | 'default';

export type ToastInput = {
  message: string;
  tone?: ToastTone;
};

type ToastRecord = ToastInput & { id: string };

type ToastContextValue = (toast: ToastInput | string) => void;

const ToastContext = createContext<ToastContextValue>(() => {});

const TOAST_MS = 4200;

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const pushToast = useCallback((input: ToastInput | string) => {
    const toast: ToastRecord =
      typeof input === 'string'
        ? { id: createId('toast'), message: input, tone: 'default' }
        : { id: createId('toast'), tone: 'default', ...input };

    setToasts((current) => [...current, toast]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, TOAST_MS);
  }, []);

  const value = useMemo(() => pushToast, [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[120] flex max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={
              toast.tone === 'success'
                ? 'pointer-events-auto rounded-xl border border-success-soft bg-success-soft px-4 py-3 text-sm font-medium text-success-text shadow-floating'
                : toast.tone === 'error'
                  ? 'pointer-events-auto rounded-xl border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-medium text-danger-text shadow-floating'
                  : 'pointer-events-auto rounded-xl border border-border bg-background-elevated px-4 py-3 text-sm font-medium text-text shadow-floating'
            }
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- paired hook + provider
export function useToast() {
  return useContext(ToastContext);
}
