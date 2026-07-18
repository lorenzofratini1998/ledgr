CREATE TYPE public.wallet_type AS ENUM ('regular', 'savings', 'investment');

CREATE TABLE public.wallets
(
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    type                    public.wallet_type NOT NULL DEFAULT 'regular',
    initial_balance         NUMERIC(18, 4) DEFAULT 0.0000 NOT NULL,
    description             TEXT,
    is_default              BOOLEAN DEFAULT FALSE NOT NULL,
    currency_code           CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    color                   TEXT,
    icon                    TEXT,
    exclude_from_net_worth  BOOLEAN DEFAULT FALSE NOT NULL,
    is_active               BOOLEAN DEFAULT TRUE NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallets_type ON public.wallets(type);
CREATE INDEX idx_wallets_is_active ON public.wallets(is_active);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wallets"
    ON public.wallets
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_wallets
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW
EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE OR REPLACE FUNCTION public.ensure_single_default_wallet()
    RETURNS TRIGGER AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- The new/updated wallet is being explicitly set as default
    IF NEW.is_default = TRUE THEN
        -- Unset all other wallets for this user
        UPDATE public.wallets
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = TRUE;
    END IF;

    -- The wallet is being inserted and the user has no other active wallets
    IF TG_OP = 'INSERT' AND NEW.is_default = FALSE THEN
        IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = NEW.user_id AND is_active = TRUE) THEN
            NEW.is_default := TRUE;
        END IF;
    END IF;

    -- The wallet is being un-archived and the user has no other active wallets
    IF TG_OP = 'UPDATE' AND OLD.is_active = FALSE AND NEW.is_active = TRUE AND NEW.is_default = FALSE THEN
        IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = NEW.user_id AND id != NEW.id AND is_active = TRUE) THEN
            NEW.is_default := TRUE;
        END IF;
    END IF;

    -- The default wallet is being archived or explicitly unset from being default
    IF TG_OP = 'UPDATE' AND OLD.is_default = TRUE AND (NEW.is_default = FALSE OR NEW.is_active = FALSE) THEN
        UPDATE public.wallets
        SET is_default = TRUE
        WHERE id = (
            SELECT id FROM public.wallets
            WHERE user_id = NEW.user_id
              AND id != NEW.id
              AND is_active = TRUE
            ORDER BY created_at
            LIMIT 1
        );

        NEW.is_default := FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_wallet_default_change
    BEFORE INSERT OR UPDATE ON public.wallets
    FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_default_wallet();