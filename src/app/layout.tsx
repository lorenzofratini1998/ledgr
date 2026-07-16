import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { PWAManager } from "@/components/pwa-manager";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { getLocaleDictionary } from "@/i18n/get-dictionary";
import { DictionaryProvider } from "@/i18n/dictionary-provider";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icon-192x192.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, dictionary } = await getLocaleDictionary();

  return (
    <html lang={locale} suppressHydrationWarning className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col">
        <NextTopLoader showSpinner={false} color="#2563eb" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DictionaryProvider dictionary={dictionary}>
            <QueryProvider>
              {children}
              <PWAManager />
            </QueryProvider>
            <Toaster />
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
