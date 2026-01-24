import { prisma } from "@/lib/prisma";

type CacheEntry = { value: string | null; expiresAt: number };

const g = globalThis as unknown as {
  __varsagel_setting_cache?: Map<string, CacheEntry>;
};

const cache = g.__varsagel_setting_cache || new Map<string, CacheEntry>();
g.__varsagel_setting_cache = cache;

export async function getSystemSetting(key: string): Promise<string | null> {
  const k = String(key || "").trim();
  if (!k) return null;

  const now = Date.now();
  const hit = cache.get(k);
  if (hit && hit.expiresAt > now) return hit.value;

  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: k } });
    const value = row?.value ?? null;
    cache.set(k, { value, expiresAt: now + 5_000 });
    return value;
  } catch {
    cache.set(k, { value: null, expiresAt: now + 2_000 });
    return null;
  }
}
