import { CHART_FONTS } from '@/lib/chartTheme';
import type { ChartPalette } from '@/lib/chartTheme';

export interface ChartTooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: ChartTooltipEntry[];
  palette: ChartPalette;
  valueFormatter?: (value: number, name: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  palette,
  valueFormatter,
}: ChartTooltipProps): JSX.Element | null {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className="rounded-md px-3 py-2"
      style={{
        backgroundColor: palette.tooltipBg,
        border: `1px solid ${palette.tooltipBorder}`,
        color: palette.tooltipText,
        fontFamily: CHART_FONTS.sans,
        fontSize: '0.8125rem',
      }}
    >
      {label ? (
        <p
          className="mb-1.5"
          style={{
            color: palette.tooltipMuted,
            fontFamily: CHART_FONTS.mono,
            fontSize: '0.6875rem',
          }}
        >
          {label}
        </p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((entry) => {
          const name = String(entry.name ?? '');
          const rawValue = Number(entry.value ?? 0);
          const displayValue = valueFormatter
            ? valueFormatter(rawValue, name)
            : String(rawValue);

          return (
            <li key={name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: entry.color ?? palette.accent }}
                  aria-hidden
                />
                <span style={{ color: palette.tooltipMuted }}>{name}</span>
              </span>
              <span
                style={{
                  fontFamily: CHART_FONTS.mono,
                  fontWeight: 500,
                  color: palette.tooltipText,
                }}
              >
                {displayValue}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
