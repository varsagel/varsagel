import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function readPid(fp: string): number | null {
  try {
    if (!fs.existsSync(fp)) return null
    const s = fs.readFileSync(fp, 'utf-8').trim()
    const pid = Number(s)
    return Number.isFinite(pid) ? pid : null
  } catch { return null }
}

function killPid(pid: number): boolean {
  try {
    process.kill(pid)
    return true
  } catch { return false }
}

export async function POST() {
  const scrapePidFile = path.join(process.cwd(), 'import', 'scrape.pid')
  const importPidFile = path.join(process.cwd(), 'import', 'import.pid')
  const scrapePid = readPid(scrapePidFile)
  const importPid = readPid(importPidFile)
  const result: Record<string, boolean> = {}
  if (scrapePid) result.scrape = killPid(scrapePid)
  if (importPid) result.import = killPid(importPid)
  try {
    if (fs.existsSync(scrapePidFile)) fs.unlinkSync(scrapePidFile)
    if (fs.existsSync(importPidFile)) fs.unlinkSync(importPidFile)
  } catch {}
  return NextResponse.json({ ok: !!(result.scrape || result.import), ...result })
}