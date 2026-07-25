-- Create get_category_breakdown
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
        c.category_name,
        c.color,
        c.icon,
        SUM(t.normalized_amount)::NUMERIC as amount
    FROM public.transactions t
    JOIN public.categories c ON t.category_id = c.category_id
    WHERE t.user_id = p_user_id
      AND t.date >= p_from 
      AND t.date <= p_to
      AND t.normalized_amount < 0
      AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
      AND (p_category_id IS NULL OR c.parent_id = p_category_id OR c.category_id = p_category_id)
    GROUP BY c.category_id, c.category_name, c.color, c.icon
    ORDER BY amount ASC;
END;
$$;
