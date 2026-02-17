import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/auth";

export async function GET() {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert array of key-value to object
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getAdminUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updates = Object.entries(body).map(([key, value]) => 
      prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
