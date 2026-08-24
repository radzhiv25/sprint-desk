import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartLegend } from '@/features/analytics/ChartLegend';
import { ChartTooltip } from '@/features/analytics/ChartTooltip';
import { PRIORITY_LABELS } from '@/features/board/utils/taskDisplay';
import {
  BAR_RADIUS_HORIZONTAL,
  CHART_MARGINS,
  getAxisTickProps,
  getChartPalette,
  getPriorityColor,
} from '@/lib/chartTheme';
import { useThemeStore } from '@/store/themeStore';
import type { PriorityBreakdown } from '@/types';

export interface PriorityBreakdownChartProps {
  data: PriorityBreakdown[];
}

export function PriorityBreakdownChart({ data }: PriorityBreakdownChartProps): JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const palette = getChartPalette(theme);
  const tickProps = getAxisTickProps(palette);

  const legendPayload = data.map((entry) => ({
    value: PRIORITY_LABELS[entry.priority as keyof typeof PRIORITY_LABELS] ?? entry.priority,
    color: getPriorityColor(entry.priority, palette),
    type: 'square' as const,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={CHART_MARGINS.pie}>
        <CartesianGrid horizontal={false} stroke={palette.grid} strokeDasharray="4 6" />
        <XAxis type="number" allowDecimals={false} tick={tickProps} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="priority"
          tick={tickProps}
          width={72}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip palette={palette} />} />
        <Bar dataKey="count" radius={BAR_RADIUS_HORIZONTAL}>
          {data.map((entry) => (
            <Cell key={entry.priority} fill={getPriorityColor(entry.priority, palette)} />
          ))}
        </Bar>
        <Legend verticalAlign="bottom" content={() => <ChartLegend payload={legendPayload} />} />
      </BarChart>
    </ResponsiveContainer>
  );
}
