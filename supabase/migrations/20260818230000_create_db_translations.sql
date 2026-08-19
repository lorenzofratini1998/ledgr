CREATE TABLE IF NOT EXISTS public.db_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(120) NOT NULL,
    locale VARCHAR(10) NOT NULL,
    template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_db_translations_key_locale UNIQUE (key, locale)
);

CREATE INDEX IF NOT EXISTS idx_db_translations_lookup 
    ON public.db_translations (key, locale);

ALTER TABLE public.db_translations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'db_translations' AND policyname = 'Allow read access to db_translations'
    ) THEN
        CREATE POLICY "Allow read access to db_translations"
            ON public.db_translations FOR SELECT TO authenticated, anon USING (true);
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_db_translation(
    p_key TEXT,
    p_locale TEXT DEFAULT 'en-US',
    p_params JSONB DEFAULT '{}'::jsonb
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_template TEXT;
    v_result TEXT;
    v_rec RECORD;
    v_clean_locale TEXT;
    v_lang_prefix TEXT;
BEGIN
    v_clean_locale := COALESCE(NULLIF(TRIM(p_locale), ''), 'en-US');
    v_lang_prefix := SPLIT_PART(v_clean_locale, '-', 1);

    SELECT template INTO v_template
    FROM public.db_translations
    WHERE key = p_key AND locale = v_clean_locale
    LIMIT 1;

    IF v_template IS NULL THEN
        SELECT template INTO v_template
        FROM public.db_translations
        WHERE key = p_key AND (locale = v_lang_prefix OR locale LIKE (v_lang_prefix || '-%'))
        ORDER BY CASE WHEN locale = v_lang_prefix THEN 0 ELSE 1 END
        LIMIT 1;
    END IF;

    IF v_template IS NULL THEN
        SELECT template INTO v_template
        FROM public.db_translations
        WHERE key = p_key AND (locale = 'en-US' OR locale = 'en')
        LIMIT 1;
    END IF;

    IF v_template IS NULL THEN
        RETURN p_key;
    END IF;

    v_result := v_template;

    IF p_params IS NOT NULL AND jsonb_typeof(p_params) = 'object' THEN
        FOR v_rec IN SELECT key, value FROM jsonb_each_text(p_params) LOOP
            v_result := REPLACE(v_result, '{' || v_rec.key || '}', v_rec.value);
        END LOOP;
    END IF;

    RETURN v_result;
END;
$$;

INSERT INTO public.db_translations (key, locale, template)
VALUES
    ('notifications.budget_exceeded.title', 'en-US', 'Budget Exceeded!'),
    ('notifications.budget_exceeded.title', 'it-IT', 'Budget Superato!'),
    ('notifications.budget_exceeded.message', 'en-US', 'You exceeded 100% of budget "{budget_name}" (Spent: {spent_amount} of {amount} {currency_code})'),
    ('notifications.budget_exceeded.message', 'it-IT', 'Hai superato il 100% del budget "{budget_name}" (Spesi: {spent_amount} su {amount} {currency_code})'),

    ('notifications.budget_warning.title', 'en-US', 'Budget Warning'),
    ('notifications.budget_warning.title', 'it-IT', 'Attenzione al Budget'),
    ('notifications.budget_warning.message', 'en-US', 'You have reached {percentage}% of budget "{budget_name}" (Spent: {spent_amount} of {amount} {currency_code})'),
    ('notifications.budget_warning.message', 'it-IT', 'Hai raggiunto il {percentage}% del budget "{budget_name}" (Spesi: {spent_amount} su {amount} {currency_code})'),

    ('notifications.recurring_reminder.title', 'en-US', 'Upcoming Payment Tomorrow'),
    ('notifications.recurring_reminder.title', 'it-IT', 'Pagamento Programmato Domani'),
    ('notifications.recurring_reminder.message', 'en-US', 'Tomorrow a payment of {amount} {currency_code} is scheduled for "{description}" ({wallet_name})'),
    ('notifications.recurring_reminder.message', 'it-IT', 'Domani è previsto il pagamento di {amount} {currency_code} per "{description}" ({wallet_name})')
ON CONFLICT (key, locale) DO UPDATE 
SET template = EXCLUDED.template, updated_at = CURRENT_TIMESTAMP;
