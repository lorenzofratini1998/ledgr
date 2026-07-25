-- Create get_cashflow_summary
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
      AND (p_wallet_id IS NULL OR t.wallet_id = p_wallet_id)
      AND (p_category_id IS NULL OR c.category_id = p_category_id OR c.parent_id = p_category_id);
END;
$$;
