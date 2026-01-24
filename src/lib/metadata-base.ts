import "server-only";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.varsagel.com");

export const metadataBase = new URL(siteUrl);

