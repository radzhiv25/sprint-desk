import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { PRIORITY_COLORS } from '@/features/analytics/chartColors';
import type { PriorityBreakdown } from '@/types';

export interface PriorityBreakdownChartProps {
  data: PriorityBreakdown[];
}

export function PriorityBreakdownChart({ data }: PriorityBreakdownChartProps): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="priority"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground capitalize"
          width={72}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
