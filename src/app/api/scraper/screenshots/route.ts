import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { getAdminUserId } from '@/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const dir = path.join(process.cwd(), 'import', 'screenshots')
  try {
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!fs.existsSync(dir)) return NextResponse.json({ images: [] })
    const files = fs.readdirSync(dir).filter(f=> f.endsWith('.png')).map(f=> ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
    files.sort((a,b)=> b.mtime - a.mtime)
    return NextResponse.json({ images: files.slice(0, 50).map(f=> f.name) })
  } catch { return NextResponse.json({ images: [] }) }
}
