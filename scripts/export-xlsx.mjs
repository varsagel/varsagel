import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

const CSV_PATH = path.resolve(process.cwd(), 'import/arabam-scraped.csv')
const OUT_XLSX = path.resolve(process.cwd(), 'import/arabam-scraped.xlsx')

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
  lines.shift()
  const set = new Set()
  const rows = []
  for (const line of lines) {
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

main().catch(()=> process.exit(1))