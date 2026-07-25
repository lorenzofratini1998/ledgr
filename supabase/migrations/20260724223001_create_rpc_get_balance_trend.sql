-- Create get_balance_trend
CREATE OR REPLACE FUNCTION public.get_balance_trend(
    p_user_id UUID,
    p_from DATE,
    p_to DATE,
    p_wallet_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
    day DATE,
    balance NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
    v_initial_balance NUMERIC := 0;
BEGIN
    -- If we are NOT filtering by category, we calculate true Net Worth (including wallet initial balances and historical transactions)
    IF p_category_id IS NULL THEN
        -- Calculate initial balance up to p_from (exclusive)
        SELECT COALESCE(SUM(initial_balance), 0) INTO v_initial_balance
        FROM public.wallets
        WHERE user_id = p_user_id 
          AND is_active = TRUE
          AND (p_wallet_id IS NULL OR id = p_wallet_id)
          AND (p_wallet_id IS NOT NULL OR exclude_from_net_worth = FALSE);

        -- Sum historical transactions before p_from
        v_initial_balance := v_initial_balance + COALESCE((
            SELECT SUM(normalized_amount)
            FROM public.transactions t
            JOIN public.wallets w ON t.wallet_id = w.id
            WHERE t.user_id = p_user_id 
              AND t.date < p_from
              AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
              AND (p_wallet_id IS NOT NULL OR w.exclude_from_net_worth = FALSE)
        ), 0);
    END IF;

    RETURN QUERY
    WITH dates AS (
        SELECT generate_series(p_from, p_to, '1 day'::interval)::date AS d
    ),
    daily_changes AS (
        SELECT 
            t.date,
            SUM(t.normalized_amount) as amount
        FROM public.transactions t
        LEFT JOIN public.wallets w ON t.wallet_id = w.id
        LEFT JOIN public.categories c ON t.category_id = c.category_id
        WHERE t.user_id = p_user_id
          AND t.date >= p_from 
          AND t.date <= p_to
          AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
          AND (p_category_id IS NULL OR (p_wallet_id IS NOT NULL OR w.exclude_from_net_worth = FALSE))
          AND (p_category_id IS NULL OR c.category_id = p_category_id OR c.parent_id = p_category_id)
        GROUP BY t.date
    )
    SELECT 
        dates.d as day,
        (v_initial_balance + COALESCE(SUM(daily_changes.amount) OVER (ORDER BY dates.d), 0))::NUMERIC as balance
    FROM dates
    LEFT JOIN daily_changes ON dates.d = daily_changes.date
    ORDER BY dates.d;
END;
$$;
