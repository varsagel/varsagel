import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function GET(_req: NextRequest, context: { params: { path?: string[] } }) {
  const segments = Array.isArray(context.params?.path) ? context.params.path : [];
  const safeSegments = segments.filter((s) => s && s !== "." && s !== "..");

  const brandsDir = path.join(process.cwd(), "public", "images", "brands");
  const fallbackPath = path.join(process.cwd(), "public", "images", "defaults", "otomobil.webp");

  const requestedPath = path.join(brandsDir, ...safeSegments);
  const normalizedRequested = path.normalize(requestedPath);
  const normalizedBrandsDir = path.normalize(brandsDir);

  let filePathToServe = fallbackPath;
  if (normalizedRequested.startsWith(normalizedBrandsDir)) {
    try {
      const stat = fs.statSync(normalizedRequested);
      if (stat.isFile()) {
        filePathToServe = normalizedRequested;
      }
    } catch {}
  }

  let body: ArrayBuffer;
  try {
    const buf = fs.readFileSync(filePathToServe);
    body = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return new Response("Not Found", { status: 404 });
  }

  const ext = path.extname(filePathToServe);
  const headers = new Headers();
  headers.set("Content-Type", contentTypeForExt(ext));
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(body, { status: 200, headers });
}
