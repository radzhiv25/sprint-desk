import { PageHeader } from '@/app/layout';
import { ChartCard } from '@/features/analytics/ChartCard';
import { CompletionTrendChart } from '@/features/analytics/charts/CompletionTrendChart';
import { PriorityBreakdownChart } from '@/features/analytics/charts/PriorityBreakdownChart';
import { SprintVelocityChart } from '@/features/analytics/charts/SprintVelocityChart';
import { StatusDistributionChart } from '@/features/analytics/charts/StatusDistributionChart';
import { useAnalyticsData } from '@/features/analytics/useAnalyticsData';

function AnalyticsSkeleton(): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="analytics-skeleton">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-lg border bg-muted/40"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function AnalyticsPage(): JSX.Element {
  const { analytics, isLoading, isError } = useAnalyticsData();

  return (
    <div className="flex h-full w-full flex-col">
      <PageHeader
        title="Analytics"
        subtitle="Sprint metrics derived from live board task data."
      />

      <div className="p-4 sm:p-6">

      {isLoading ? <AnalyticsSkeleton /> : null}

      {isError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load analytics data. Please try again later.
        </p>
      ) : null}

      {!isLoading && analytics ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartCard
            title="Sprint Velocity"
            description="Completed vs total tasks per sprint"
            delay={0.05}
          >
            <SprintVelocityChart data={analytics.sprintVelocity} />
          </ChartCard>

          <ChartCard
            title="Task Status Distribution"
            description="Current task distribution across columns"
            delay={0.1}
          >
            <StatusDistributionChart data={analytics.statusDistribution} />
          </ChartCard>

          <ChartCard
            title="Priority Breakdown"
            description="Tasks grouped by priority level"
            delay={0.15}
          >
            <PriorityBreakdownChart data={analytics.priorityBreakdown} />
          </ChartCard>

          <ChartCard
            title="Completion Trend"
            description="Tasks completed over time"
            delay={0.2}
          >
            {analytics.completionTrend.length > 0 ? (
              <CompletionTrendChart data={analytics.completionTrend} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No completed tasks yet.
              </p>
            )}
          </ChartCard>
        </div>
      ) : null}
      </div>
    </div>
  );
}
