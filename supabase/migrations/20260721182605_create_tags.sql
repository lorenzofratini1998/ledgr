CREATE TABLE public.tags (
    tag_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tag_name            TEXT NOT NULL,
    tag_description     TEXT,
    color               TEXT,
    icon                TEXT,
    is_active           BOOLEAN DEFAULT TRUE NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_user_tag_name UNIQUE NULLS NOT DISTINCT (user_id, tag_name)
);

CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_tags_is_active ON public.tags(is_active);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tags"
    ON public.tags FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_tags
    BEFORE UPDATE ON public.tags
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);