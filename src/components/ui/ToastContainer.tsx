import { AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useToastStore } from '@/hooks/useToast';

export function ToastContainer(): JSX.Element | null {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <Toast
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            variant={item.variant}
            duration={item.duration}
            onDismiss={dismiss}
            action={
              item.action ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    item.action?.onClick();
                    dismiss(item.id);
                  }}
                >
                  {item.action.label}
                </Button>
              ) : undefined
            }
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
