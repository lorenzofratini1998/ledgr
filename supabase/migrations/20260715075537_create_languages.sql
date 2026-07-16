CREATE TABLE public.languages (
    locale VARCHAR(5) PRIMARY KEY,
    iso_code CHAR(2) NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_languages
    BEFORE UPDATE ON public.languages
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE POLICY "Allow read-only access to all users" 
    ON public.languages FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.languages (locale, iso_code, name, native_name, icon, is_default, is_enabled) 
VALUES 
    ('en-US', 'en', 'English', 'English', 'usa', true, true),
    ('es-ES', 'es', 'Spanish', 'Español', 'spain', false, false),
    ('de-DE', 'de', 'German', 'Deutsch', 'germany', false, false),
    ('it-IT', 'it', 'Italian', 'Italiano', 'italy', false, true);