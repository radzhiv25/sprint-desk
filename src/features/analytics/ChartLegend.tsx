export interface ChartLegendItem {
  value?: string | number;
  color?: string;
}

export interface ChartLegendProps {
  payload?: readonly ChartLegendItem[];
}

export function ChartLegend({ payload }: ChartLegendProps): JSX.Element | null {
  if (!payload?.length) {
    return null;
  }

  return (
    <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
      {payload.map((entry) => (
        <li key={`${String(entry.value)}-${entry.color}`} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: entry.color }}
            aria-hidden
          />
          <span className="text-xs font-mono text-muted-foreground">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}
