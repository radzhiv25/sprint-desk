import {
  Area,
  AreaChart,
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
  CHART_MARGINS,
  getAxisTickProps,
  getChartPalette,
} from '@/lib/chartTheme';
import { useThemeStore } from '@/store/themeStore';
import type { CompletionTrendPoint } from '@/types';

export interface CompletionTrendChartProps {
  data: CompletionTrendPoint[];
}

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps): JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const palette = getChartPalette(theme);
  const tickProps = getAxisTickProps(palette);
  const gradientId = 'completion-trend-gradient';

  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={CHART_MARGINS.default}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={palette.grid} strokeDasharray="4 6" />
        <XAxis dataKey="label" tick={tickProps} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={tickProps} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          content={<ChartTooltip palette={palette} />}
          labelFormatter={(_, payload) => {
            const item = payload?.[0]?.payload as CompletionTrendPoint | undefined;
            return item?.date ?? '';
          }}
        />
        <Area
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke={palette.accent}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: palette.accent, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: palette.accent, strokeWidth: 0 }}
        />
        <Legend verticalAlign="bottom" content={(props) => <ChartLegend payload={props.payload} />} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
