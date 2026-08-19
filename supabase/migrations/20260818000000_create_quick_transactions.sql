CREATE TABLE public.quick_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name            VARCHAR(50) NOT NULL,
    wallet_id       UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES public.categories(category_id) ON DELETE SET NULL,
    amount          NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    currency_code   CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    type            VARCHAR(10) NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    description     TEXT,
    icon            VARCHAR(50),
    color           VARCHAR(30),
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quick_transactions_user_id ON public.quick_transactions(user_id);
CREATE INDEX idx_quick_transactions_wallet_id ON public.quick_transactions(wallet_id);
CREATE INDEX idx_quick_transactions_category_id ON public.quick_transactions(category_id);

ALTER TABLE public.quick_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quick transactions"
    ON public.quick_transactions FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_quick_transactions
    BEFORE UPDATE ON public.quick_transactions
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE OR REPLACE FUNCTION check_quick_transactions_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INT;
BEGIN
    SELECT COUNT(*) INTO current_count 
    FROM public.quick_transactions 
    WHERE user_id = NEW.user_id;

    IF current_count >= 5 THEN
        RAISE EXCEPTION 'QUICK_TRANSACTIONS_LIMIT_EXCEEDED: Maximum 5 quick transactions allowed per user.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_quick_transactions_limit
BEFORE INSERT ON public.quick_transactions
FOR EACH ROW EXECUTE FUNCTION check_quick_transactions_limit();
