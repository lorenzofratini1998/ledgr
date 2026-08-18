-- Update get_cashflow_summary to filter by completed status and exclude transfers
CREATE OR REPLACE FUNCTION public.get_cashflow_summary(
    p_user_id UUID,
    p_from DATE,
    p_to DATE,
    p_wallet_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
    income NUMERIC,
    expense NUMERIC,
    net NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(t.normalized_amount) FILTER (WHERE t.normalized_amount > 0), 0)::NUMERIC as income,
        COALESCE(SUM(t.normalized_amount) FILTER (WHERE t.normalized_amount < 0), 0)::NUMERIC as expense,
        COALESCE(SUM(t.normalized_amount), 0)::NUMERIC as net
    FROM public.transactions t
    LEFT JOIN public.categories c ON t.category_id = c.category_id
    WHERE t.user_id = p_user_id
      AND t.date >= p_from 
      AND t.date <= p_to
      AND t.status = 'completed'
      AND t.transfer_id IS NULL -- Exclude transfers from cashflow
      AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
      AND (p_category_id IS NULL OR c.category_id = p_category_id OR c.parent_id = p_category_id);
END;
$$;

-- Update get_balance_trend
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
    IF p_category_id IS NULL THEN
        SELECT COALESCE(SUM(initial_balance), 0) INTO v_initial_balance
        FROM public.wallets
        WHERE user_id = p_user_id 
          AND is_active = TRUE
          AND (p_wallet_id IS NULL OR id = p_wallet_id)
          AND (p_wallet_id IS NOT NULL OR exclude_from_net_worth = FALSE);

        v_initial_balance := v_initial_balance + COALESCE((
            SELECT SUM(normalized_amount)
            FROM public.transactions t
            JOIN public.wallets w ON t.wallet_id = w.id
            WHERE t.user_id = p_user_id 
              AND t.date < p_from
              AND t.status = 'completed'
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
          AND t.status = 'completed'
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

-- Update get_category_breakdown
CREATE OR REPLACE FUNCTION public.get_category_breakdown(
    p_user_id UUID,
    p_from DATE,
    p_to DATE,
    p_wallet_id UUID DEFAULT NULL,
    p_category_id UUID DEFAULT NULL
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    color TEXT,
    icon TEXT,
    amount NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.category_id,
        COALESCE(c.category_name, 'Uncategorized') as category_name,
        COALESCE(c.color, 'slate') as color,
        COALESCE(c.icon, 'HelpCircle') as icon,
        SUM(t.normalized_amount)::NUMERIC as amount
    FROM public.transactions t
    LEFT JOIN public.categories c ON t.category_id = c.category_id
    WHERE t.user_id = p_user_id
      AND t.date >= p_from 
      AND t.date <= p_to
      AND t.status = 'completed'
      AND t.transfer_id IS NULL -- Exclude transfers from expense breakdown
      AND t.normalized_amount < 0
      AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
      AND (p_category_id IS NULL OR c.parent_id = p_category_id OR c.category_id = p_category_id)
    GROUP BY c.category_id, c.category_name, c.color, c.icon
    ORDER BY amount ASC;
END;
$$;

-- Update get_monthly_cashflow
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
        AND t.status = 'completed'
        AND t.transfer_id IS NULL -- Exclude transfers from monthly cashflow
        AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
    LEFT JOIN public.categories c ON t.category_id = c.category_id
    WHERE (p_category_id IS NULL OR c.category_id = p_category_id OR c.parent_id = p_category_id)
    GROUP BY m.month_str, m.month_start
    ORDER BY m.month_start ASC;
END;
$$;

-- Update get_wallet_balances (with real_balance for regular wallets)
DROP FUNCTION IF EXISTS public.get_wallet_balances(UUID, BOOLEAN);
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
              AND t.status = 'completed'
        ), 0))::NUMERIC as balance,
        (CASE 
            WHEN w.type = 'regular' THEN
                w.initial_balance + COALESCE((
                    SELECT SUM(t.normalized_amount)
                    FROM public.transactions t
                    WHERE t.wallet_id = w.id
                      AND t.status = 'completed'
                      AND (
                          t.transfer_id IS NULL
                          OR NOT EXISTS (
                              SELECT 1 
                              FROM public.transactions t2
                              JOIN public.wallets w2 ON t2.wallet_id = w2.id
                              WHERE t2.transfer_id = t.transfer_id
                                AND t2.transaction_id != t.transaction_id
                                AND w2.type = 'savings'
                                AND w2.is_active = TRUE
                          )
                      )
                ), 0)
            ELSE
                w.initial_balance + COALESCE((
                    SELECT SUM(t.normalized_amount)
                    FROM public.transactions t
                    WHERE t.wallet_id = w.id
                      AND t.status = 'completed'
                ), 0)
        END)::NUMERIC as real_balance
    FROM public.wallets w
    WHERE w.user_id = p_user_id
      AND w.is_active = p_is_active;
END;
$$;
