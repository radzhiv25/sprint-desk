import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_COLORS } from '@/features/analytics/chartColors';
import type { SprintAnalyticsPoint } from '@/types';

export interface SprintVelocityChartProps {
  data: SprintAnalyticsPoint[];
}

export function SprintVelocityChart({ data }: SprintVelocityChartProps): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="sprintName"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
          formatter={(value, name) => [
            Number(value ?? 0),
            name === 'completedTasks' ? 'Completed' : 'Total',
          ]}
        />
        <Bar
          dataKey="completedTasks"
          name="completedTasks"
          fill={CHART_COLORS.velocity}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="totalTasks"
          name="totalTasks"
          fill={CHART_COLORS.backlog}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
