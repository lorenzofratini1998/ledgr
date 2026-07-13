CREATE OR REPLACE FUNCTION public.ensure_single_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent infinite recursion from nested updates
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- Scenario 1: The new/updated wallet is being explicitly set as default
    IF NEW.is_default = TRUE THEN
        -- Unset all other wallets for this user
        UPDATE public.wallets 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = TRUE;
    END IF;

    -- Scenario 2: The wallet is being inserted and the user has no other active wallets
    IF TG_OP = 'INSERT' AND NEW.is_default = FALSE THEN
        IF NOT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = NEW.user_id AND is_active = TRUE) THEN
            NEW.is_default := TRUE;
        END IF;
    END IF;

    -- Scenario 3: The default wallet is being archived or explicitly unset from being default
    -- We need to ensure AT LEAST ONE active wallet is default (if any exist)
    IF TG_OP = 'UPDATE' AND OLD.is_default = TRUE AND (NEW.is_default = FALSE OR NEW.is_active = FALSE) THEN
        -- Promote the oldest remaining active wallet to be the new default
        UPDATE public.wallets
        SET is_default = TRUE
        WHERE id = (
            SELECT id FROM public.wallets 
            WHERE user_id = NEW.user_id 
            AND id != NEW.id 
            AND is_active = TRUE 
            ORDER BY created_at ASC 
            LIMIT 1
        );
        
        -- Make sure the current row loses the default status
        NEW.is_default := FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_wallet_default_change
    BEFORE INSERT OR UPDATE ON public.wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_default_wallet();
