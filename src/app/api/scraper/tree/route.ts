import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function readGenerated() {
  const fp = path.join(process.cwd(), 'src', 'data', 'generated-automobil.json')
  if (!fs.existsSync(fp)) return { modelSeries: { 'vasita/otomobil': {} }, seriesTrims: { 'vasita/otomobil': {} } }
  try {
    const raw = fs.readFileSync(fp, 'utf-8')
    const json = JSON.parse(raw || '{}')
    return json || {}
  } catch {
    return { modelSeries: { 'vasita/otomobil': {} }, seriesTrims: { 'vasita/otomobil': {} } }
  }
}

function sortTr(a: string, b: string) {
  return a.localeCompare(b, 'tr')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const brand = url.searchParams.get('brand') || ''
  const data = readGenerated()
  const ms = (data?.modelSeries?.['vasita/otomobil'] || {}) as Record<string, Record<string, string[]>>
  const st = (data?.seriesTrims?.['vasita/otomobil'] || {}) as Record<string, Record<string, Record<string, string[]>>>
  if (!brand || !ms[brand]) return NextResponse.json({ brand, models: [] })
  const models = Object.keys(ms[brand] || {}).slice().sort(sortTr).map((m) => {
    const series = ((ms[brand]?.[m] || []) as string[]).slice().sort(sortTr).map((s) => {
      const trims = (((st[brand] || {})[m] || {})[s] || []).slice().sort(sortTr)
      return { name: s, trims }
    })
    return { name: m, series }
  })
  return NextResponse.json({ brand, models })
}