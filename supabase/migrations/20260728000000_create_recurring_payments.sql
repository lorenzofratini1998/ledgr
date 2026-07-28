-- 1. CREAZIONE NUOVI TIPI ENUM
CREATE TYPE public.recurring_frequency_type AS ENUM ('once', 'daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE public.recurring_status_type AS ENUM ('active', 'paused', 'completed');
CREATE TYPE public.recurring_amount_type AS ENUM ('fixed', 'variable');
CREATE TYPE public.transaction_status_type AS ENUM ('pending', 'completed');

-- 2. AGGIORNAMENTO TABELLE ESISTENTI
-- Aggiungiamo lo stato e il collegamento alla ricorrenza nelle transazioni
ALTER TABLE public.transactions 
ADD COLUMN status public.transaction_status_type NOT NULL DEFAULT 'completed',
ADD COLUMN recurring_id UUID;

-- 3. CREAZIONE TABELLA RECURRING PAYMENTS
CREATE TABLE public.recurring_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.categories(category_id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(18, 4) NOT NULL,
    currency_code CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    type public.recurring_amount_type NOT NULL DEFAULT 'fixed',
    frequency public.recurring_frequency_type NOT NULL,
    status public.recurring_status_type NOT NULL DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    last_execution_date DATE,
    next_execution_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recurring_user_id ON public.recurring_payments(user_id);
CREATE INDEX idx_recurring_status_date ON public.recurring_payments(status, next_execution_date);

ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurring payments"
    ON public.recurring_payments FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_recurring_payments
    BEFORE UPDATE ON public.recurring_payments
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Ora possiamo aggiungere la Foreign Key su transactions
ALTER TABLE public.transactions
ADD CONSTRAINT fk_recurring_id FOREIGN KEY (recurring_id) REFERENCES public.recurring_payments(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- 4. HELPER FUNCTION: GET LATEST EXCHANGE RATE
CREATE OR REPLACE FUNCTION public.get_latest_exchange_rate(
    p_base_currency CHAR(3),
    p_quote_currency CHAR(3),
    p_date DATE
)
RETURNS NUMERIC(18, 6) AS $$
DECLARE
    v_rate NUMERIC(18, 6);
BEGIN
    IF p_base_currency = p_quote_currency THEN
        RETURN 1.000000;
    END IF;

    SELECT rate INTO v_rate
    FROM public.exchange_rates
    WHERE base_currency = p_base_currency
      AND quote_currency = p_quote_currency
      AND date <= p_date
    ORDER BY date DESC
    LIMIT 1;

    IF v_rate IS NULL THEN
        RETURN 1.000000;
    END IF;

    RETURN v_rate;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. FUNZIONE MATEMATICA PER IL CALCOLO DEI "GIORNI MALEDETTI" (29, 30, 31)
CREATE OR REPLACE FUNCTION public.get_next_recurring_date(p_start_date DATE, p_current_target DATE, p_frequency public.recurring_frequency_type)
RETURNS DATE AS $$
DECLARE
    v_months INT;
BEGIN
    IF p_frequency = 'daily' THEN
        RETURN p_current_target + INTERVAL '1 day';
    ELSIF p_frequency = 'weekly' THEN
        RETURN p_current_target + INTERVAL '7 days';
    ELSIF p_frequency = 'monthly' THEN
        -- Calcoliamo il differenziale di mesi direttamente dalla START DATE. 
        v_months := (EXTRACT(year FROM p_current_target) - EXTRACT(year FROM p_start_date)) * 12 +
                    (EXTRACT(month FROM p_current_target) - EXTRACT(month FROM p_start_date)) + 1;
        RETURN (p_start_date + (v_months || ' month')::INTERVAL)::DATE;
    ELSIF p_frequency = 'yearly' THEN
        v_months := (EXTRACT(year FROM p_current_target) - EXTRACT(year FROM p_start_date)) + 1;
        RETURN (p_start_date + (v_months || ' year')::INTERVAL)::DATE;
    END IF;
    RETURN p_current_target;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. TRIGGER CORE: INSERIMENTO RETROATTIVO & AUTO-GENERAZIONE
CREATE OR REPLACE FUNCTION public.handle_recurring_generation()
RETURNS TRIGGER AS $$
DECLARE
    v_local_today DATE;
    v_tz TEXT;
    v_primary_currency CHAR(3);
    v_trans_status public.transaction_status_type;
    v_cat_id UUID;
    v_exchange_rate NUMERIC(18, 6);
    v_normalized_amount NUMERIC(18, 4);
BEGIN
    IF NEW.status != 'active' THEN
        RETURN NEW;
    END IF;

    -- Estraiamo sia il timezone che la valuta principale dell'utente in una sola query
    SELECT timezone, primary_currency_code 
    INTO v_tz, v_primary_currency 
    FROM public.user_preferences 
    WHERE profile_id = NEW.user_id;
    
    IF v_tz IS NULL THEN v_tz := 'UTC'; END IF;
    IF v_primary_currency IS NULL THEN v_primary_currency := NEW.currency_code; END IF;

    v_local_today := (CURRENT_TIMESTAMP AT TIME ZONE v_tz)::date;

    IF TG_OP = 'INSERT' AND NEW.next_execution_date IS NULL THEN
        NEW.next_execution_date := NEW.start_date;
    END IF;
    
    IF NEW.id IS NULL THEN NEW.id := gen_random_uuid(); END IF;

    WHILE NEW.next_execution_date <= v_local_today LOOP
        
        IF NEW.end_date IS NOT NULL AND NEW.next_execution_date > NEW.end_date THEN
            NEW.status := 'completed';
            EXIT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE id = NEW.wallet_id AND is_active = TRUE) THEN
            RAISE LOG 'Fallback: Il wallet % non è attivo. Pagamento ricorrente % messo in pausa.', NEW.wallet_id, NEW.id;
            NEW.status := 'paused';
            EXIT;
        END IF;

        SELECT category_id INTO v_cat_id FROM public.categories 
        WHERE category_id = NEW.category_id AND is_active = TRUE;

        IF NEW.type = 'fixed' THEN v_trans_status := 'completed';
        ELSE v_trans_status := 'pending'; END IF;

        v_exchange_rate := public.get_latest_exchange_rate(
            NEW.currency_code, 
            v_primary_currency, 
            NEW.next_execution_date
        );
        
        v_normalized_amount := NEW.amount * v_exchange_rate;

        INSERT INTO public.transactions (
            user_id, wallet_id, category_id, date, description,
            amount, normalized_amount, exchange_rate, currency_code,
            status, recurring_id
        ) VALUES (
            NEW.user_id, NEW.wallet_id, v_cat_id, NEW.next_execution_date, NEW.description,
            NEW.amount, v_normalized_amount, v_exchange_rate, NEW.currency_code,
            v_trans_status, NEW.id
        );

        NEW.last_execution_date := NEW.next_execution_date;
        
        IF NEW.frequency = 'once' THEN
            NEW.status := 'completed';
            EXIT;
        ELSE
            NEW.next_execution_date := public.get_next_recurring_date(NEW.start_date, NEW.next_execution_date, NEW.frequency);
        END IF;
        
    END LOOP;

    IF NEW.end_date IS NOT NULL AND NEW.next_execution_date > NEW.end_date AND NEW.status != 'completed' THEN
        NEW.status := 'completed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Agganciamo il trigger 
CREATE TRIGGER on_recurring_upsert
    BEFORE INSERT OR UPDATE ON public.recurring_payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_recurring_generation();

-- 7. CRON JOB: IL WAKE-UP CALL
CREATE OR REPLACE FUNCTION public.process_hourly_recurring_payments()
RETURNS void AS $$
BEGIN
    UPDATE public.recurring_payments rp
    SET updated_at = CURRENT_TIMESTAMP
    FROM public.user_preferences up
    WHERE rp.user_id = up.profile_id
      AND rp.status = 'active'
      AND rp.next_execution_date <= (CURRENT_TIMESTAMP AT TIME ZONE COALESCE(up.timezone, 'UTC'))::date;

    RAISE LOG 'Esecuzione oraria di pg_cron per recurring_payments completata.';
END;
$$ LANGUAGE plpgsql;

-- Schedulazione su Supabase (Richiede pg_cron abilitato)
-- Commentato per lo sviluppo locale, ma verrà eseguito in prod se pg_cron è presente.
-- SELECT cron.schedule('generate_recurring_txs_hourly', '0 * * * *', $$
--     SELECT public.process_hourly_recurring_payments();
-- $$);
