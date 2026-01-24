import { NextResponse } from "next/server";
import { getDistricts } from "@/lib/turkey-neighborhoods";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city") || "";
  if (!city) return NextResponse.json([]);
  const out = getDistricts(city);
  return NextResponse.json(out);
}

