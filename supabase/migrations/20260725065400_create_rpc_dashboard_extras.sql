-- Create get_monthly_cashflow
CREATE OR REPLACE FUNCTION public.get_monthly_cashflow(
    p_user_id UUID,
    p_from DATE,
    p_to DATE,
    p_wallet_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
    month TEXT,
    income NUMERIC,
    expense NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH months AS (
        SELECT 
            to_char(g.d, 'YYYY-MM') as month_str,
            g.d::date as month_start,
            (g.d + interval '1 month' - interval '1 day')::date as month_end
        FROM generate_series(
            date_trunc('month', p_from),
            date_trunc('month', p_to),
            '1 month'::interval
        ) AS g(d)
    )
    SELECT 
        m.month_str as month,
        COALESCE(SUM(t.normalized_amount) FILTER (WHERE t.normalized_amount > 0), 0)::NUMERIC as income,
        COALESCE(SUM(t.normalized_amount) FILTER (WHERE t.normalized_amount < 0), 0)::NUMERIC as expense
    FROM months m
    LEFT JOIN public.transactions t 
        ON t.user_id = p_user_id 
        AND t.date >= m.month_start 
        AND t.date <= m.month_end
        AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
    LEFT JOIN public.categories c ON t.category_id = c.category_id
    WHERE (p_category_id IS NULL OR c.category_id = p_category_id OR c.parent_id = p_category_id)
    GROUP BY m.month_str, m.month_start
    ORDER BY m.month_start ASC;
END;
$$;

-- Create get_wallet_balances
CREATE OR REPLACE FUNCTION public.get_wallet_balances(
    p_user_id UUID,
    p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    wallet_id UUID,
    name TEXT,
    type public.wallet_type,
    icon TEXT,
    color TEXT,
    balance NUMERIC,
    real_balance NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id as wallet_id,
        w.name,
        w.type,
        w.icon,
        w.color,
        (w.initial_balance + COALESCE((
            SELECT SUM(t.normalized_amount)
            FROM public.transactions t
            WHERE t.wallet_id = w.id
        ), 0))::NUMERIC as balance,
        (w.initial_balance + COALESCE((
            SELECT SUM(t.normalized_amount)
            FROM public.transactions t
            WHERE t.wallet_id = w.id
        ), 0))::NUMERIC as real_balance
    FROM public.wallets w
    WHERE w.user_id = p_user_id
      AND w.is_active = p_is_active;
END;
$$;
