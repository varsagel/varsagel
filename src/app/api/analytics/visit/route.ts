import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  const { pathname } = await req.json().catch(() => ({ pathname: req.headers.get('x-pathname') || '/' }))
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
  const ua = req.headers.get('user-agent') || null
  if (!pathname) return NextResponse.json({ error: 'pathname gerekli' }, { status: 400 })
  await prisma.visit.create({ data: { path: pathname, userId: userId || null, ip: ip || undefined, userAgent: ua || undefined } })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const total = await prisma.visit.count()
  const last = await prisma.visit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json({ total, last })
}
