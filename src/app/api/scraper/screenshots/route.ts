import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { getAdminUserId } from '@/auth'
import { listDirCached } from '@/lib/file-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const dir = path.join(process.cwd(), 'import', 'screenshots')
  try {
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!fs.existsSync(dir)) return NextResponse.json({ images: [] })
    const images = listDirCached(dir, { ext: '.png', limit: 50, ttlMs: 1500 })
    return NextResponse.json({ images })
  } catch { return NextResponse.json({ images: [] }) }
}
