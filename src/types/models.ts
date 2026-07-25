import { Enums, Tables } from './database.types';

export type UserPreference = Tables<'user_preferences'>;
export type Profile = Tables<'profiles'>;
export type Currency = Tables<'currencies'>;
export type Language = Tables<'languages'>;
export type Wallet = Tables<'wallets'>;
export type WalletWithBalance = Wallet & {
  balance?: number;
};
export type Category = Tables<'categories'>;
export type Tag = Tables<'tags'>;
export type Transaction = Tables<'transactions'>;
export type CategoryWithChildren = Category & {
  children?: Category[];
};

export type AppThemeType = Enums<'app_theme_type'>;
export type AppDateFormatType = Enums<'app_date_format_type'>;
export type DashboardRangeType = Enums<'dashboard_range_type'>;
export type WalletType = Enums<'wallet_type'>;
