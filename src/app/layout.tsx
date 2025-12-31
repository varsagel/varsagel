import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Providers";
import RSCHandler from "@/components/RSCHandler";

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
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.varsagel.com";

export const metadata: Metadata = {
  title: {
    default: "Varsagel | Türkiye'nin İlk Alım Platformu",
    template: "%s | Varsagel - Türkiye'nin İlk Alım Platformu",
  },
  description:
    "Türkiye'nin ilk alım platformu! Bütçene göre alım talebini oluştur, satıcılar sana teklif versin.",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.varsagel.com"),
  openGraph: {
    type: "website",
    title: "Varsagel - Türkiye'nin İlk Alım Platformu",
    description:
      "Türkiye'nin ilk alım platformu! Bütçene göre alım talebini oluştur, satıcılar sana teklif versin.",
    url: "/",
    siteName: "Varsagel",
    locale: "tr_TR",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Varsagel - Türkiye'nin İlk Alım Platformu",
    description:
      "Türkiye'nin ilk alım platformu! Bütçene göre alım talebini oluştur, satıcılar sana teklif versin.",
    creator: "@varsagel",
    images: ["/twitter-image"],
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
      <Header />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
      <Toaster />
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
        <div
          id="cookie-consent"
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-gray-200 shadow-2xl hidden"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-gray-900">Çerez Politikası</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Size daha iyi bir deneyim sunmak, site trafiğini analiz etmek ve içerikleri
                kişiselleştirmek için çerezleri kullanıyoruz. Daha fazla bilgi için{" "}
                <a
                  href="/kurumsal/gizlilik-politikasi"
                  className="text-cyan-600 hover:underline font-medium"
                >
                  Gizlilik Politikası
                </a>{" "}
                ve{" "}
                <a href="/kurumsal/kvkk" className="text-cyan-600 hover:underline font-medium">
                  KVKK Aydınlatma Metni
                </a>
                ni inceleyebilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                id="cookie-decline"
                type="button"
                className="flex-1 md:flex-none whitespace-nowrap inline-flex items-center justify-center border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium h-10 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Reddet
              </button>
              <button
                id="cookie-accept"
                type="button"
                className="flex-1 md:flex-none whitespace-nowrap inline-flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-700 font-medium h-10 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Kabul Et
              </button>
            </div>
          </div>
        </div>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const k = 'cookie-consent'; const el = document.getElementById('cookie-consent'); if (!el) return; const hide = () => { el.classList.add('hidden'); }; const show = () => { el.classList.remove('hidden'); }; const set = (v) => { try { localStorage.setItem(k, v); } catch {} hide(); }; const accept = document.getElementById('cookie-accept'); const decline = document.getElementById('cookie-decline'); if (accept) accept.addEventListener('click', () => set('accepted')); if (decline) decline.addEventListener('click', () => set('declined')); const existing = (() => { try { return localStorage.getItem(k); } catch { return null; } })(); if (!existing) { setTimeout(show, 1000); } } catch {} })();`,
          }}
        />
      </body>
    </html>
  );
}
