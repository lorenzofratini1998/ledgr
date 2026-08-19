
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE public.notification_type AS ENUM (
            'budget_warning',
            'budget_exceeded',
            'recurring_reminder',
            'system'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON public.notifications(user_id, is_read, created_at DESC) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_all 
    ON public.notifications(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Allow all operations on notifications'
    ) THEN
        CREATE POLICY "Allow all operations on notifications"
            ON public.notifications FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_notifications'
    ) THEN
        CREATE TRIGGER set_updated_at_notifications
            BEFORE UPDATE ON public.notifications
            FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);
    END IF;
END $$;

ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS last_notified_threshold INT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.check_and_notify_budget_thresholds()
RETURNS TRIGGER AS $$
DECLARE
    v_pref RECORD;
    v_spent NUMERIC;
    v_percent NUMERIC;
    v_threshold INT;
    v_locale TEXT;
    v_params JSONB;
    v_title TEXT;
    v_msg TEXT;
BEGIN
    IF NEW.amount <= 0 OR NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    v_spent := ABS(COALESCE(NEW.spent_amount, 0));
    v_percent := (v_spent / NEW.amount) * 100;

    SELECT notify_budget_breach, budget_alert_threshold, language_locale 
    INTO v_pref 
    FROM public.user_preferences 
    WHERE profile_id = NEW.user_id;

    IF v_pref.notify_budget_breach IS NULL THEN
        v_pref.notify_budget_breach := TRUE;
    END IF;
    IF v_pref.budget_alert_threshold IS NULL THEN
        v_pref.budget_alert_threshold := 80;
    END IF;

    v_threshold := v_pref.budget_alert_threshold;
    v_locale := COALESCE(v_pref.language_locale, 'en-US');

    IF v_pref.notify_budget_breach = TRUE THEN
        -- Case 1: 100% Exceeded (Total breach)
        IF v_percent >= 100 AND COALESCE(NEW.last_notified_threshold, 0) < 100 THEN
            v_params := jsonb_build_object(
                'budget_id', NEW.budget_id,
                'budget_name', NEW.name,
                'percentage', ROUND(v_percent, 1),
                'spent_amount', ROUND(v_spent, 2),
                'amount', ROUND(NEW.amount, 2),
                'currency_code', NEW.currency_code,
                'target_url', '/budgets',
                'title_key', 'notifications.budget_exceeded.title',
                'message_key', 'notifications.budget_exceeded.message'
            );

            v_title := public.get_db_translation('notifications.budget_exceeded.title', v_locale, v_params);
            v_msg := public.get_db_translation('notifications.budget_exceeded.message', v_locale, v_params);

            INSERT INTO public.notifications (user_id, type, title, message, data)
            VALUES (
                NEW.user_id,
                'budget_exceeded',
                v_title,
                v_msg,
                v_params
            );

            NEW.last_notified_threshold := 100;

        -- Case 2: Warning Threshold Reached (e.g. 80%)
        ELSIF v_percent >= v_threshold AND v_percent < 100 AND COALESCE(NEW.last_notified_threshold, 0) < v_threshold THEN
            v_params := jsonb_build_object(
                'budget_id', NEW.budget_id,
                'budget_name', NEW.name,
                'percentage', ROUND(v_percent, 0),
                'spent_amount', ROUND(v_spent, 2),
                'amount', ROUND(NEW.amount, 2),
                'currency_code', NEW.currency_code,
                'target_url', '/budgets',
                'title_key', 'notifications.budget_warning.title',
                'message_key', 'notifications.budget_warning.message'
            );

            v_title := public.get_db_translation('notifications.budget_warning.title', v_locale, v_params);
            v_msg := public.get_db_translation('notifications.budget_warning.message', v_locale, v_params);

            INSERT INTO public.notifications (user_id, type, title, message, data)
            VALUES (
                NEW.user_id,
                'budget_warning',
                v_title,
                v_msg,
                v_params
            );

            NEW.last_notified_threshold := v_threshold;

        -- Reset threshold if spent amount drops below threshold (e.g. transaction deleted)
        ELSIF v_percent < v_threshold AND COALESCE(NEW.last_notified_threshold, 0) > 0 THEN
            NEW.last_notified_threshold := 0;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_budget_thresholds'
    ) THEN
        CREATE TRIGGER trigger_notify_budget_thresholds
            BEFORE UPDATE OF spent_amount ON public.budgets
            FOR EACH ROW EXECUTE FUNCTION public.check_and_notify_budget_thresholds();
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.process_daily_recurring_reminders()
RETURNS void AS $$
DECLARE
    r RECORD;
    v_params JSONB;
    v_title TEXT;
    v_msg TEXT;
BEGIN
    FOR r IN
        SELECT 
            rp.id,
            rp.user_id,
            rp.description,
            rp.amount,
            rp.currency_code,
            rp.next_execution_date,
            w.name AS wallet_name,
            up.language_locale
        FROM public.recurring_payments rp
        JOIN public.user_preferences up ON up.profile_id = rp.user_id
        LEFT JOIN public.wallets w ON w.id = rp.wallet_id
        WHERE rp.status = 'active'
          AND up.notify_recurring_reminder = TRUE
          AND rp.next_execution_date = ((CURRENT_TIMESTAMP AT TIME ZONE COALESCE(up.timezone, 'UTC')) + INTERVAL '1 day')::date
          AND NOT EXISTS (
              -- Prevent duplicate notifications for the same payment on the same day
              SELECT 1 FROM public.notifications n
              WHERE n.user_id = rp.user_id
                AND n.type = 'recurring_reminder'
                AND (n.data->>'recurring_id')::uuid = rp.id
                AND n.created_at::date = (CURRENT_TIMESTAMP AT TIME ZONE COALESCE(up.timezone, 'UTC'))::date
          )
    LOOP
        v_params := jsonb_build_object(
            'recurring_id', r.id,
            'description', r.description,
            'amount', ROUND(r.amount, 2),
            'currency_code', r.currency_code,
            'wallet_name', COALESCE(r.wallet_name, 'Main Wallet'),
            'target_url', '/scheduled',
            'title_key', 'notifications.recurring_reminder.title',
            'message_key', 'notifications.recurring_reminder.message'
        );

        v_title := public.get_db_translation('notifications.recurring_reminder.title', r.language_locale, v_params);
        v_msg := public.get_db_translation('notifications.recurring_reminder.message', r.language_locale, v_params);

        INSERT INTO public.notifications (user_id, type, title, message, data)
        VALUES (
            r.user_id,
            'recurring_reminder',
            v_title,
            v_msg,
            v_params
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;
