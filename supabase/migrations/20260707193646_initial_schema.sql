CREATE OR REPLACE FUNCTION refresh_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.refresh_audit_columns()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.created_at = CURRENT_TIMESTAMP;
        NEW.updated_at = CURRENT_TIMESTAMP;
        NEW.created_by = auth.uid();
        NEW.updated_by = auth.uid();
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.updated_at = CURRENT_TIMESTAMP;
        NEW.updated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CURRENCIES
CREATE TABLE currencies (
	iso_code CHAR(3) PRIMARY KEY,
	iso_numeric CHAR(3) NOT NULL,
	name TEXT NOT NULL,
	symbol VARCHAR(10) NOT NULL,
	start_date DATE NOT NULL,
	is_default BOOLEAN DEFAULT FALSE NOT NULL,
	is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at_currencies BEFORE UPDATE ON currencies FOR EACH ROW EXECUTE FUNCTION refresh_updated_at_column();
CREATE POLICY "Allow read-only access to all users" ON public.currencies FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.currencies (iso_code, iso_numeric, name, symbol, start_date, is_default, is_enabled) VALUES
('AED', '784', 'United Arab Emirates Dirham', 'د.إ', '1996-04-11', false, true),
('AFN', '971', 'Afghan Afghani', '؋', '1999-01-04', false, true),
('ALL', '008', 'Albanian Lek', 'L', '1998-07-07', false, true),
('AMD', '051', 'Armenian Dram', '֏', '1994-03-31', false, true),
('ANG', '532', 'Netherlands Antillean Gulden', 'ƒ', '1948-06-21', false, true),
('AOA', '973', 'Angolan Kwanza', 'Kz', '1999-01-04', false, true),
('ARS', '032', 'Argentine Peso', '$', '1998-07-07', false, true),
('AUD', '036', 'Australian Dollar', '$', '1981-01-02', false, true),
('AWG', '533', 'Aruban Florin', 'ƒ', '1999-01-04', false, true),
('AZN', '944', 'Azerbaijani Manat', '₼', '1994-09-15', false, true),
('BAM', '977', 'Bosnia and Herzegovina Convertible Mark', 'КМ', '1999-01-04', false, true),
('BBD', '052', 'Barbadian Dollar', '$', '1999-01-04', false, true),
('BDT', '050', 'Bangladeshi Taka', '৳', '1998-07-07', false, true),
('BHD', '048', 'Bahraini Dinar', 'د.ب', '1998-07-07', false, true),
('BIF', '108', 'Burundian Franc', 'Fr', '1999-01-04', false, true),
('BMD', '060', 'Bermudian Dollar', '$', '1972-02-06', false, true),
('BND', '096', 'Brunei Dollar', '$', '1981-01-02', false, true),
('BOB', '068', 'Bolivian Boliviano', 'Bs.', '1998-07-07', false, true),
('BRL', '986', 'Brazilian Real', 'R$', '1994-01-03', false, true),
('BSD', '044', 'Bahamian Dollar', '$', '1999-01-04', false, true),
('BTN', '064', 'Bhutanese Ngultrum', 'Nu.', '1994-03-01', false, true),
('BWP', '072', 'Botswana Pula', 'P', '1999-01-04', false, true),
('BYN', '933', 'Belarusian Ruble', 'Br', '2004-09-14', false, true),
('BZD', '084', 'Belize Dollar', '$', '1999-01-04', false, true),
('CAD', '124', 'Canadian Dollar', '$', '1953-05-11', false, true),
('CDF', '976', 'Congolese Franc', 'Fr', '1999-04-02', false, true),
('CHF', '756', 'Swiss Franc', 'CHF', '1949-12-21', false, true),
('CLP', '152', 'Chilean Peso', '$', '1982-08-09', false, true),
('CNH', '', 'Chinese Renminbi Yuan Offshore', '¥', '2011-08-19', false, true),
('CNY', '156', 'Chinese Renminbi Yuan', '¥', '1981-01-02', false, true),
('COP', '170', 'Colombian Peso', '$', '1998-07-07', false, true),
('CRC', '188', 'Costa Rican Colón', '₡', '1999-01-04', false, true),
('CUP', '192', 'Cuban Peso', '$', '1999-01-04', false, true),
('CVE', '132', 'Cape Verdean Escudo', '$', '1998-07-08', false, true),
('CZK', '203', 'Czech Koruna', 'Kč', '1991-01-01', false, true),
('DJF', '262', 'Djiboutian Franc', 'Fdj', '1999-01-04', false, true),
('DKK', '208', 'Danish Krone', 'kr.', '1949-12-21', false, true),
('DOP', '214', 'Dominican Peso', '$', '1999-01-04', false, true),
('DZD', '012', 'Algerian Dinar', 'د.ج', '1998-07-07', false, true),
('EGP', '818', 'Egyptian Pound', 'ج.م', '1998-07-07', false, true),
('ERN', '232', 'Eritrean Nakfa', 'Nfk', '1999-01-04', false, true),
('ETB', '230', 'Ethiopian Birr', 'Br', '1998-07-07', false, true),
('EUR', '978', 'Euro', '€', '1999-01-04', true, true), -- DEFAULT
('FJD', '242', 'Fijian Dollar', '$', '1999-01-04', false, true),
('FKP', '238', 'Falkland Pound', '£', '1966-02-14', false, true),
('GBP', '826', 'British Pound', '£', '1949-12-21', false, true),
('GEL', '981', 'Georgian Lari', '₾', '1995-09-29', false, true),
('GGP', '', 'Guernsey Pound', '£', '1949-12-21', false, true),
('GHS', '936', 'Ghanaian Cedi', '₵', '2007-07-02', false, true),
('GIP', '292', 'Gibraltar Pound', '£', '1999-01-04', false, true),
('GMD', '270', 'Gambian Dalasi', 'D', '1999-01-04', false, true),
('GNF', '324', 'Guinean Franc', 'Fr', '1998-07-07', false, true),
('GTQ', '320', 'Guatemalan Quetzal', 'Q', '1999-01-04', false, true),
('GYD', '328', 'Guyanese Dollar', '$', '1999-01-04', false, true),
('HKD', '344', 'Hong Kong Dollar', '$', '1981-01-02', false, true),
('HNL', '340', 'Honduran Lempira', 'L', '1999-01-04', false, true),
('HTG', '332', 'Haitian Gourde', 'G', '1999-01-04', false, true),
('HUF', '348', 'Hungarian Forint', 'Ft', '1994-03-31', false, true),
('IDR', '360', 'Indonesian Rupiah', 'Rp', '1993-01-05', false, true),
('ILS', '376', 'Israeli New Shekel', '₪', '1996-04-11', false, true),
('IMP', '', 'Isle of Man Pound', '£', '1949-12-21', false, true),
('INR', '356', 'Indian Rupee', '₹', '1994-03-01', false, true),
('IQD', '368', 'Iraqi Dinar', 'ع.د', '1999-01-04', false, true),
('IRR', '364', 'Iranian Rial', '﷼', '1998-07-07', false, true),
('ISK', '352', 'Icelandic Króna', 'kr.', '1980-01-02', false, true),
('JEP', '', 'Jersey Pound', '£', '1949-12-21', false, true),
('JMD', '388', 'Jamaican Dollar', '$', '1999-01-04', false, true),
('JOD', '400', 'Jordanian Dinar', 'د.ا', '1995-10-23', false, true),
('JPY', '392', 'Japanese Yen', '¥', '1969-12-01', false, true),
('KES', '404', 'Kenyan Shilling', 'KSh', '1998-07-07', false, true),
('KGS', '417', 'Kyrgyzstani Som', 'som', '1994-03-31', false, true),
('KHR', '116', 'Cambodian Riel', '៛', '1999-01-04', false, true),
('KMF', '174', 'Comorian Franc', 'Fr', '1999-01-04', false, true),
('KPW', '408', 'North Korean Won', '₩', '1999-01-04', false, true),
('KRW', '410', 'South Korean Won', '₩', '1981-01-02', false, true),
('KWD', '414', 'Kuwaiti Dinar', 'د.ك', '1994-03-01', false, true),
('KYD', '136', 'Cayman Islands Dollar', '$', '1999-01-04', false, true),
('KZT', '398', 'Kazakhstani Tenge', '₸', '1994-03-31', false, true),
('LAK', '418', 'Lao Kip', '₭', '1999-01-04', false, true),
('LBP', '422', 'Lebanese Pound', 'ل.ل', '1998-07-07', false, true),
('LKR', '144', 'Sri Lankan Rupee', '₨', '1999-01-04', false, true),
('LRD', '430', 'Liberian Dollar', '$', '1999-01-04', false, true),
('LSL', '426', 'Lesotho Loti', 'L', '1999-01-04', false, true),
('LYD', '434', 'Libyan Dinar', 'ل.د', '1999-01-04', false, true),
('MAD', '504', 'Moroccan Dirham', 'د.م.', '1998-01-02', false, true),
('MDL', '498', 'Moldovan Leu', 'L', '1994-03-31', false, true),
('MGA', '969', 'Malagasy Ariary', 'Ar', '2005-01-03', false, true),
('MKD', '807', 'Macedonian Denar', 'ден', '1999-01-04', false, true),
('MMK', '104', 'Myanmar Kyat', 'K', '1999-01-04', false, true),
('MNT', '496', 'Mongolian Tögrög', '₮', '1998-07-07', false, true),
('MOP', '446', 'Macanese Pataca', 'P', '1983-01-01', false, true),
('MRO', '478', 'Mauritanian Ouguiya', 'UM', '1999-01-04', false, true),
('MRU', '929', 'Mauritanian Ouguiya', 'UM', '2018-01-02', false, true),
('MUR', '480', 'Mauritian Rupee', '₨', '1999-01-04', false, true),
('MVR', '462', 'Maldivian Rufiyaa', 'MVR', '1999-01-04', false, true),
('MWK', '454', 'Malawian Kwacha', 'MK', '1999-01-04', false, true),
('MXN', '484', 'Mexican Peso', '$', '1991-11-12', false, true),
('MYR', '458', 'Malaysian Ringgit', 'RM', '1988-01-08', false, true),
('MZN', '943', 'Mozambican Metical', 'MTn', '1998-07-07', false, true),
('NAD', '516', 'Namibian Dollar', '$', '1999-02-01', false, true),
('NGN', '566', 'Nigerian Naira', '₦', '1999-01-04', false, true),
('NIO', '558', 'Nicaraguan Córdoba', 'C$', '1999-01-04', false, true),
('NOK', '578', 'Norwegian Krone', 'kr', '1949-12-21', false, true),
('NPR', '524', 'Nepalese Rupee', 'Rs.', '1999-01-04', false, true),
('NZD', '554', 'New Zealand Dollar', '$', '1990-05-02', false, true),
('OMR', '512', 'Omani Rial', 'ر.ع.', '1986-01-01', false, true),
('PAB', '590', 'Panamanian Balboa', 'B/.', '1998-07-07', false, true),
('PEN', '604', 'Peruvian Sol', 'S/', '1998-07-07', false, true),
('PGK', '598', 'Papua New Guinean Kina', 'K', '1999-01-04', false, true),
('PHP', '608', 'Philippine Peso', '₱', '1998-07-07', false, true),
('PKR', '586', 'Pakistani Rupee', '₨', '1998-07-07', false, true),
('PLN', '985', 'Polish Złoty', 'zł', '1994-03-31', false, true),
('PYG', '600', 'Paraguayan Guaraní', '₲', '1999-01-04', false, true),
('QAR', '634', 'Qatari Riyal', 'ر.ق', '1998-07-07', false, true),
('RON', '946', 'Romanian Leu', 'Lei', '1996-05-07', false, true),
('RSD', '941', 'Serbian Dinar', 'RSD', '2000-01-03', false, true),
('RUB', '643', 'Russian Ruble', '₽', '1993-01-04', false, true),
('RWF', '646', 'Rwandan Franc', 'FRw', '1999-01-04', false, true),
('SAR', '682', 'Saudi Riyal', 'ر.س', '1986-06-01', false, true),
('SBD', '090', 'Solomon Islands Dollar', '$', '1999-01-04', false, true),
('SCR', '690', 'Seychellois Rupee', '₨', '1999-01-04', false, true),
('SDG', '938', 'Sudanese Pound', '£', '2007-04-02', false, true),
('SEK', '752', 'Swedish Krona', 'kr', '1949-12-21', false, true),
('SGD', '702', 'Singapore Dollar', '$', '1981-01-02', false, true),
('SHP', '654', 'Saint Helenian Pound', '£', '1976-02-02', false, true),
('SLE', '925', 'New Leone', 'Le', '2022-07-01', false, true),
('SOS', '706', 'Somali Shilling', 'Sh', '1999-01-04', false, true),
('SRD', '968', 'Surinamese Dollar', '$', '2004-03-01', false, true),
('SSP', '728', 'South Sudanese Pound', '£', '2013-01-21', false, true),
('STN', '930', 'São Tomé and Príncipe Second Dobra', 'Db', '2018-01-02', false, true),
('SVC', '222', 'Salvadoran Colón', '₡', '1999-01-04', false, true),
('SYP', '760', 'Syrian Pound', '£S', '1998-07-07', false, true),
('SZL', '748', 'Swazi Lilangeni', 'E', '1999-01-04', false, true),
('THB', '764', 'Thai Baht', '฿', '1990-12-31', false, true),
('TJS', '972', 'Tajikistani Somoni', 'ЅМ', '1999-01-04', false, true),
('TMT', '934', 'Turkmenistani Manat', 'm', '1995-01-19', false, true),
('TND', '788', 'Tunisian Dinar', 'د.ت', '1998-07-07', false, true),
('TOP', '776', 'Tongan Paʻanga', 'T$', '1999-01-04', false, true),
('TRY', '949', 'Turkish Lira', '₺', '1996-04-16', false, true),
('TTD', '780', 'Trinidad and Tobago Dollar', '$', '1999-01-04', false, true),
('TWD', '901', 'New Taiwan Dollar', '$', '1981-01-02', false, true),
('TZS', '834', 'Tanzanian Shilling', 'Sh', '1998-07-07', false, true),
('UAH', '980', 'Ukrainian Hryvnia', '₴', '1996-09-02', false, true),
('UGX', '800', 'Ugandan Shilling', 'USh', '1999-01-04', false, true),
('USD', '840', 'United States Dollar', '$', '1948-06-21', false, true),
('UYU', '858', 'Uruguayan Peso', '$U', '1998-07-07', false, true),
('UZS', '860', 'Uzbekistan Som', 'so''m', '1994-07-01', false, true),
('VES', '928', 'Venezuelan Bolívar Soberano', 'Bs', '2018-05-29', false, true),
('VND', '704', 'Vietnamese Đồng', '₫', '1998-07-07', false, true),
('VUV', '548', 'Vanuatu Vatu', 'Vt', '1999-01-04', false, true),
('WST', '882', 'Samoan Tala', 'T', '1999-01-04', false, true),
('XAF', '950', 'Central African CFA Franc', 'CFA', '1998-07-07', false, true),
('XAG', '961', 'Silver (Troy Ounce)', 'oz t', '1999-01-05', false, true),
('XAU', '959', 'Gold (Troy Ounce)', 'oz t', '1999-01-05', false, true),
('XCD', '951', 'East Caribbean Dollar', '$', '1999-01-04', false, true),
('XCG', '532', 'Caribbean Guilder', 'Cg', '2025-03-31', false, true),
('XDR', '960', 'Special Drawing Rights', 'SDR', '1981-01-01', false, true),
('XOF', '952', 'West African CFA Franc', 'Fr', '1998-07-07', false, true),
('XPD', '964', 'Palladium', 'oz t', '2000-04-21', false, true),
('XPF', '953', 'CFP Franc', 'Fr', '1999-01-04', false, true),
('XPT', '962', 'Platinum', 'oz t', '1999-01-05', false, true),
('YER', '886', 'Yemeni Rial', '﷼', '1998-07-07', false, true),
('ZAR', '710', 'South African Rand', 'R', '1987-01-02', false, true),
('ZMW', '967', 'Zambian Kwacha', 'K', '2000-01-04', false, true),
('ZWG', '924', 'Zimbabwe Gold', 'ZiG', '2024-09-02', false, true);

-- LANGUAGES
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
CREATE TRIGGER set_updated_at_languages BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION refresh_updated_at_column();
CREATE POLICY "Allow read-only access to all users" ON public.languages FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.languages (locale, iso_code, name, native_name, icon, is_default, is_enabled) VALUES 
('en-US', 'en', 'English', 'English', 'usa', true, true),
('es-ES', 'es', 'Spanish', 'Español', 'spain', false, false),
('de-DE', 'de', 'German', 'Deutsch', 'germany', false, false),
('it-IT', 'it', 'Italian', 'Italiano', 'italy', false, true);

-- AUTH PROVIDERS
CREATE TABLE auth_providers(
	id TEXT PRIMARY KEY,
	is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE auth_providers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at_auth_providers BEFORE UPDATE ON auth_providers FOR EACH ROW EXECUTE FUNCTION refresh_updated_at_column();
CREATE POLICY "Allow read-only access to all users" ON public.auth_providers FOR SELECT TO anon, authenticated USING (true);

INSERT INTO auth_providers (id, is_enabled) VALUES 
('email', true),
('google', true),
('github', true);

-- PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_id UNIQUE (user_id),
    CONSTRAINT unique_username UNIQUE (username)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION refresh_updated_at_column();

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- USER AUTH PROVIDERS
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
CREATE INDEX idx_user_auth_providers_user_id ON public.user_auth_providers(user_id);
CREATE TRIGGER set_updated_at_user_auth_providers BEFORE UPDATE ON public.user_auth_providers FOR EACH ROW EXECUTE FUNCTION refresh_updated_at_column();
CREATE POLICY "Users can manage their own linked authentication providers" ON public.user_auth_providers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ENUMS
CREATE TYPE public.app_theme_type AS ENUM ('light', 'dark', 'system');
CREATE TYPE public.app_date_format_type AS ENUM ('DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY');
CREATE TYPE public.dashboard_range_type AS ENUM ('current_month', 'last_30_days', 'current_week', 'current_year');

-- USER PREFERENCES
CREATE TABLE public.user_preferences (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    language_locale VARCHAR(5) NOT NULL REFERENCES public.languages(locale) DEFAULT 'it-IT',
    primary_currency_code CHAR(3) REFERENCES public.currencies(iso_code),
    date_format public.app_date_format_type NOT NULL DEFAULT 'DD/MM/YYYY',
    theme public.app_theme_type NOT NULL DEFAULT 'system',
    default_dashboard_range public.dashboard_range_type NOT NULL DEFAULT 'last_30_days',
    biometric_lock_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    lock_timeout_seconds INT NOT NULL DEFAULT 10,
    notify_budget_breach BOOLEAN NOT NULL DEFAULT TRUE,
    notify_recurring_reminder BOOLEAN NOT NULL DEFAULT TRUE,
    budget_alert_threshold INT NOT NULL DEFAULT 80,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_audit_user_preferences BEFORE INSERT OR UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.refresh_audit_columns();
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences FOR ALL TO authenticated USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- IMMUTABLE CURRENCY TRIGGER
CREATE OR REPLACE FUNCTION public.enforce_immutable_currency()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.primary_currency_code IS NOT NULL AND NEW.primary_currency_code IS DISTINCT FROM OLD.primary_currency_code THEN
        RAISE EXCEPTION 'Primary currency is immutable once configured during onboarding.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER lock_primary_currency BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.enforce_immutable_currency();

-- PUSH SUBSCRIPTIONS
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
CREATE POLICY "Users can manage their own device push tokens" ON public.user_push_subscriptions FOR ALL TO authenticated USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- AUTH TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INT := 1;
    generated_profile_id UUID;
    current_provider TEXT;
    system_default_locale VARCHAR(5);
BEGIN
    current_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    base_username := split_part(NEW.email, '@', 1);
    final_username := base_username;

    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || counter::text;
        counter := counter + 1;
    END LOOP;

    INSERT INTO public.profiles (id, user_id, email, username, display_name, avatar_url)
    VALUES (
        gen_random_uuid(), NEW.id, NEW.email, final_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', final_username),
        NEW.raw_user_meta_data->>'avatar_url'
    ) RETURNING id INTO generated_profile_id;

    SELECT locale INTO system_default_locale FROM public.languages WHERE is_default = true LIMIT 1;
    IF system_default_locale IS NULL THEN system_default_locale := 'en-US'; END IF;

    INSERT INTO public.user_preferences (profile_id, language_locale, onboarding_completed, created_by, updated_by)
    VALUES (generated_profile_id, system_default_locale, false, NEW.id, NEW.id);

    INSERT INTO public.user_auth_providers (user_id, provider_id, is_active)
    VALUES (NEW.id, current_provider, true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ATTACH TRIGGER TO SUPABASE AUTH
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
