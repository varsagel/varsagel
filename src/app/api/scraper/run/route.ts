import { NextResponse } from 'next/server'
import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { getAdminUserId } from '@/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function run(cmd: string, args: string[], env: Record<string,string> = {}, pidFile?: string) {
  return await new Promise<number>((resolve) => {
    const child = spawn(cmd, args, { cwd: process.cwd(), env: { ...process.env, ...env } })
    try { if (pidFile) fs.writeFileSync(pidFile, String(child.pid)) } catch {}
    child.on('close', (code) => {
      try { if (pidFile && fs.existsSync(pidFile)) fs.unlinkSync(pidFile) } catch {}
      resolve(code ?? 0)
    })
  })
}

export async function POST(req: Request) {
  try {
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const logPath = path.join(process.cwd(), 'import', 'scraper.log')
    try { fs.writeFileSync(logPath, '') } catch {}
    try { fs.appendFileSync(logPath, `[API ${new Date().toISOString()}] Run requested\n`) } catch {}
    let seed = ''
    let useHeadful = false
    try {
      const body = await req.json()
      if (Array.isArray(body?.brands) && body.brands.length) seed = String(body.brands.join(','))
      else if (typeof body?.brand === 'string' && body.brand.trim()) seed = body.brand.trim()
      useHeadful = !!body?.headful
    } catch {}

    const envScrape: Record<string,string> = seed ? { ARABAM_SEED_BRANDS: seed } : {}
    const script = useHeadful ? 'scrape-arabam-browser-headful.mjs' : 'scrape-arabam-http.mjs'
    const code1 = await run('node', [path.join('scripts', script)], envScrape, path.join(process.cwd(),'import','scrape.pid'))
    try { fs.appendFileSync(logPath, `[API ${new Date().toISOString()}] Scrape exit code: ${code1}\n`) } catch {}
    const code2 = await run('node', [path.join('scripts','import-arabam.mjs')], { ARABAM_INPUT: path.join('import','arabam-scraped.csv') }, path.join(process.cwd(),'import','import.pid'))
    try { fs.appendFileSync(logPath, `[API ${new Date().toISOString()}] Import exit code: ${code2}\n`) } catch {}
    const code3 = await run('node', [path.join('scripts','export-xlsx.mjs')], {}, path.join(process.cwd(),'import','export.pid'))
    try { fs.appendFileSync(logPath, `[API ${new Date().toISOString()}] Export exit code: ${code3}\n`) } catch {}
    if (code1 !== 0 || code2 !== 0) return NextResponse.json({ ok: false }, { status: 500 })
    if (code3 !== 0) return NextResponse.json({ ok: false }, { status: 500 })
    return NextResponse.json({ ok: true, seed })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
