import { ArrowDown, Equal, Flame } from 'lucide-react';

import type { Priority } from '@/types';

const PRIORITY_ICON_MAP: Record<Priority, typeof Flame> = {
  high: Flame,
  medium: Equal,
  low: ArrowDown,
};

export interface PriorityIconProps {
  priority: Priority;
  className?: string;
}

export function PriorityIcon({ priority, className = 'h-3 w-3' }: PriorityIconProps): JSX.Element {
  const Icon = PRIORITY_ICON_MAP[priority];
  return <Icon className={className} aria-hidden="true" />;
}
