import { NextRequest, NextResponse } from "next/server";
import { getSubcategoryImage } from "@/data/subcategory-images";

export async function GET(req: NextRequest, context: { params: { path?: string[] } }) {
  const parts = Array.isArray(context.params?.path) ? context.params.path : [];
  const last = parts[parts.length - 1] || "";
  const base = last.replace(/\.webp$/i, "");
  const slug = parts.length > 1 ? `${parts.slice(0, -1).join("-")}-${base}` : base;
  const target = getSubcategoryImage(slug);
  return NextResponse.redirect(new URL(target, req.url), { status: 302 });
}
