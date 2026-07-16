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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';