CREATE TABLE auth_providers(
	id TEXT PRIMARY KEY,
	is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE auth_providers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_auth_providers
    BEFORE UPDATE ON auth_providers
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE POLICY "Allow read-only access to all users" 
    ON auth_providers FOR SELECT TO anon, authenticated USING (true);

INSERT INTO auth_providers (id, is_enabled) 
VALUES 
    ('email', true),
    ('google', true),
    ('github', true);