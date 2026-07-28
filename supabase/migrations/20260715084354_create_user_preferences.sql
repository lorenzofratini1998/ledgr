CREATE TYPE public.app_theme_type AS ENUM ('light', 'dark', 'system');
CREATE TYPE public.app_date_format_type AS ENUM ('DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY');
CREATE TYPE public.dashboard_range_type AS ENUM ('7d', '30d', '90d', '6m', '1y', 'ytd', 'custom');

CREATE TABLE public.user_preferences (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    language_locale VARCHAR(5) NOT NULL REFERENCES public.languages(locale) DEFAULT 'en-US',
    primary_currency_code CHAR(3) REFERENCES public.currencies(iso_code),
    date_format public.app_date_format_type NOT NULL DEFAULT 'DD/MM/YYYY',
    theme public.app_theme_type NOT NULL DEFAULT 'system',
    default_dashboard_range public.dashboard_range_type NOT NULL DEFAULT '30d',
    biometric_lock_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    lock_timeout_seconds INT NOT NULL DEFAULT 10,
    notify_budget_breach BOOLEAN NOT NULL DEFAULT TRUE,
    notify_recurring_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    budget_alert_threshold INT NOT NULL DEFAULT 80,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_user_preferences 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE POLICY "Users can manage their own preferences" 
    ON public.user_preferences FOR ALL TO authenticated USING (auth.uid() = profile_id);

-- Enforce primary currency immutability
CREATE OR REPLACE FUNCTION public.enforce_immutable_currency()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.primary_currency_code IS NOT NULL AND NEW.primary_currency_code IS DISTINCT FROM OLD.primary_currency_code THEN
        RAISE EXCEPTION 'Primary currency is immutable once configured during onboarding.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lock_primary_currency 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION public.enforce_immutable_currency();