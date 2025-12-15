import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  metadataBase:
    typeof window === "undefined"
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.varsagel.com")
      : undefined,
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  openGraph: {
    type: "website",
    title: "Varsagel - Türkiye'nin İlk Alım Platformu",
    description:
      "Türkiye'nin ilk alım platformu! Bütçene göre alım talebini oluştur, satıcılar sana teklif versin.",
    url: "/",
    siteName: "Varsagel",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varsagel - Türkiye'nin İlk Alım Platformu",
    description:
      "Türkiye'nin ilk alım platformu! Bütçene göre alım talebini oluştur, satıcılar sana teklif versin.",
    creator: "@varsagel",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-dvh flex flex-col bg-gray-50">
        <Providers>
          <Header />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
