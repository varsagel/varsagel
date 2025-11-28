import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORIES as STATIC_CATEGORIES } from "@/data/categories";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: "asc" },
    });
    const map = new Map<string, { name: string; slug: string; subcategories: { name: string; slug: string }[] }>();
    const put = (c: any) => {
      const slug = String(c.slug);
      const prev = map.get(slug);
      const subs = (c.subcategories || []).map((s: any) => ({ name: s.name, slug: s.slug }));
      if (!prev) {
        map.set(slug, { name: c.name, slug: c.slug, subcategories: subs });
      } else {
        const sm = new Map<string, any>();
        [...prev.subcategories, ...subs].forEach((s) => sm.set(String(s.slug), s));
        map.set(slug, { name: prev.name || c.name, slug, subcategories: Array.from(sm.values()) });
      }
    };
    STATIC_CATEGORIES.forEach(put);
    categories.forEach(put);
    return NextResponse.json(Array.from(map.values()));
  } catch (err) {
    return NextResponse.json({ error: "Kategoriler yüklenemedi" }, { status: 500 });
  }
}
