import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { STATUS_COLORS } from '@/features/analytics/chartColors';
import type { TaskStatusDistribution } from '@/types';

export interface StatusDistributionChartProps {
  data: TaskStatusDistribution[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.status} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
