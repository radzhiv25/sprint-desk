/** @deprecated Import from @/lib/chartTheme instead. Kept for backward compatibility. */
export {
  CHART_BRAND as CHART_COLORS,
  getChartPalette,
  getPriorityColor,
  getStatusColor,
  STATUS_NEUTRAL_SCALE as STATUS_COLORS,
} from '@/lib/chartTheme';

import { getChartPalette } from '@/lib/chartTheme';

const lightPalette = getChartPalette('light');

export const PRIORITY_COLORS: Record<string, string> = {
  low: lightPalette.neutral,
  medium: lightPalette.accentMid,
  high: lightPalette.accent,
};
