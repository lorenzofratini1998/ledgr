CREATE TABLE public.budgets (
    budget_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    amount          NUMERIC(18, 4) NOT NULL,
    spent_amount    NUMERIC(18, 4) NOT NULL DEFAULT 0,
    currency_code   CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    is_global       BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence      TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'weekly', 'monthly', 'yearly')),
    type            TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    is_rolled_over  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMPTZ,
    
    CONSTRAINT check_end_date_after_start_date CHECK (end_date >= start_date)
);

CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_dates ON public.budgets(start_date, end_date);
CREATE INDEX idx_budgets_deleted_at ON public.budgets(deleted_at);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budgets"
    ON public.budgets FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_budgets
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

---- BUDGET CATEGORIES ----

CREATE TABLE public.budget_categories (
    budget_id           UUID NOT NULL REFERENCES public.budgets(budget_id) ON DELETE CASCADE,
    category_id         UUID NOT NULL REFERENCES public.categories(category_id) ON DELETE CASCADE,
    allocation_amount   NUMERIC(18, 4),
    PRIMARY KEY (budget_id, category_id)
);

CREATE INDEX idx_budget_categories_budget_id ON public.budget_categories(budget_id);
CREATE INDEX idx_budget_categories_category_id ON public.budget_categories(category_id);

ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own budget categories"
    ON public.budget_categories FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.budgets b 
            WHERE b.budget_id = budget_categories.budget_id AND b.user_id = auth.uid()
        )
    );

---- TRANSACTIONS TRIGGER ----

CREATE OR REPLACE FUNCTION public.update_budget_spent_amount()
RETURNS TRIGGER AS $$
DECLARE
    b_id UUID;
BEGIN
    -- Handle DELETE or UPDATE (subtract old amount from affected budgets)
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF OLD.transfer_id IS NULL THEN
            FOR b_id IN 
                SELECT b.budget_id 
                FROM public.budgets b
                WHERE b.user_id = OLD.user_id
                  AND b.deleted_at IS NULL
                  AND OLD.date >= b.start_date 
                  AND OLD.date <= b.end_date
                  AND (
                      b.is_global = TRUE 
                      OR EXISTS (SELECT 1 FROM public.budget_categories bc WHERE bc.budget_id = b.budget_id AND bc.category_id = OLD.category_id)
                  )
            LOOP
                UPDATE public.budgets 
                SET spent_amount = spent_amount - OLD.normalized_amount 
                WHERE budget_id = b_id;
            END LOOP;
        END IF;
    END IF;

    -- Handle INSERT or UPDATE (add new amount to affected budgets)
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.transfer_id IS NULL THEN
            FOR b_id IN 
                SELECT b.budget_id 
                FROM public.budgets b
                WHERE b.user_id = NEW.user_id
                  AND b.deleted_at IS NULL
                  AND NEW.date >= b.start_date 
                  AND NEW.date <= b.end_date
                  AND (
                      b.is_global = TRUE 
                      OR EXISTS (SELECT 1 FROM public.budget_categories bc WHERE bc.budget_id = b.budget_id AND bc.category_id = NEW.category_id)
                  )
            LOOP
                UPDATE public.budgets 
                SET spent_amount = spent_amount + NEW.normalized_amount 
                WHERE budget_id = b_id;
            END LOOP;
        END IF;
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER trigger_update_budget_spent_amount
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_budget_spent_amount();

---- RECALCULATE BUDGET RPC ----

