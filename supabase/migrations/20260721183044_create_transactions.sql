CREATE TABLE public.transactions (
    transaction_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_id           UUID NOT NULL REFERENCES public.wallets(id) ON DELETE RESTRICT,
    category_id         UUID REFERENCES public.categories(category_id) ON DELETE SET NULL,
    date                DATE NOT NULL,
    description         TEXT NOT NULL,
    amount              NUMERIC(18, 4) NOT NULL,
    normalized_amount   NUMERIC(18, 4) NOT NULL,
    exchange_rate       NUMERIC(18, 6) DEFAULT 1.000000 NOT NULL,
    currency_code       CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    transfer_id         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_transfer_id ON public.transactions(transfer_id);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions"
    ON public.transactions FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_transactions
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

---- TRANSACTIONS_TAGS ----
CREATE TABLE public.transactions_tags (
    transaction_id  UUID NOT NULL REFERENCES public.transactions(transaction_id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES public.tags(tag_id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (transaction_id, tag_id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_tags_transaction_id ON public.transactions_tags(transaction_id);
CREATE INDEX idx_transactions_tags_tag_id ON public.transactions_tags(tag_id);

ALTER TABLE public.transactions_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transaction tags"
    ON public.transactions_tags FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_transactions_tags
    BEFORE UPDATE ON public.transactions_tags
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);
