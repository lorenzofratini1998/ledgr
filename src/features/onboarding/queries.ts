import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export async function insertEcosystemData(
  categoriesToInsert: any[],
  walletToInsert: any | null
) {
  const supabase = await createClient();

  if (categoriesToInsert.length > 0) {
    const { error: catError } = await supabase.from('categories').insert(categoriesToInsert);
    if (catError) throw new Error(`Category insert failed: ${catError.message}`);
  }

  if (walletToInsert) {
    const { error: walletError } = await supabase.from('wallets').insert(walletToInsert);
    if (walletError) throw new Error(`Wallet insert failed: ${walletError.message}`);
  }
}
