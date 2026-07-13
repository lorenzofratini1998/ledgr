CREATE TYPE public.wallet_type AS ENUM ('regular', 'savings', 'investment');

CREATE TABLE public.wallets
(
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    type                public.wallet_type NOT NULL DEFAULT 'regular',
    initial_balance     NUMERIC(18, 4) DEFAULT 0.0000 NOT NULL,
    description         TEXT,
    is_default          BOOLEAN DEFAULT FALSE NOT NULL,
    currency_code       CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    color               TEXT,
    icon                TEXT,
    is_active           BOOLEAN DEFAULT TRUE NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by          UUID,
    updated_by          UUID
);

CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallets_type ON public.wallets(type);
CREATE INDEX idx_wallets_is_active ON public.wallets(is_active);

CREATE TRIGGER set_audit_wallets 
    BEFORE INSERT OR UPDATE ON public.wallets 
    FOR EACH ROW 
    EXECUTE FUNCTION public.refresh_audit_columns();

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wallets" 
ON public.wallets 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id);