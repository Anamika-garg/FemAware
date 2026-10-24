import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    container: 'border-[#B7E4C7] bg-white',
    iconClass: 'text-[#2E7D5B]',
    title: 'text-[#1F5C43]',
  },
  error: {
    icon: AlertCircle,
    container: 'border-blush-pink bg-white',
    iconClass: 'text-deep-rose',
    title: 'text-deep-rose',
  },
  info: {
    icon: Info,
    container: 'border-blush-pink bg-white',
    iconClass: 'text-rose-pink',
    title: 'text-deep-rose',
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'success', duration = 4500 }) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { id, title, message, type }]);
      if (duration > 0) {
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, duration);
      }
      return id;
    },
    []
  );

  const value = useMemo(() => ({ addToast, dismiss }), [addToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-card animate-fade-up ${style.container}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${style.title}`}>{toast.title}</p>
                {toast.message ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted">{toast.message}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-lg p-1 text-muted transition-colors hover:bg-rose-mist hover:text-deep-rose"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
