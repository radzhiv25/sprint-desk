import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartLegend } from '@/features/analytics/ChartLegend';
import { ChartTooltip } from '@/features/analytics/ChartTooltip';
import {
  BAR_RADIUS,
  CHART_MARGINS,
  getAxisTickProps,
  getChartPalette,
} from '@/lib/chartTheme';
import { useThemeStore } from '@/store/themeStore';
import type { SprintAnalyticsPoint } from '@/types';

export interface SprintVelocityChartProps {
  data: SprintAnalyticsPoint[];
}

export function SprintVelocityChart({ data }: SprintVelocityChartProps): JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const palette = getChartPalette(theme);
  const tickProps = getAxisTickProps(palette);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={CHART_MARGINS.default}>
        <CartesianGrid vertical={false} stroke={palette.grid} strokeDasharray="4 6" />
        <XAxis
          dataKey="sprintName"
          tick={tickProps}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={tickProps}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<ChartTooltip palette={palette} />} />
        <Bar dataKey="completedTasks" name="Completed" fill={palette.accent} radius={BAR_RADIUS} />
        <Bar dataKey="totalTasks" name="Total" fill={palette.neutralLight} radius={BAR_RADIUS} />
        <Legend verticalAlign="bottom" content={(props) => <ChartLegend payload={props.payload} />} />
      </BarChart>
    </ResponsiveContainer>
  );
}
