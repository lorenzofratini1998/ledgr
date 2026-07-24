CREATE TABLE public.exchange_rates (
    date DATE NOT NULL,
    base_currency CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    quote_currency CHAR(3) NOT NULL REFERENCES public.currencies(iso_code) ON UPDATE CASCADE,
    rate NUMERIC(18, 6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (date, base_currency, quote_currency)
);

CREATE INDEX idx_exchange_rates_date_quote ON public.exchange_rates(quote_currency, date DESC);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read-only access to all users" 
    ON public.exchange_rates FOR SELECT TO anon, authenticated USING (true);
