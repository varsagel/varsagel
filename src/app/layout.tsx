import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";
import RSCHandler from "@/components/RSCHandler";
import CookieConsent from "@/components/layout/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.varsagel.com");

export const metadata: Metadata = {
  title: {
    default: "Varsagel | Türkiye’nin İlk Alım Platformu",
    template: "%s | Varsagel - Türkiye’nin İlk Alım Platformu",
  },
  description:
    "Türkiye’nin ilk alım platformu! Bütçene göre alım ilanını oluştur, satıcılar sana teklif versin.",
  keywords: [
    "varsagel",
    "alıcı talebi",
    "teklif ver",
    "teklif al",
    "ikinci el",
    "sıfır ürün",
    "hizmet",
    "otomobil arıyorum",
    "emlak arıyorum",
    "bilgisayar arıyorum",
    "tersine açık artırma",
    "pazar yeri",
    "alım ilanı",
    "talep oluştur"
  ],
  authors: [{ name: "Varsagel Ekibi", url: process.env.NEXT_PUBLIC_SITE_URL || "https://varsagel.com" }],
  creator: "Varsagel",
  publisher: "Varsagel",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    title: "Varsagel - Türkiye’nin İlk Alım Platformu",
    description:
      "Türkiye’nin ilk alım platformu! Bütçene göre alım ilanını oluştur, satıcılar sana teklif versin.",
    url: baseUrl,
    siteName: "Varsagel",
    locale: "tr_TR",
    images: [`${baseUrl}/opengraph-image`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Varsagel - Türkiye’nin İlk Alım Platformu",
    description:
      "Türkiye’nin ilk alım platformu! Bütçene göre alım ilanını oluştur, satıcılar sana teklif versin.",
    creator: "@varsagel",
    images: [`${baseUrl}/twitter-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Varsagel",
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
    sameAs: [
      "https://x.com/varsagelcom",
      "https://www.instagram.com/varsagel.com.offical",
    ],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Varsagel",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const content = (
    <Providers>
      <RSCHandler />
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
      <Toaster />
      <CookieConsent />
    </Providers>
  );

  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={`${geistSans.className} antialiased min-h-dvh flex flex-col bg-gray-50`}>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, webSiteJsonLd]),
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const k = 'varsagel_chunk_reload'; const should = (v) => { const msg = typeof v === 'string' ? v : String((v && (v.message || v.reason)) || ''); const name = typeof v === 'object' && v && v.name ? String(v.name) : ''; return name.includes('ChunkLoadError') || msg.includes('ChunkLoadError') || msg.includes('Loading chunk') || msg.includes('CSS_CHUNK_LOAD_FAILED'); }; const reloadOnce = () => { try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, String(Date.now())); const u = new URL(location.href); u.searchParams.set('_r', Date.now().toString(36)); location.replace(u.toString()); } catch { try { location.reload(); } catch {} } }; window.addEventListener('error', (e) => { if (should(e.error || e.message)) reloadOnce(); }, true); window.addEventListener('unhandledrejection', (e) => { if (should(e.reason)) reloadOnce(); }, true); } catch {} })();`,
          }}
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const send = () => { try { const p = location.pathname + (location.search || ''); const body = JSON.stringify({ pathname: p }); const url = '/api/analytics/visit'; if (navigator && typeof navigator.sendBeacon === 'function') { navigator.sendBeacon(url, new Blob([body], { type: 'application/json' })); return; } fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {}); } catch {} }; const w = window; if (typeof w.requestIdleCallback === 'function') { w.requestIdleCallback(send, { timeout: 3000 }); } else { setTimeout(send, 2500); } } catch {} })();`,
          }}
        />
        {content}
      </body>
    </html>
  );
}
