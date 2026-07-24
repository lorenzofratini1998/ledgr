
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

-- ============================================================================
-- Pre-configured Demo User (For seeded realistic data)
-- ============================================================================
-- Credentials:
--   Email:    demo@example.com
--   Password: Password123!
--   Username: demouser_local
--   UUID:     e0a75f82-3b1a-42c9-9481-8930b2c1f9d2
-- ============================================================================

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
     'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
     'authenticated',
     'authenticated',
     'demo@example.com',
     crypt('Password123!', gen_salt('bf')),
     NOW(),
     NOW(),
     '{"provider": "email", "providers": ["email"]}',
     '{"display_name": "Demo User", "username": "demouser_local"}',
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
    'b4912e54-3f11-4211-9a7c-502a831e5f88',
    'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
    'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
    'email',
    '{"sub": "e0a75f82-3b1a-42c9-9481-8930b2c1f9d2", "email": "demo@example.com"}',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Seed User Preferences & Onboarding Metadata for Demo User
-- ============================================================================

-- Update auth.users metadata to set onboarding_completed = true
UPDATE auth.users
SET 
    raw_user_meta_data = raw_user_meta_data || '{"onboarding_completed": true}'::jsonb,
    raw_app_meta_data  = raw_app_meta_data  || '{"onboarding_completed": true}'::jsonb
WHERE id = 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2';

-- Seed initial preferences with EUR as primary currency
INSERT INTO public.user_preferences (
    profile_id,
    language_locale,
    primary_currency_code,
    date_format,
    theme,
    default_dashboard_range,
    biometric_lock_enabled,
    lock_timeout_seconds,
    notify_budget_breach,
    notify_recurring_reminder,
    budget_alert_threshold
) VALUES (
    'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
    'en-US',
    'EUR',
    'DD/MM/YYYY',
    'system',
    'last_30_days',
    FALSE,
    10,
    TRUE,
    TRUE,
    80
) ON CONFLICT (profile_id) DO UPDATE 
SET primary_currency_code = EXCLUDED.primary_currency_code;

-- ============================================================================
-- Seed Wallets for Demo User
-- ============================================================================

