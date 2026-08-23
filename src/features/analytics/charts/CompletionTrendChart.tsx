import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_COLORS } from '@/features/analytics/chartColors';
import type { CompletionTrendPoint } from '@/types';

export interface CompletionTrendChartProps {
  data: CompletionTrendPoint[];
}

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps): JSX.Element {
  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
          labelFormatter={(_, payload) => {
            const item = payload[0]?.payload as CompletionTrendPoint | undefined;
            return item?.date ?? '';
          }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke={CHART_COLORS.trend}
          strokeWidth={2}
          dot={{ r: 4, fill: CHART_COLORS.trend }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
