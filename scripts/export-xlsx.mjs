import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

const argValue = (name, fallback = null) => {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return fallback
  const v = process.argv[idx + 1]
  if (!v || v.startsWith('--')) return fallback
  return v
}

const CSV_PATH = path.resolve(process.cwd(), argValue('csv', 'import/arabam-scraped.csv'))
const OUT_XLSX = path.resolve(process.cwd(), argValue('out', 'import/arabam-scraped.xlsx'))

function trSlug(s) {
  const map = { 'ğ':'g','Ğ':'g','ü':'u','Ü':'u','ş':'s','Ş':'s','ı':'i','İ':'i','ö':'o','Ö':'o','ç':'c','Ç':'c' }
  return String(s || '').split('').map(ch=> map[ch] ?? ch).join('').toLowerCase().replace(/\s+/g,'-').replace(/\.+/g,'-').replace(/[^a-z0-9-]/g,'')
}

function buildUrl(brand, model, series, trim) {
  const base = 'https://www.arabam.com/ikinci-el/otomobil'
  if (!brand) return ''
  const b = trSlug(brand)
  if (!model) return `${base}/${b}`
  const m = trSlug(model)
  if (!series) return `${base}/${b}-${m}`
  const s = trSlug(series)
  if (!trim) return `${base}/${b}-${m}-${s}`
  const t = trSlug(trim)
  return `${base}/${b}-${m}-${s}-${t}`
}

function uniqKey(b,m,s,t){ return [b||'',m||'',s||'',t||''].map(x=> String(x).trim().toLowerCase()).join('|') }

function parseCsvLine(line) {
  const res = []
  let cur = ''
  let inQuote = false
  for (let i=0; i<line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuote && line[i+1] === '"') { // escaped quote
        cur += '"'; i++
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

function sheetName(value, used) {
  let name = String(value || '').trim()
  if (!name) name = 'Bilinmeyen'
  name = name.replace(/[\\/?*\[\]:]/g, '-')
  if (name.length > 31) name = name.slice(0, 31)
  let base = name
  let i = 2
  while (used.has(name)) {
    const suffix = `-${i}`
    const trimLen = Math.max(1, 31 - suffix.length)
    name = base.slice(0, trimLen) + suffix
    i++
  }
  used.add(name)
  return name
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([["İkinci El → Otomobil","Marka","Model","Motor / Versiyon","Donanım","URL"]])
    XLSX.utils.book_append_sheet(wb, ws, 'arabam')
    XLSX.writeFile(wb, OUT_XLSX)
    return
  }
  const raw = fs.readFileSync(CSV_PATH, 'utf-8')
  const lines = raw.split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(lines[0]).map(x=> x.trim())
  const body = lines.slice(1)
  const set = new Set()
  const rows = []
  const isSatariz = header[0]?.toLowerCase().includes('alt kategori')
  if (isSatariz) {
    const grouped = new Map()
    for (const line of body) {
      const [subcategory, brand, model, series, trim] = parseCsvLine(line).map(x=> x.trim())
      const key = `${(subcategory||'').toLowerCase()}|${uniqKey(brand, model, series, trim)}`
      if (set.has(key)) continue
      if (!subcategory && !brand && !model && !series && !trim) continue
      set.add(key)
      const row = [subcategory || '', brand || '', model || '', series || '', trim || '']
      rows.push(row)
      const bucket = subcategory || 'Bilinmeyen'
      if (!grouped.has(bucket)) grouped.set(bucket, [])
      grouped.get(bucket).push(row)
    }
    const wb = XLSX.utils.book_new()
    const headerRow = ["Alt Kategori","Marka","Model","Motor/Seri","Donanım/Paket"]
    const wsAll = XLSX.utils.aoa_to_sheet([headerRow, ...rows])
    XLSX.utils.book_append_sheet(wb, wsAll, 'Tumu')
    const usedNames = new Set(['Tumu'])
    for (const [subcategory, list] of grouped.entries()) {
      const ws = XLSX.utils.aoa_to_sheet([headerRow, ...list])
      XLSX.utils.book_append_sheet(wb, ws, sheetName(subcategory, usedNames))
    }
    XLSX.writeFile(wb, OUT_XLSX)
  } else {
    for (const line of body) {
      const [category, brand, model, series, trim] = parseCsvLine(line).map(x=> x.trim())
      const key = uniqKey(brand, model, series, trim)
      if (set.has(key)) continue
      set.add(key)
      const url = buildUrl(brand, model, series, trim)
      rows.push(["İkinci El → Otomobil", brand || '', model || '', series || '', trim || '', url])
    }
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([["İkinci El → Otomobil","Marka","Model","Motor / Versiyon","Donanım","URL"], ...rows])
    XLSX.utils.book_append_sheet(wb, ws, 'arabam')
    XLSX.writeFile(wb, OUT_XLSX)
  }
}

main().catch(()=> process.exit(1))
