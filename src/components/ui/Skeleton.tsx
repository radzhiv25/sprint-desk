import { cn } from '@/lib/utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-4 w-full rounded-md',
  circular: 'rounded-full',
  rectangular: 'rounded-md',
};

export function Skeleton({
  className,
  variant = 'rectangular',
}: SkeletonProps): JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse bg-muted', variantClasses[variant], className)}
    />
  );
}
