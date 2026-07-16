CREATE TABLE public.user_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    subscription_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_profile_device UNIQUE (profile_id, device_name)
);

ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_update_at_user_push_subscriptions
    BEFORE UPDATE ON public.user_push_subscriptions
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE POLICY "Users can manage their own device push tokens" 
    ON public.user_push_subscriptions FOR ALL TO authenticated USING (auth.uid() = profile_id);
