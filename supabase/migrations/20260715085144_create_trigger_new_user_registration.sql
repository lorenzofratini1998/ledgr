CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INT := 1;
    current_provider TEXT;
    system_default_locale VARCHAR(5);
    user_tz TEXT;
BEGIN
    current_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
    base_username := split_part(NEW.email, '@', 1);
    final_username := base_username;

    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        final_username := base_username || counter::text;
        counter := counter + 1;
    END LOOP;

    INSERT INTO public.profiles (id, email, username, display_name, avatar_url)
    VALUES (
        NEW.id, NEW.email, final_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', final_username),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    SELECT locale INTO system_default_locale FROM public.languages WHERE is_default = true LIMIT 1;
    IF system_default_locale IS NULL THEN system_default_locale := 'en-US'; END IF;

    user_tz := COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC');

    INSERT INTO public.user_preferences (profile_id, language_locale, timezone)
    VALUES (NEW.id, system_default_locale, user_tz);

    INSERT INTO public.user_auth_providers (user_id, provider_id, is_active)
    VALUES (NEW.id, current_provider, true);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
