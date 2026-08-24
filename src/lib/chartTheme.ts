import type { CSSProperties } from 'react';

/** Frozen brand palette — see PROGRESS.md visual identity entry. */
export const CHART_BRAND = {
  paper: '#FAF8F5',
  charcoal: '#1A1816',
  ink: '#211F1C',
  offWhite: '#EDE9E4',
  accent: '#BF4A2E',
  accentMid: '#D4745C',
  warmSand: '#E8D5C4',
  neutral: '#8A8580',
  neutralLight: '#C4BFB8',
  neutralMuted: '#6B6560',
} as const;

export const CHART_FONTS = {
  display: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export interface ChartPalette {
  accent: string;
  accentMid: string;
  warmSand: string;
  neutral: string;
  neutralLight: string;
  neutralMuted: string;
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipMuted: string;
}

export function getChartPalette(theme: 'light' | 'dark'): ChartPalette {
  if (theme === 'dark') {
    return {
      accent: CHART_BRAND.accent,
      accentMid: CHART_BRAND.accentMid,
      warmSand: '#4A4038',
      neutral: CHART_BRAND.neutral,
      neutralLight: '#3D3834',
      neutralMuted: CHART_BRAND.neutralMuted,
      grid: '#2E2A27',
      axis: CHART_BRAND.neutral,
      tooltipBg: '#242120',
      tooltipBorder: '#3D3834',
      tooltipText: CHART_BRAND.offWhite,
      tooltipMuted: CHART_BRAND.neutral,
    };
  }

  return {
    accent: CHART_BRAND.accent,
    accentMid: CHART_BRAND.accentMid,
    warmSand: CHART_BRAND.warmSand,
    neutral: CHART_BRAND.neutral,
    neutralLight: CHART_BRAND.neutralLight,
    neutralMuted: CHART_BRAND.neutralMuted,
    grid: '#E8E4DE',
    axis: CHART_BRAND.neutralMuted,
    tooltipBg: CHART_BRAND.paper,
    tooltipBorder: '#E0DBD4',
    tooltipText: CHART_BRAND.ink,
    tooltipMuted: CHART_BRAND.neutral,
  };
}

/** Neutral scale for non-accent series (backlog → review). */
export const STATUS_NEUTRAL_SCALE = [
  CHART_BRAND.neutralLight,
  CHART_BRAND.neutral,
  CHART_BRAND.neutralMuted,
] as const;

export function getStatusColor(statusLabel: string, palette: ChartPalette): string {
  if (statusLabel === 'Done') {
    return palette.accent;
  }

  const neutralOrder = ['Backlog', 'In Progress', 'Review'];
  const index = neutralOrder.indexOf(statusLabel);
  return STATUS_NEUTRAL_SCALE[index >= 0 ? index : 0] ?? palette.neutralLight;
}

export function getPriorityColor(priority: string, palette: ChartPalette): string {
  switch (priority) {
    case 'high':
      return palette.accent;
    case 'medium':
      return palette.accentMid;
    default:
      return palette.neutral;
  }
}

export function getAxisTickProps(palette: ChartPalette): {
  fontSize: number;
  fill: string;
  fontFamily: string;
} {
  return {
    fontSize: 10,
    fill: palette.axis,
    fontFamily: CHART_FONTS.mono,
  };
}

export function getAxisLabelStyle(palette: ChartPalette): CSSProperties {
  return {
    fontSize: 10,
    fill: palette.axis,
    fontFamily: CHART_FONTS.mono,
  };
}

export const CHART_MARGINS = {
  default: { top: 8, right: 12, left: 0, bottom: 8 },
  pie: { top: 8, right: 8, left: 8, bottom: 8 },
} as const;

export const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
export const BAR_RADIUS_HORIZONTAL: [number, number, number, number] = [0, 4, 4, 0];
