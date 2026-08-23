import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils/cn';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: (id: string) => void;
  action?: React.ReactNode;
}

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-border bg-card text-card-foreground',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-50',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  warning:
    'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50',
};

const variantIcons: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertCircle,
};

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onDismiss,
  action,
}: ToastProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const Icon = variantIcons[variant];

  useEffect(() => {
    if (!onDismiss || duration <= 0) return;

    const timer = window.setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [duration, id, onDismiss]);

  return (
    <motion.div
      layout={!shouldReduceMotion}
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-sm',
        variantClasses[variant],
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          {title ? <p className="text-sm font-medium">{title}</p> : null}
          {description ? <p className="mt-1 text-sm opacity-90">{description}</p> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label="Dismiss notification"
            className="rounded-md p-1 text-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => onDismiss(id)}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </motion.div>
  );
}
