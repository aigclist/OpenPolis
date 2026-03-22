import type { Metadata } from "next";
import localFont from "next/font/local";
import { getLocale } from "next-intl/server";

import { defaultLocale } from "@openpolis/i18n/config";
import { AppProviders } from "@/components/providers/app-providers";
import { getSiteUrl } from "@/lib/config/site";

import "./globals.css";

const manrope = localFont({
  src: "./fonts/manrope-latin.woff2",
  display: "swap",
  variable: "--font-manrope",
  weight: "200 800",
});

const plexMono = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-mono-400-latin.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "./fonts/ibm-plex-mono-500-latin.woff2",
      style: "normal",
      weight: "500",
    },
  ],
  display: "swap",
  variable: "--font-plex-mono",
});

const plexSansCondensed = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-sans-condensed-400-latin.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "./fonts/ibm-plex-sans-condensed-500-latin.woff2",
      style: "normal",
      weight: "500",
    },
    {
      path: "./fonts/ibm-plex-sans-condensed-600-latin.woff2",
      style: "normal",
      weight: "600",
    },
    {
      path: "./fonts/ibm-plex-sans-condensed-700-latin.woff2",
      style: "normal",
      weight: "700",
    },
  ],
  display: "swap",
  variable: "--font-plex-sans-condensed",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale().catch(() => defaultLocale);

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${plexMono.variable} ${plexSansCondensed.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
