CREATE TABLE public.categories (
    category_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_name        TEXT NOT NULL,
    category_description TEXT,
    parent_id            UUID REFERENCES public.categories(category_id) ON DELETE CASCADE,
    color                TEXT,
    icon                 TEXT,
    is_active            BOOLEAN DEFAULT TRUE NOT NULL,
    created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT unique_user_category_name UNIQUE NULLS NOT DISTINCT (user_id, category_name, parent_id)
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
    ON public.categories FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

CREATE OR REPLACE FUNCTION public.enforce_category_hierarchy()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.category_id = NEW.parent_id THEN
        RAISE EXCEPTION 'A category cannot be its own parent.';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.categories
        WHERE category_id = NEW.parent_id AND parent_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Categories support a maximum of two levels (Category -> Subcategory).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER check_category_hierarchy
    BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.enforce_category_hierarchy();