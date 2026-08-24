import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { motion, useReducedMotion, type PanInfo } from 'framer-motion';

import { cn } from '@/lib/utils/cn';
import { motionTransition, springGentle } from '@/lib/motion';

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

const SWIPE_DISMISS_OFFSET = 80;
const SWIPE_DISMISS_VELOCITY = 400;

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onDismiss,
  action,
}: ToastProps): JSX.Element {
  const prefersReducedMotion = useReducedMotion();
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

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    if (!onDismiss) return;

    const shouldDismiss =
      info.offset.x > SWIPE_DISMISS_OFFSET || info.velocity.x > SWIPE_DISMISS_VELOCITY;

    if (shouldDismiss) {
      onDismiss(id);
    }
  };

  return (
    <motion.div
      layout={!prefersReducedMotion}
      role="status"
      aria-live="polite"
      drag={prefersReducedMotion ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.05, right: 0.35 }}
      onDragEnd={handleDragEnd}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, x: 120, scale: 0.96 }}
      transition={motionTransition(prefersReducedMotion, springGentle)}
      className={cn(
        'pointer-events-auto w-full max-w-sm cursor-grab rounded-lg border p-4 shadow-sm active:cursor-grabbing',
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
