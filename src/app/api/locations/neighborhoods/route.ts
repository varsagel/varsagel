import { NextResponse } from "next/server";
import { getNeighborhoods } from "@/lib/turkey-neighborhoods";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city") || "";
  const district = url.searchParams.get("district") || "";
  if (!city || !district) return NextResponse.json([]);
  const out = getNeighborhoods(city, district);
  return NextResponse.json(out);
}

