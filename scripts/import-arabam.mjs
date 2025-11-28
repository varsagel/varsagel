import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = process.env.ARABAM_BASE_URL || 'https://www.arabam.com/ikinci-el/otomobil'
const OUT_PATH = process.env.ARABAM_OUT || path.resolve(__dirname, '../src/data/generated-automobil.json')
const LOCAL_INPUT = process.env.ARABAM_INPUT || path.resolve(__dirname, '../import/arabam-scraped.csv')
const LOG_PATH = path.resolve(__dirname, '../import/scraper.log')

async function safeFetch(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    return text
  } catch (e) {
    return null
  }
}

function tryExtractBrands(html) {
  if (!html) return []
  const candidates = []
  const markaBlockMatch = html.match(/Marka[\s\S]*?<ul[\s\S]*?>([\s\S]*?)<\/ul>/i)
  if (markaBlockMatch) {
    const ul = markaBlockMatch[1]
    const re = /<a[^>]*?>([^<]+)<\/a>/g
    let m
    while ((m = re.exec(ul))) {
      const name = m[1].trim()
      if (name && !candidates.includes(name)) candidates.push(name)
    }
  }
  // fallback: meta tags or structured data
  const jsonMatches = html.match(/\{\s*"brands"\s*:\s*\[[\s\S]*?\]/i)
  if (jsonMatches) {
    try {
      const jsonStr = jsonMatches[0].replace(/^[^{]*/, '')
      const obj = JSON.parse(jsonStr + '}')
      if (Array.isArray(obj.brands)) {
        obj.brands.forEach((b) => { if (b && !candidates.includes(b)) candidates.push(String(b)) })
      }
    } catch {}
  }
  return candidates
}

function parseCsvLine(line) {
  const res = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuote = !inQuote
      }
    } else if (c === ',' && !inQuote) {
      res.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  res.push(cur)
  return res
}

function loadLocalInput(fp) {
  try {
    if (fs.existsSync(fp)) {
      const raw = fs.readFileSync(fp, 'utf-8')
      const ext = path.extname(fp).toLowerCase()
      if (ext === '.json') {
        const data = JSON.parse(raw)
        return data
      }
      if (ext === '.csv') {
        const lines = raw.split(/\r?\n/).filter(Boolean)
        while (lines[0] && lines[0].trim().startsWith('#')) lines.shift()
        const header = lines.shift()
        const cols = (header || '').split(',').map(s=> s.trim().toLowerCase())
        const colIdx = {
          brand: cols.indexOf('brand'),
          model: cols.indexOf('model'),
          series: cols.indexOf('series'),
          trim: cols.indexOf('trim'),
        }
        const ms = {}
        const st = {}
        for (const line of lines) {
          if (line.startsWith('#')) continue
          const parts = parseCsvLine(line).map(s=> s.trim())
          const brand = parts[colIdx.brand] || ''
          const model = parts[colIdx.model] || ''
          const series = parts[colIdx.series] || ''
          const trim = parts[colIdx.trim] || ''
          const lowBrand = brand.toLowerCase()
          const lowModel = model.toLowerCase()
          const lowSeries = series.toLowerCase()
          const lowTrim = trim.toLowerCase()

          // If model/series/trim is empty or just whitespace, skip it or handle accordingly
          if (!brand || !model) continue
          // Basic filtering
          if (lowBrand.startsWith('ikinci el') || lowBrand.startsWith('sahibinden')) continue
          if (lowModel.startsWith('ikinci el') || lowModel.startsWith('sahibinden')) continue

          const noise = ['sahibinden','galeriden','motor','model','yil','km','fiyat','tumu','giris yap']
          // Allow years in series/trim if they are part of the name, but maybe filter if it's JUST a year?
          // The previous logic was excluding anything looking like a year. Let's relax it slightly.
          const isYear = (s) => /^(19|20)\d{2}$/.test(s.trim()) 
          // If series is just a year, maybe it's noise, or maybe valid? Let's trust the scraper data more.
          const isNoise = (s)=> !s || noise.some(n=> s.includes(n)) 
          
          ms[brand] = ms[brand] || {}
          ms[brand][model] = ms[brand][model] || []
          // Add series even if it's empty to ensure brand/model exists
          if (series && !isNoise(lowSeries)) {
            if (!ms[brand][model].includes(series)) ms[brand][model].push(series)
          }
          if (series && trim && !isNoise(lowSeries) && !isNoise(lowTrim)) {
            st[brand] = st[brand] || {}
            st[brand][model] = st[brand][model] || {}
            st[brand][model][series] = st[brand][model][series] || []
            if (!st[brand][model][series].includes(trim)) st[brand][model][series].push(trim)
          }
        }
        // After loop, ensure we return the populated object, not a merged empty one if we want fresh data
        return { modelSeries: { 'vasita/otomobil': ms }, seriesTrims: { 'vasita/otomobil': st } }
      }
    }
  } catch {}
  return null
}

function mergeGenerated(prev, next) {
  // Return next data directly to ensure we only use what we just scraped
  // This completely replaces the old behavior of merging
  if (next && next.modelSeries && next.modelSeries['vasita/otomobil']) {
    return next
  }
  return { modelSeries: { 'vasita/otomobil': {} }, seriesTrims: { 'vasita/otomobil': {} } }
}

async function main() {
  const existing = fs.existsSync(OUT_PATH) ? JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8')) : null
  let nextData = null

  // Prefer local input if provided/existing
  console.log(`Loading local input from: ${LOCAL_INPUT}`)
  const local = loadLocalInput(LOCAL_INPUT)
  const localUsed = !!local
  console.log(`Local input loaded: ${localUsed}`)
  if (localUsed) {
    nextData = local
    const brandCount = Object.keys(nextData.modelSeries['vasita/otomobil']).length
    console.log(`Loaded ${brandCount} brands from local input`)
    console.log('Sample brands:', Object.keys(nextData.modelSeries['vasita/otomobil']).slice(0, 5))
  } else {
    const html = await safeFetch(BASE_URL)
    const brands = tryExtractBrands(html)
    if (brands && brands.length) {
      const ms = {}
      brands.forEach((b) => { if (!ms[b]) ms[b] = [] })
      nextData = { modelSeries: { 'vasita/otomobil': ms }, seriesTrims: { 'vasita/otomobil': {} } }
    }
  }

  if (!nextData) {
    console.error('No data fetched. Provide ARABAM_INPUT=../import/arabam.json or set ARABAM_BASE_URL to a parseable page.')
    try { fs.appendFileSync(LOG_PATH, `[IMPORT ${new Date().toISOString()}] No data fetched\n`) } catch {}
    process.exit(2)
  }

  const merged = localUsed ? nextData : mergeGenerated(existing, nextData)
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true })
  fs.writeFileSync(OUT_PATH, JSON.stringify(merged, null, 2))
  console.log(`Written ${OUT_PATH}`)
  try { fs.appendFileSync(LOG_PATH, `[IMPORT ${new Date().toISOString()}] Generated written: ${OUT_PATH}\n`) } catch {}
}

main().catch((e) => { console.error(e); process.exit(1) })