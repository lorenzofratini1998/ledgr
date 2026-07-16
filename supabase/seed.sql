
-- ============================================================================
-- Ledgr Local Development Seed Data
-- ============================================================================
-- This script seeds a test user for local development only.
-- It will NOT run against linked or production projects because seed.sql
-- is only executed by 'supabase db reset' in local environments.
--
-- Test User Credentials:
--   Email:    test@example.com
--   Password: Password123!
--   Username: Testuser
--
-- ============================================================================

-- Insert test user into auth.users
-- Password hash generated with: crypt('Password123!', gen_salt('bf'))
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
     '00000000-0000-0000-0000-000000000000',
     'f7e710c7-2e9c-4925-a8d8-6a13def5fe41',
     'authenticated',
     'authenticated',
     'test@example.com',
     crypt('Password123!', gen_salt('bf')),
     NOW(),
     NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"display_name": "Test User", "username": "testuser_local"}',
     NOW(),
     NOW(),
     '',
     '',
     '',
     ''
 ) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    'e9ad1c46-1ce4-415f-9e39-12a1e9f617d6',
    'f7e710c7-2e9c-4925-a8d8-6a13def5fe41',
    'f7e710c7-2e9c-4925-a8d8-6a13def5fe41', -- provider_id usually matches user_id for email
    'email',
    '{"sub": "f7e710c7-2e9c-4925-a8d8-6a13def5fe41", "email": "test@example.com"}',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;