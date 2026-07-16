import { createStaticClient } from '@/lib/supabase/static';
import { unstable_cache } from 'next/cache';

export async function getActiveCurrencies() {
  const fetchCurrencies = unstable_cache(
    async () => {
      const supabase = createStaticClient();

      const { data: currencies, error } = await supabase
        .from('currencies')
        .select('iso_code, name, symbol')
        .eq('is_enabled', true)
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch currencies: ${error.message}`);
      }

      return currencies || [];
    },
    ['active-currencies'],
    { tags: ['active-currencies'] }
  );

  return fetchCurrencies();
}
