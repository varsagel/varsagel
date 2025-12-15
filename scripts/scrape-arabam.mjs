import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = process.env.ARABAM_BASE_URL || 'https://www.arabam.com/ikinci-el/otomobil'
const OUT_CSV = process.env.ARABAM_SCRAPE_OUT || path.resolve(__dirname, '../import/arabam-scraped.csv')
const TIMEOUT_MS = Number(process.env.ARABAM_TIMEOUT || 12000)
const DELAY_MS = Number(process.env.ARABAM_DELAY || 800)

function sleep(ms) { return new Promise(r=> setTimeout(r, ms)) }

function slugifyTr(s) {
  const map = { 'ğ':'g','Ğ':'g','ü':'u','Ü':'u','ş':'s','Ş':'s','ı':'i','İ':'i','ö':'o','Ö':'o','ç':'c','Ç':'c' }
  return s.split('').map(ch=> map[ch] ?? ch).join('').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
}

async function safeFetch(url) {
  const ac = new AbortController()
  const t = setTimeout(()=> ac.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: ac.signal })
    clearTimeout(t)
    if (!res.ok) return null
    return await res.text()
  } catch { clearTimeout(t); return null }
}

function extractByHref(html, hrefRegex) {
  if (!html) return []
  const out = []
  const re = new RegExp(`<a[^>]*href="${hrefRegex.source}"[^>]*>([^<]+)<\\/a>`, 'gi')
  let m
  while ((m = re.exec(html))) {
    const txt = (m[2] || '').trim()
    if (!txt) continue
    if (!out.includes(txt)) out.push(txt)
  }
  return out
}

function buildBrandUrl(base, brand) {
  const u = new URL(base)
  const slug = slugifyTr(brand)
  u.pathname = path.posix.join(u.pathname, slug)
  return u.toString()
}

function buildModelUrl(brandUrl, model) {
  const u = new URL(brandUrl)
  const slug = slugifyTr(model)
  u.pathname = path.posix.join(u.pathname, slug)
  return u.toString()
}

async function crawl() {
  const baseHtml = await safeFetch(BASE_URL)
  const brandRe = new RegExp(`\\/ikinci-el\\/otomobil\\/([^"?#/]+)$`)
  const brands = extractByHref(baseHtml, brandRe)
  const rows = []
  for (const brand of brands) {
    await sleep(DELAY_MS)
    const brandUrl = buildBrandUrl(BASE_URL, brand)
    const bHtml = await safeFetch(brandUrl)
    const brandSlug = slugifyTr(brand)
    const modelRe = new RegExp(`\\/ikinci-el\\/otomobil\\/${brandSlug}\\/([^"?#/]+)$`)
    const models = extractByHref(bHtml, modelRe)
    if (!models.length) rows.push(['Otomobil', brand, '', '', ''])
    for (const model of models) {
      await sleep(DELAY_MS)
      const modelUrl = buildModelUrl(brandUrl, model)
      const mHtml = await safeFetch(modelUrl)
      const modelSlug = slugifyTr(model)
      const seriesRe = new RegExp(`\\/ikinci-el\\/otomobil\\/${brandSlug}\\/${modelSlug}\\/([^"?#/]+)$`)
      const series = extractByHref(mHtml, seriesRe)
      const trimsRe = new RegExp(`\\/ikinci-el\\/otomobil\\/${brandSlug}\\/${modelSlug}\\/[^"?#/]+\\/([^"?#/]+)$`)
      const trims = extractByHref(mHtml, trimsRe)
      if (!series.length && !trims.length) rows.push(['Otomobil', brand, model, '', ''])
      if (series.length && !trims.length) {
        for (const s of series) rows.push(['Otomobil', brand, model, s, ''])
      }
      if (!series.length && trims.length) {
        for (const t of trims) rows.push(['Otomobil', brand, model, '', t])
      }
      if (series.length && trims.length) {
        for (const s of series) for (const t of trims) rows.push(['Otomobil', brand, model, s, t])
      }
    }
  }
  return rows
}

async function main() {
  const rows = await crawl()
  const lines = ['category,brand,model,series,trim', ...rows.map(r=> r.map(v=> String(v).replace(/,/g,' ')).join(','))]
  fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true })
  fs.writeFileSync(OUT_CSV, lines.join('\n'))
  console.log(`Written ${OUT_CSV}`)
}

main().catch(e=> { console.error(e); process.exit(1) })