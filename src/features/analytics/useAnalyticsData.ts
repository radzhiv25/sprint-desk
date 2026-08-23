import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { computeAnalytics } from '@/features/analytics/analytics.selectors';
import type { AnalyticsData } from '@/features/analytics/analytics.selectors';
import { analyticsQueryKeys } from '@/services/analytics.queryKeys';
import { fetchSprints, fetchTasks } from '@/services/analytics.service';
import { useBoardStore } from '@/store/boardStore';

export interface UseAnalyticsDataResult {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  isError: boolean;
}

export function useAnalyticsData(): UseAnalyticsDataResult {
  const columns = useBoardStore((state) => state.columns);

  const tasksQuery = useQuery({
    queryKey: analyticsQueryKeys.tasks(),
    queryFn: () => fetchTasks(30),
  });

  const sprintsQuery = useQuery({
    queryKey: analyticsQueryKeys.sprints(),
    queryFn: fetchSprints,
  });

  const analytics = useMemo(() => {
    if (!tasksQuery.data || !sprintsQuery.data) return null;
    return computeAnalytics(tasksQuery.data, sprintsQuery.data, columns);
  }, [tasksQuery.data, sprintsQuery.data, columns]);

  return {
    analytics,
    isLoading: tasksQuery.isLoading || sprintsQuery.isLoading,
    isError: tasksQuery.isError || sprintsQuery.isError,
  };
}
