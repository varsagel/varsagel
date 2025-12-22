import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { getAdminUserId } from '@/auth'

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
  const adminId = await getAdminUserId()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const brand = url.searchParams.get('brand') || ''
  
  // If no brand, return empty (or maybe all brands? but frontend calls brands api for that)
  if (!brand) return NextResponse.json({ brand, models: [] })

  const data = readGenerated()
  const allMs = data.modelSeries || {}
  const allSt = data.seriesTrims || {}
  
  // Find all categories containing this brand
  const matchingCats = Object.keys(allMs).filter(catKey => allMs[catKey]?.[brand])
  
  // Merge models from all categories
  // Structure: { "ModelName": { series: Set<SeriesName>, trims: ... } }
  // Actually we just need to build the response structure
  
  const modelsMap = new Map<string, Set<string>>() // Model -> Set of Series
  const seriesTrimsMap = new Map<string, Set<string>>() // Model:Series -> Set of Trims

  for (const catKey of matchingCats) {
    const ms = allMs[catKey][brand] || {}
    const st = allSt[catKey]?.[brand] || {}
    
    for (const model of Object.keys(ms)) {
      if (!modelsMap.has(model)) modelsMap.set(model, new Set())
      
      const seriesList = ms[model] || []
      for (const s of seriesList) {
        modelsMap.get(model)?.add(s)
        
        // Collect trims
        const trims = st[model]?.[s] || []
        const key = `${model}:${s}`
        if (!seriesTrimsMap.has(key)) seriesTrimsMap.set(key, new Set())
        trims.forEach((t: string) => seriesTrimsMap.get(key)?.add(t))
      }
    }
  }

  const models = Array.from(modelsMap.keys()).sort(sortTr).map((m) => {
    const seriesSet = modelsMap.get(m)
    const series = Array.from(seriesSet || []).sort(sortTr).map((s) => {
      const key = `${m}:${s}`
      const trims = Array.from(seriesTrimsMap.get(key) || []).sort(sortTr)
      return { name: s, trims }
    })
    return { name: m, series }
  })

  return NextResponse.json({ brand, models })
}
