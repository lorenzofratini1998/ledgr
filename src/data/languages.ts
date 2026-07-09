type Language = { iso_code: string; is_default: boolean };

export async function getActiveLanguages() {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/languages?select=iso_code,is_default&is_enabled=eq.true`;

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
      activeLocales: languages.map(l => l.iso_code) || ['en'],
      defaultLocale: languages.find(l => l.is_default)?.iso_code || 'en',
    };
  } catch (error) {
    console.error("Error fetching languages:", error);
    return {
      activeLocales: ['en'],
      defaultLocale: 'en',
    };
  }
}
