import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const fp = path.join(process.cwd(), 'src', 'data', 'generated-automobil.json')
    const raw = fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : '{}'
    const json = JSON.parse(raw || '{}')
    const auto = json?.modelSeries?.['vasita/otomobil'] || {}
    const trims = json?.seriesTrims?.['vasita/otomobil'] || {}
    let brands = 0, models = 0, series = 0, trimCount = 0
    brands = Object.keys(auto).length
    for (const b of Object.keys(auto)) {
      const mod = auto[b] || {}
      models += Object.keys(mod).length
      for (const m of Object.keys(mod)) {
        series += (mod[m] || []).length
        const tB = trims[b] || {}
        const tM = tB[m] || {}
        for (const s of Object.keys(tM)) {
          trimCount += (tM[s] || []).length
        }
      }
    }
    const scrapePidFile = path.join(process.cwd(), 'import', 'scrape.pid')
    const importPidFile = path.join(process.cwd(), 'import', 'import.pid')
    const readPid = (p: string) => { try { return fs.existsSync(p) ? Number(fs.readFileSync(p, 'utf-8').trim()) : null } catch { return null } }
    const alive = (pid: number | null) => {
      if (!pid) return false
      try { process.kill(pid, 0); return true } catch { return false }
    }
    const scrapeRunning = alive(readPid(scrapePidFile))
    const importRunning = alive(readPid(importPidFile))
    return NextResponse.json({ brands, models, series, trims: trimCount, updatedAt: Date.now(), running: { scrape: scrapeRunning, import: importRunning } })
  } catch (e) {
    return NextResponse.json({ error: 'status_failed' }, { status: 500 })
  }
}