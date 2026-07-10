import { createClient } from '@/lib/supabase/server';

export async function getActiveCurrencies() {
  const supabase = await createClient();

  const { data: currencies, error } = await supabase
    .from('currencies')
    .select('iso_code, name, symbol')
    .eq('is_enabled', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch currencies: ${error.message}`);
  }

  return currencies || [];
}
