import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
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
    default: "Varsagel | Alıcı ilanı, satıcı teklifi",
    template: "%s | Varsagel",
  },
  description:
    "Varsagel: Alıcı ilanlarını yayınla, satıcı tekliflerini topla. Modern, hızlı ve özgün bir aracı platform.",
  keywords: [
    "ilan",
    "satıcı",
    "alıcı",
    "teklif",
    "emlak",
    "otomobil",
    "vasıta",
  ],
  metadataBase:
    typeof window === "undefined"
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
      : undefined,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Varsagel",
    description:
      "Alıcı ilanını ver, satıcılardan hızlıca teklif al. Kategori bazlı akıllı filtrelerle doğru eşleşme.",
    url: "/",
    siteName: "Varsagel",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Varsagel",
    description:
      "Alıcı ilanını ver, satıcılardan hızlıca teklif al. Kategori bazlı akıllı filtrelerle doğru eşleşme.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Header />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
