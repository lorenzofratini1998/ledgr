type Language = { locale: string; is_default: boolean; native_name: string };

export async function getActiveLanguages() {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/languages?select=locale,is_default,native_name&is_enabled=eq.true`;

    const res = await fetch(url, {
      cache: 'force-cache',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch languages: ${res.statusText}`);
    }

    const languages = await res.json() as Language[];

    return {
      activeLocales: languages.map(l => ({ locale: l.locale, native_name: l.native_name || l.locale })),
      defaultLocale: languages.find(l => l.is_default)?.locale || 'en-US',
    };
  } catch (error) {
    console.error("Error fetching languages:", error);
    return {
      activeLocales: [{ locale: 'en-US', native_name: 'English' }],
      defaultLocale: 'en-US',
    };
  }
}
