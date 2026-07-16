import { createStaticClient } from '@/lib/supabase/static';
import { unstable_cache } from 'next/cache';

type Language = { locale: string; is_default: boolean; native_name: string };

export async function getActiveLanguages() {
  const fetchLanguages = unstable_cache(
    async () => {
      try {
        const supabase = createStaticClient();
        
        const { data: languages, error } = await supabase
          .from('languages')
          .select('locale, is_default, native_name')
          .eq('is_enabled', true);

        if (error) {
          throw new Error(`Failed to fetch languages: ${error.message}`);
        }

        const validLanguages = (languages || []) as Language[];

        return {
          activeLocales: validLanguages.map(l => ({ locale: l.locale, native_name: l.native_name || l.locale })),
          defaultLocale: validLanguages.find(l => l.is_default)?.locale || 'en-US',
        };
      } catch (error) {
        console.error("Error fetching languages:", error);
        return {
          activeLocales: [{ locale: 'en-US', native_name: 'English' }],
          defaultLocale: 'en-US',
        };
      }
    },
    ['active-languages'],
    { tags: ['active-languages'] }
  );

  return fetchLanguages();
}
