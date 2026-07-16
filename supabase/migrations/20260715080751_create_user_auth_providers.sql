CREATE TABLE public.user_auth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
    provider_id TEXT NOT NULL REFERENCES public.auth_providers(id) ON UPDATE CASCADE, 
    is_active BOOLEAN DEFAULT TRUE NOT NULL, 
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_auth_providers_combination UNIQUE (user_id, provider_id)
);

ALTER TABLE public.user_auth_providers ENABLE ROW LEVEL SECURITY;

CREATE INDEX id_user_auth_providers_user_id ON public.user_auth_providers(user_id);

CREATE TRIGGER set_updated_at_user_auth_providers
    BEFORE UPDATE ON public.user_auth_providers
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE POLICY "Users can manage their own authentication providers"
    ON public.user_auth_providers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);