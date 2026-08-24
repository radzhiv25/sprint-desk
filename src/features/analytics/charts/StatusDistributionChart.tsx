import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ChartLegend } from '@/features/analytics/ChartLegend';
import { ChartTooltip } from '@/features/analytics/ChartTooltip';
import {
  CHART_FONTS,
  CHART_MARGINS,
  getChartPalette,
  getStatusColor,
} from '@/lib/chartTheme';
import { useThemeStore } from '@/store/themeStore';
import type { TaskStatusDistribution } from '@/types';

export interface StatusDistributionChartProps {
  data: TaskStatusDistribution[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps): JSX.Element {
  const theme = useThemeStore((state) => state.theme);
  const palette = getChartPalette(theme);
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart margin={CHART_MARGINS.pie}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="44%"
          innerRadius={68}
          outerRadius={104}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={getStatusColor(entry.status, palette)} />
          ))}
        </Pie>
        <text
          x="50%"
          y="42%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: CHART_FONTS.mono,
            fontSize: '1.5rem',
            fontWeight: 600,
            fill: palette.tooltipText,
          }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: CHART_FONTS.sans,
            fontSize: '0.6875rem',
            fill: palette.axis,
          }}
        >
          tasks
        </text>
        <Tooltip
          content={<ChartTooltip palette={palette} />}
          labelFormatter={(label) => String(label)}
        />
        <Legend verticalAlign="bottom" content={(props) => <ChartLegend payload={props.payload} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
