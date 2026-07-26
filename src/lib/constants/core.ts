export const DASHBOARD_PERIODS = ['7d', '30d', '90d', '6m', '1y', 'ytd', 'custom'] as const;
export type DashboardPeriod = typeof DASHBOARD_PERIODS[number];

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = typeof THEMES[number];