CREATE OR REPLACE FUNCTION public.recalculate_budget(p_budget_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total NUMERIC(18,4);
    v_budget RECORD;
BEGIN
    -- Recupera il budget
    SELECT * INTO v_budget FROM public.budgets WHERE budget_id = p_budget_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calcola il totale dalle transazioni esistenti basandosi sugli attuali criteri
    SELECT COALESCE(SUM(t.normalized_amount), 0) INTO v_total
    FROM public.transactions t
    WHERE t.user_id = v_budget.user_id
      AND t.transfer_id IS NULL
      AND t.date >= v_budget.start_date
      AND t.date <= v_budget.end_date
      AND (
          v_budget.is_global = TRUE 
          OR EXISTS (
              SELECT 1 FROM public.budget_categories bc 
              WHERE bc.budget_id = v_budget.budget_id 
                AND bc.category_id = t.category_id
          )
      );

    UPDATE public.budgets
    SET spent_amount = v_total
    WHERE budget_id = p_budget_id;
END;
$$;

---- BUDGET CATEGORY BREAKDOWN RPC ----

CREATE OR REPLACE FUNCTION public.get_budget_category_breakdown(p_budget_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    color TEXT,
    icon TEXT,
    amount NUMERIC,
    "compareAmount" NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_budget RECORD;
BEGIN
    SELECT * INTO v_budget FROM public.budgets WHERE budget_id = p_budget_id AND user_id = auth.uid();
    IF NOT FOUND THEN RETURN; END IF;

    RETURN QUERY
    SELECT 
        c.category_id,
        c.category_name as category_name,
        c.color,
        c.icon,
        COALESCE(SUM(t.normalized_amount), 0) as amount,
        COALESCE(bc.allocation_amount, 0) as "compareAmount"
    FROM public.categories c
    LEFT JOIN public.transactions t ON t.category_id = c.category_id 
        AND t.user_id = v_budget.user_id
        AND t.date >= v_budget.start_date
        AND t.date <= v_budget.end_date
    LEFT JOIN public.budget_categories bc ON bc.category_id = c.category_id AND bc.budget_id = p_budget_id
    WHERE 
        -- Show category if it's explicitly part of the budget, OR if it's a global budget and has transactions
        (bc.category_id IS NOT NULL) OR 
        (v_budget.is_global = TRUE AND EXISTS (
            SELECT 1 FROM public.transactions t2 
            WHERE t2.category_id = c.category_id 
              AND t2.user_id = v_budget.user_id 
              AND t2.date >= v_budget.start_date 
              AND t2.date <= v_budget.end_date
        ))
    GROUP BY c.category_id, c.category_name, c.color, c.icon, bc.allocation_amount
    ORDER BY amount DESC;
END;
$$;

---- BUDGET DAILY PACING RPC ----

CREATE OR REPLACE FUNCTION public.get_budget_daily_pacing(p_budget_id UUID)
RETURNS TABLE (
    day TEXT,
    balance NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_budget RECORD;
    v_date DATE;
    v_running_total NUMERIC := 0;
    v_daily_sum NUMERIC;
BEGIN
    SELECT * INTO v_budget FROM public.budgets WHERE budget_id = p_budget_id AND user_id = auth.uid();
    IF NOT FOUND THEN RETURN; END IF;

    FOR v_date IN 
        SELECT generate_series(v_budget.start_date, LEAST(v_budget.end_date, CURRENT_DATE), '1 day'::interval)::DATE
    LOOP
        SELECT COALESCE(SUM(t.normalized_amount), 0) INTO v_daily_sum
        FROM public.transactions t
        WHERE t.user_id = v_budget.user_id
          AND t.date = v_date
          AND (
              v_budget.is_global = TRUE 
              OR EXISTS (SELECT 1 FROM public.budget_categories bc WHERE bc.budget_id = v_budget.budget_id AND bc.category_id = t.category_id)
          );

        v_running_total := v_running_total + v_daily_sum;
        
        day := to_char(v_date, 'YYYY-MM-DD');
        balance := v_running_total;
        RETURN NEXT;
    END LOOP;
END;
$$;

---- RECURRING BUDGETS CRON JOB ----

CREATE OR REPLACE FUNCTION public.process_recurring_budgets()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_budget RECORD;
    v_user_tz TEXT;
    v_new_start DATE;
    v_new_end DATE;
    v_new_budget_id UUID;
BEGIN
    -- Loop through all active recurring budgets that haven't been rolled over
    FOR v_budget IN 
        SELECT b.*, up.timezone 
        FROM public.budgets b
        JOIN public.user_preferences up ON up.profile_id = b.user_id
        WHERE b.deleted_at IS NULL 
          AND b.recurrence != 'none'
          AND b.is_rolled_over = FALSE
    LOOP
        v_user_tz := COALESCE(v_budget.timezone, 'UTC');

        -- Check if the budget has ended in the user's local timezone
        IF (CURRENT_TIMESTAMP AT TIME ZONE v_user_tz)::DATE > v_budget.end_date THEN
            
            -- Calculate new dates based on recurrence
            IF v_budget.recurrence = 'weekly' THEN
                v_new_start := v_budget.end_date + INTERVAL '1 day';
                v_new_end := v_new_start + INTERVAL '6 days';
            ELSIF v_budget.recurrence = 'monthly' THEN
                v_new_start := v_budget.end_date + INTERVAL '1 day';
                v_new_end := v_new_start + INTERVAL '1 month' - INTERVAL '1 day';
            ELSIF v_budget.recurrence = 'yearly' THEN
                v_new_start := v_budget.end_date + INTERVAL '1 day';
                v_new_end := v_new_start + INTERVAL '1 year' - INTERVAL '1 day';
            END IF;

            -- Create the new budget
            INSERT INTO public.budgets (
                user_id, name, description, amount, currency_code, 
                start_date, end_date, is_global, recurrence, type
            ) VALUES (
                v_budget.user_id, v_budget.name, v_budget.description, v_budget.amount, v_budget.currency_code,
                v_new_start, v_new_end, v_budget.is_global, v_budget.recurrence, v_budget.type
            ) RETURNING budget_id INTO v_new_budget_id;

            -- Copy categories if any
            IF NOT v_budget.is_global THEN
                INSERT INTO public.budget_categories (budget_id, category_id, allocation_amount)
                SELECT v_new_budget_id, category_id, allocation_amount
                FROM public.budget_categories
                WHERE budget_id = v_budget.budget_id;
            END IF;

            -- Mark the old budget as rolled over
            UPDATE public.budgets 
            SET is_rolled_over = TRUE 
            WHERE budget_id = v_budget.budget_id;

        END IF;
    END LOOP;
END;
$$;

-- Schedule the job to run every hour using pg_cron
-- We wrap it in a DO block to avoid errors if pg_cron is not yet initialized or job exists
DO $$
BEGIN
    PERFORM cron.schedule('process-recurring-budgets-hourly', '0 * * * *', 'SELECT public.process_recurring_budgets()');
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to schedule cron job (pg_cron might not be fully configured yet): %', SQLERRM;
END;
$$;

