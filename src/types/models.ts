import { Tables, Enums } from './database.types';

export type UserPreference = Tables<'user_preferences'>;
export type Profile = Tables<'profiles'>;
export type Currency = Tables<'currencies'>;
export type Language = Tables<'languages'>;

export type AppThemeType = Enums<'app_theme_type'>;
export type AppDateFormatType = Enums<'app_date_format_type'>;
export type DashboardRangeType = Enums<'dashboard_range_type'>;
