import { NextResponse } from "next/server";
import { getAdminUserId } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const workerId = typeof body?.workerId === "string" ? body.workerId.trim() : "";

  let job: any = null;
  try {
    job = await prisma.$transaction(async (tx) => {
      const pending = await tx.uploadScan.findFirst({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
      });
      if (!pending) return null;
      const res = await tx.uploadScan.updateMany({
        where: { id: pending.id, status: "PENDING" },
        data: { status: "IN_PROGRESS", lockedAt: new Date() },
      });
      if (!res.count) return null;
      return tx.uploadScan.findUnique({ where: { id: pending.id } });
    });
  } catch (err: any) {
    if (err?.code === "P2021") {
      return NextResponse.json({ ok: false, error: "UploadScan tablosu bulunamadı" }, { status: 500 });
    }
    throw err;
  }

  if (!job) return NextResponse.json({ ok: true, job: null });

  if (workerId) {
    await prisma.uploadScan.update({
      where: { id: job.id },
      data: { source: `worker:${workerId}` },
    });
  }

  return NextResponse.json({ ok: true, job });
}

export async function PATCH(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  const status = typeof body?.status === "string" ? body.status.trim().toUpperCase() : "";
  const error = typeof body?.error === "string" ? body.error.trim() : "";

  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  if (!["CLEAN", "INFECTED", "FAILED"].includes(status)) {
    return NextResponse.json({ error: "Geçersiz status" }, { status: 400 });
  }

  const data: any = { status };
  if (status === "FAILED") {
    data.error = error || "Scan failed";
  } else {
    data.scannedAt = new Date();
    data.error = null;
  }

  let updated: any;
  try {
    updated = await prisma.uploadScan.update({
      where: { id },
      data,
    });
  } catch (err: any) {
    if (err?.code === "P2021") {
      return NextResponse.json({ ok: false, error: "UploadScan tablosu bulunamadı" }, { status: 500 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true, job: updated });
}
