export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      auth_providers: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          category_description: string | null
          category_id: string
          category_name: string
          color: string | null
          created_at: string
          icon: string | null
          is_active: boolean
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_description?: string | null
          category_id?: string
          category_name: string
          color?: string | null
          created_at?: string
          icon?: string | null
          is_active?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_description?: string | null
          category_id?: string
          category_name?: string
          color?: string | null
          created_at?: string
          icon?: string | null
          is_active?: boolean
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
        ]
      }
      currencies: {
        Row: {
          created_at: string
          is_default: boolean
          is_enabled: boolean
          iso_code: string
          iso_numeric: string
          name: string
          sort_order: number
          start_date: string
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          is_default?: boolean
          is_enabled?: boolean
          iso_code: string
          iso_numeric: string
          name: string
          sort_order?: number
          start_date: string
          symbol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          is_default?: boolean
          is_enabled?: boolean
          iso_code?: string
          iso_numeric?: string
          name?: string
          sort_order?: number
          start_date?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          base_currency: string
          created_at: string
          date: string
          quote_currency: string
          rate: number
        }
        Insert: {
          base_currency: string
          created_at?: string
          date: string
          quote_currency: string
          rate: number
        }
        Update: {
          base_currency?: string
          created_at?: string
          date?: string
          quote_currency?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_base_currency_fkey"
            columns: ["base_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["iso_code"]
          },
          {
            foreignKeyName: "exchange_rates_quote_currency_fkey"
            columns: ["quote_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["iso_code"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          icon: string
          is_default: boolean
          is_enabled: boolean
          iso_code: string
          locale: string
          name: string
          native_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon: string
          is_default?: boolean
          is_enabled?: boolean
          iso_code: string
          locale: string
          name: string
          native_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          is_default?: boolean
          is_enabled?: boolean
          iso_code?: string
          locale?: string
          name?: string
          native_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          is_active: boolean
          tag_description: string | null
          tag_id: string
          tag_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          is_active?: boolean
          tag_description?: string | null
          tag_id?: string
          tag_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          is_active?: boolean
          tag_description?: string | null
          tag_id?: string
          tag_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          currency_code: string
          date: string
          description: string
          exchange_rate: number
          normalized_amount: number
          transaction_id: string
          updated_at: string
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          currency_code: string
          date: string
          description: string
          exchange_rate?: number
          normalized_amount: number
          transaction_id?: string
          updated_at?: string
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency_code?: string
          date?: string
          description?: string
          exchange_rate?: number
          normalized_amount?: number
          transaction_id?: string
          updated_at?: string
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "transactions_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["iso_code"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_tags: {
        Row: {
          created_at: string
          tag_id: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tag_id: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          tag_id?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["tag_id"]
          },
          {
            foreignKeyName: "transactions_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["transaction_id"]
          },
        ]
      }
      user_auth_providers: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          provider_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          provider_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_auth_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "auth_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          biometric_lock_enabled: boolean
          budget_alert_threshold: number
          created_at: string
          date_format: Database["public"]["Enums"]["app_date_format_type"]
          default_dashboard_range: Database["public"]["Enums"]["dashboard_range_type"]
          language_locale: string
          lock_timeout_seconds: number
          notify_budget_breach: boolean
          notify_recurring_reminder: boolean
          primary_currency_code: string | null
          profile_id: string
          theme: Database["public"]["Enums"]["app_theme_type"]
          theme_base_color: string
          theme_body_font: string
          theme_chart_color: string
          theme_heading_font: string
          theme_primary_color: string
          theme_radius: number
          theme_style: string
          timezone: string
          updated_at: string
        }
        Insert: {
          biometric_lock_enabled?: boolean
          budget_alert_threshold?: number
          created_at?: string
          date_format?: Database["public"]["Enums"]["app_date_format_type"]
          default_dashboard_range?: Database["public"]["Enums"]["dashboard_range_type"]
          language_locale?: string
          lock_timeout_seconds?: number
          notify_budget_breach?: boolean
          notify_recurring_reminder?: boolean
          primary_currency_code?: string | null
          profile_id: string
          theme?: Database["public"]["Enums"]["app_theme_type"]
          theme_base_color?: string
          theme_body_font?: string
          theme_chart_color?: string
          theme_heading_font?: string
          theme_primary_color?: string
          theme_radius?: number
          theme_style?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          biometric_lock_enabled?: boolean
          budget_alert_threshold?: number
          created_at?: string
          date_format?: Database["public"]["Enums"]["app_date_format_type"]
          default_dashboard_range?: Database["public"]["Enums"]["dashboard_range_type"]
          language_locale?: string
          lock_timeout_seconds?: number
          notify_budget_breach?: boolean
          notify_recurring_reminder?: boolean
          primary_currency_code?: string | null
          profile_id?: string
          theme?: Database["public"]["Enums"]["app_theme_type"]
          theme_base_color?: string
          theme_body_font?: string
          theme_chart_color?: string
          theme_heading_font?: string
          theme_primary_color?: string
          theme_style?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_language_locale_fkey"
            columns: ["language_locale"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "user_preferences_primary_currency_code_fkey"
            columns: ["primary_currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["iso_code"]
          },
          {
            foreignKeyName: "user_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_subscriptions: {
        Row: {
          created_at: string
          device_name: string
          id: string
          profile_id: string
          subscription_payload: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_name: string
          id?: string
          profile_id: string
          subscription_payload: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_name?: string
          id?: string
          profile_id?: string
          subscription_payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          color: string | null
          created_at: string
          currency_code: string
          description: string | null
          exclude_from_net_worth: boolean
          icon: string | null
          id: string
          initial_balance: number
          is_active: boolean
          is_default: boolean
          name: string
          type: Database["public"]["Enums"]["wallet_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          currency_code: string
          description?: string | null
          exclude_from_net_worth?: boolean
          icon?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          is_default?: boolean
          name: string
          type?: Database["public"]["Enums"]["wallet_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          currency_code?: string
          description?: string | null
          exclude_from_net_worth?: boolean
          icon?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          is_default?: boolean
          name?: string
          type?: Database["public"]["Enums"]["wallet_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_currency_code_fkey"
            columns: ["currency_code"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["iso_code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_balance_trend: {
        Args: {
          p_category_id?: string
          p_from: string
          p_to: string
          p_user_id: string
          p_wallet_id?: string
        }
        Returns: {
          balance: number
          day: string
        }[]
      }
      get_cashflow_summary: {
        Args: {
          p_category_id?: string
          p_from: string
          p_to: string
          p_user_id: string
          p_wallet_id?: string
        }
        Returns: {
          expense: number
          income: number
          net: number
        }[]
      }
      get_category_breakdown: {
        Args: {
          p_category_id?: string
          p_from: string
          p_to: string
          p_user_id: string
          p_wallet_id?: string
        }
        Returns: {
          amount: number
          category_id: string
          category_name: string
          color: string
          icon: string
        }[]
      }
      get_monthly_cashflow: {
        Args: {
          p_category_id?: string
          p_from: string
          p_to: string
          p_user_id: string
          p_wallet_id?: string
        }
        Returns: {
          expense: number
          income: number
          month: string
        }[]
      }
      get_wallet_balances: {
        Args: { p_is_active?: boolean; p_user_id: string }
        Returns: {
          balance: number
          color: string
          icon: string
          name: string
          type: Database["public"]["Enums"]["wallet_type"]
          wallet_id: string
        }[]
      }
    }
    Enums: {
      app_date_format_type: "DD/MM/YYYY" | "YYYY-MM-DD" | "MM/DD/YYYY"
      app_theme_type: "light" | "dark" | "system"
      dashboard_range_type:
        | "7d"
        | "30d"
        | "90d"
        | "6m"
        | "1y"
        | "ytd"
        | "custom"
      wallet_type: "regular" | "savings" | "investment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_date_format_type: ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"],
      app_theme_type: ["light", "dark", "system"],
      dashboard_range_type: ["7d", "30d", "90d", "6m", "1y", "ytd", "custom"],
      wallet_type: ["regular", "savings", "investment"],
    },
  },
} as const