INSERT INTO public.wallets (
    id,
    user_id,
    name,
    type,
    initial_balance,
    description,
    is_default,
    currency_code,
    color,
    icon,
    exclude_from_net_worth,
    is_active
) VALUES
    (
        'c1111111-1111-4111-8111-111111111111',
        'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
        'Main Checking',
        'regular',
        2500.0000,
        'Primary daily spending account',
        true,
        'EUR',
        'blue',
        'credit-card',
        false,
        true
    ),
    (
        'c2222222-2222-4222-8222-222222222222',
        'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
        'Emergency Fund',
        'savings',
        10000.0000,
        'High-yield savings for emergency fund',
        false,
        'EUR',
        'emerald',
        'piggy-bank',
        false,
        true
    ),
    (
        'c3333333-3333-4333-8333-333333333333',
        'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
        'US Brokerage',
        'investment',
        5000.0000,
        'US Stocks & ETFs portfolio',
        false,
        'USD',
        'violet',
        'trending-up',
        false,
        true
    ),
    (
        'c4444444-4444-4444-8444-444444444444',
        'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
        'Physical Cash',
        'regular',
        150.0000,
        'Cash in physical wallet',
        false,
        'EUR',
        'amber',
        'wallet',
        false,
        true
    ),
    (
        'c5555555-5555-4555-8555-555555555555',
        'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2',
        'UK Travel Card',
        'regular',
        350.0000,
        'Revolut GBP sub-account for trips',
        false,
        'GBP',
        'slate',
        'landmark',
        false,
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Seed Categories for Demo User
-- ============================================================================

-- Insert Parent Categories
INSERT INTO public.categories (
    category_id,
    user_id,
    category_name,
    category_description,
    parent_id,
    color,
    icon,
    is_active
) VALUES
    ('d1111111-1111-4111-8111-111111111111', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Housing', 'Rent, mortgage, and home maintenance', NULL, 'blue', 'home', true),
    ('d2222222-2222-4222-8222-222222222222', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Food & Dining', 'Groceries, restaurants, and coffee shops', NULL, 'amber', 'coffee', true),
    ('d3333333-3333-4333-8333-333333333333', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Transportation', 'Public transit, fuel, and vehicle upkeep', NULL, 'slate', 'car', true),
    ('d4444444-4444-4444-8444-444444444444', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Utilities', 'Electricity, internet, water, and gas', NULL, 'cyan', 'zap', true),
    ('d5555555-5555-4555-8555-555555555555', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Entertainment', 'Events, subscriptions, and leisure activities', NULL, 'violet', 'heart', true),
    ('d6666666-6666-4666-8666-666666666666', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Healthcare', 'Medical expenses, pharmacy, and health care', NULL, 'rose', 'heart', true),
    ('d7777777-7777-4777-8777-777777777777', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Shopping', 'Clothing, electronics, and general purchases', NULL, 'fuchsia', 'shopping-cart', true),
    ('d8888888-8888-4888-8888-888888888888', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Income', 'Salaries, freelance payouts, and investment gains', NULL, 'emerald', 'gift', true)
ON CONFLICT (category_id) DO NOTHING;

-- Insert Subcategories
INSERT INTO public.categories (
    category_id,
    user_id,
    category_name,
    category_description,
    parent_id,
    color,
    icon,
    is_active
) VALUES
    -- Housing Subcategories
    ('d1111111-1111-4111-8111-111111111112', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Rent / Mortgage', 'Monthly housing payment', 'd1111111-1111-4111-8111-111111111111', 'blue', 'home', true),
    ('d1111111-1111-4111-8111-111111111113', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Home Maintenance', 'Repairs and home improvements', 'd1111111-1111-4111-8111-111111111111', 'blue', 'home', true),

    -- Food Subcategories
    ('d2222222-2222-4222-8222-222222222223', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Groceries', 'Supermarket purchases', 'd2222222-2222-4222-8222-222222222222', 'amber', 'shopping-cart', true),
    ('d2222222-2222-4222-8222-222222222224', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Restaurants & Cafes', 'Dining out and coffee runs', 'd2222222-2222-4222-8222-222222222222', 'amber', 'coffee', true),

    -- Transportation Subcategories
    ('d3333333-3333-4333-8333-333333333334', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Public Transit', 'Train, bus, and subway tickets', 'd3333333-3333-4333-8333-333333333333', 'slate', 'car', true),
    ('d3333333-3333-4333-8333-333333333335', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Fuel & Parking', 'Gas stations and parking fees', 'd3333333-3333-4333-8333-333333333333', 'slate', 'car', true),

    -- Utilities Subcategories
    ('d4444444-4444-4444-8444-444444444445', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Electricity & Heating', 'Power and heating bills', 'd4444444-4444-4444-8444-444444444444', 'cyan', 'zap', true),
    ('d4444444-4444-4444-8444-444444444446', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Internet & Mobile', 'Home fiber and cellular service', 'd4444444-4444-4444-8444-444444444444', 'cyan', 'zap', true),

    -- Entertainment Subcategories
    ('d5555555-5555-4555-8555-555555555556', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Streaming Services', 'Netflix, Spotify, etc.', 'd5555555-5555-4555-8555-555555555555', 'violet', 'heart', true),

    -- Healthcare Subcategories
    ('d6666666-6666-4666-8666-666666666667', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Pharmacy', 'Medications and pharmacy products', 'd6666666-6666-4666-8666-666666666666', 'rose', 'heart', true),

    -- Income Subcategories
    ('d8888888-8888-4888-8888-888888888889', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Salary', 'Main employment salary', 'd8888888-8888-4888-8888-888888888888', 'emerald', 'gift', true),
    ('d8888888-8888-4888-8888-88888888888a', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Freelance', 'Side projects and consulting', 'd8888888-8888-4888-8888-888888888888', 'emerald', 'gift', true)
ON CONFLICT (category_id) DO NOTHING;

-- ============================================================================
-- Ledgr Local Development Seed Data: Tags, Transactions & Tags Mapping
-- Period: 2024-01-01 to Present
-- ============================================================================

-- 1. Insert Tags (Subscriptions tag removed)
INSERT INTO public.tags (
    tag_id, 
    user_id, 
    tag_name, 
    tag_description, 
    color, 
    icon, 
    is_active
) VALUES
    ('e1111111-1111-4111-8111-111111111111', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Vacation', 'Travel and holiday expenses', 'amber', 'gift', true),
    ('e2222222-2222-4222-8222-222222222222', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Essential', 'Non-negotiable living expenses', 'emerald', 'tag', true),
    ('e3333333-3333-4333-8333-333333333333', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Work-Related', 'Business and career expenses', 'blue', 'tag', true),
    ('e4444444-4444-4444-8444-444444444444', 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2', 'Personal Care', 'Grooming, self-care, and wellness', 'rose', 'heart', true)
ON CONFLICT (tag_id) DO NOTHING;


-- 2. Generate Historical Transactions & Tag Mappings
DO $$
DECLARE
    v_user_id UUID := 'e0a75f82-3b1a-42c9-9481-8930b2c1f9d2';
    
    -- Wallets
    v_w_checking  UUID := 'c1111111-1111-4111-8111-111111111111'; -- EUR
    v_w_brokerage UUID := 'c3333333-3333-4333-8333-333333333333'; -- USD
    v_w_cash      UUID := 'c4444444-4444-4444-8444-444444444444'; -- EUR
    v_w_uk_card   UUID := 'c5555555-5555-4555-8555-555555555555'; -- GBP

    -- Categories
    v_c_rent       UUID := 'd1111111-1111-4111-8111-111111111112';
    v_c_groceries  UUID := 'd2222222-2222-4222-8222-222222222223';
    v_c_dining     UUID := 'd2222222-2222-4222-8222-222222222224';
    v_c_fuel       UUID := 'd3333333-3333-4333-8333-333333333335';
    v_c_power      UUID := 'd4444444-4444-4444-8444-444444444445';
    v_c_internet   UUID := 'd4444444-4444-4444-8444-444444444446';
    v_c_streaming  UUID := 'd5555555-5555-4555-8555-555555555556';
    v_c_shopping   UUID := 'd7777777-7777-4777-8777-777777777777';
    v_c_salary     UUID := 'd8888888-8888-4888-8888-888888888889';
    v_c_freelance  UUID := 'd8888888-8888-4888-8888-88888888888a';

    -- Tags
    v_t_vacation  UUID := 'e1111111-1111-4111-8111-111111111111';
    v_t_essential UUID := 'e2222222-2222-4222-8222-222222222222';
    v_t_work      UUID := 'e3333333-3333-4333-8333-333333333333';

    -- Iteration Variables
    curr_date DATE;
    curr_month_start DATE;
    tx_id UUID;
    amt NUMERIC;
    norm_amt NUMERIC;
    ex_rate NUMERIC;
BEGIN

    -- -------------------------------------------------------------------------
    -- A. MONTHLY RECURRING TRANSACTIONS
    -- -------------------------------------------------------------------------
    FOR curr_month_start IN SELECT generate_series('2024-01-01'::DATE, CURRENT_DATE, '1 month'::INTERVAL)::DATE LOOP
        
        -- 1. Monthly Rent (1st of month)
        tx_id := gen_random_uuid();
        INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
        VALUES (tx_id, v_user_id, v_w_checking, v_c_rent, curr_month_start, 'Monthly Apartment Rent', -950.0000, -950.0000, 1.000000, 'EUR');
        INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_essential, v_user_id);

        -- 2. Utilities: Gas & Electricity (5th of month)
        IF curr_month_start + 4 <= CURRENT_DATE THEN
            tx_id := gen_random_uuid();
            amt := -1 * (75.00 + (random() * 45.00));
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_power, curr_month_start + 4, 'Energy & Gas Utility Bill', ROUND(amt, 4), ROUND(amt, 4), 1.000000, 'EUR');
            INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_essential, v_user_id);
        END IF;

        -- 3. Internet & Mobile Bill (10th of month)
        IF curr_month_start + 9 <= CURRENT_DATE THEN
            tx_id := gen_random_uuid();
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_internet, curr_month_start + 9, 'Fiber Internet & Mobile Plan', -45.0000, -45.0000, 1.000000, 'EUR');
            INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_essential, v_user_id);
        END IF;

        -- 4. Streaming Subscriptions (12th of month) - Untagged
        IF curr_month_start + 11 <= CURRENT_DATE THEN
            tx_id := gen_random_uuid();
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_streaming, curr_month_start + 11, 'Streaming Services Subscription', -17.9900, -17.9900, 1.000000, 'EUR');
        END IF;

        -- 5. Freelance Income (15th of month, alternate months)
        IF EXTRACT(MONTH FROM curr_month_start)::INT % 2 = 1 AND curr_month_start + 14 <= CURRENT_DATE THEN
            tx_id := gen_random_uuid();
            amt := 450.00 + (random() * 400.00);
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_freelance, curr_month_start + 14, 'Freelance Consulting Payout', ROUND(amt, 4), ROUND(amt, 4), 1.000000, 'EUR');
            INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_work, v_user_id);
        END IF;

        -- 6. US Stock Dividend Income (20th of month - USD Wallet)
        IF curr_month_start + 19 <= CURRENT_DATE THEN
            tx_id := gen_random_uuid();
            amt := 25.00 + (random() * 30.00);
            ex_rate := 0.920000;
            norm_amt := ROUND(amt * ex_rate, 4);
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_brokerage, NULL, curr_month_start + 19, 'US Stock Quarterly Dividend', ROUND(amt, 4), norm_amt, ex_rate, 'USD');
        END IF;

        -- 7. Monthly Salary (27th of month)
        IF curr_month_start + 26 <= CURRENT_DATE THEN
            tx_id := gen_random_uuid();
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_salary, curr_month_start + 26, 'Monthly Salary Deposit', 2850.0000, 2850.0000, 1.000000, 'EUR');
            INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_work, v_user_id);
        END IF;

    END LOOP;

    -- -------------------------------------------------------------------------
    -- B. DAILY VARIABLE EXPENSES
    -- -------------------------------------------------------------------------
    FOR curr_date IN SELECT generate_series('2024-01-01'::DATE, CURRENT_DATE, '1 day'::INTERVAL)::DATE LOOP

        -- Groceries (Tue, Thu, Sat)
        IF EXTRACT(ISODOW FROM curr_date) IN (2, 4, 6) AND random() < 0.75 THEN
            tx_id := gen_random_uuid();
            amt := -1 * (28.00 + (random() * 65.00));
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_groceries, curr_date, 'Supermarket Groceries', ROUND(amt, 4), ROUND(amt, 4), 1.000000, 'EUR');
            
            IF random() < 0.8 THEN
                INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_essential, v_user_id);
            END IF;
        END IF;

        -- Dining & Coffee (Wed, Fri, Sat, Sun)
        IF EXTRACT(ISODOW FROM curr_date) IN (3, 5, 6, 7) AND random() < 0.65 THEN
            tx_id := gen_random_uuid();
            IF random() < 0.3 THEN
                amt := -1 * (3.50 + (random() * 10.00));
                INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
                VALUES (tx_id, v_user_id, v_w_cash, v_c_dining, curr_date, 'Espresso & Bakery', ROUND(amt, 4), ROUND(amt, 4), 1.000000, 'EUR');
            ELSE
                amt := -1 * (18.00 + (random() * 55.00));
                INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
                VALUES (tx_id, v_user_id, v_w_checking, v_c_dining, curr_date, 'Restaurant Dinner', ROUND(amt, 4), ROUND(amt, 4), 1.000000, 'EUR');
            END IF;
        END IF;

        -- Fuel / Transit (Mondays or Fridays)
        IF EXTRACT(ISODOW FROM curr_date) IN (1, 5) AND random() < 0.5 THEN
            tx_id := gen_random_uuid();
            amt := -1 * (25.00 + (random() * 45.00));
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_fuel, curr_date, 'Gas Station Fuel', ROUND(amt, 4), ROUND(amt, 4), 1.000000, 'EUR');
            INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_essential, v_user_id);
        END IF;

        -- Shopping (Occasional 8th & 22nd of month)
        IF EXTRACT(DAY FROM curr_date) IN (8, 22) AND random() < 0.5 THEN
            tx_id := gen_random_uuid();
            amt := -1 * (35.00 + (random() * 120.00));
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_checking, v_c_shopping, curr_date, 'Clothing & Retail Purchase', ROUND(amt, 4), ROUND(amt, 4), 1.000000, 'EUR');
        END IF;

        -- Summer Vacation Spikes (August 10–20 in GBP on UK Travel Card)
        IF EXTRACT(MONTH FROM curr_date) = 8 AND EXTRACT(DAY FROM curr_date) BETWEEN 10 AND 20 THEN
            tx_id := gen_random_uuid();
            amt := -1 * (15.00 + (random() * 70.00));
            ex_rate := 1.180000;
            norm_amt := ROUND(amt * ex_rate, 4);
            INSERT INTO public.transactions (transaction_id, user_id, wallet_id, category_id, date, description, amount, normalized_amount, exchange_rate, currency_code)
            VALUES (tx_id, v_user_id, v_w_uk_card, v_c_dining, curr_date, 'London Trip Dining / Transit', ROUND(amt, 4), norm_amt, ex_rate, 'GBP');
            INSERT INTO public.transactions_tags (transaction_id, tag_id, user_id) VALUES (tx_id, v_t_vacation, v_user_id);
        END IF;

    END LOOP;

END $$;
