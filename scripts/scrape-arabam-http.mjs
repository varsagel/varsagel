import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE = process.env.ARABAM_BASE_URL || 'https://www.arabam.com'
const OUT_CSV = process.env.ARABAM_SCRAPE_OUT || path.resolve(__dirname, '../import/arabam-scraped.csv')
const SEED = (process.env.ARABAM_SEED_BRANDS || '').split(',').map(s=> s.trim()).filter(Boolean)

function trSlug(s) {
  const map = { 'ğ':'g','Ğ':'g','ü':'u','Ü':'u','ş':'s','Ş':'s','ı':'i','İ':'i','ö':'o','Ö':'o','ç':'c','Ç':'c' }
  return String(s || '').split('').map(ch=> map[ch] ?? ch).join('').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
}

function cleanFromSlug(slug) {
  const s = String(slug || '').trim()
  // convert digit-digit into digit.dot
  const numDot = s.replace(/(?<=\d)-(\d)/g, '.$1')
  return numDot.replace(/-/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '')
}

async function getHtml(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return ''
    return await res.text()
  } catch { return '' }
}

function uniq(arr) { return Array.from(new Set(arr)) }

function extractSlugs(html, brandSlug, modelSlug, seriesSlug) {
  const BLOCK = ['sahibinden','galeriden','ilan','sigorta','hasar','kredisi','ikinci-el']
  const hrefs = []
  const re = /href="([^"]+)"/gi
  let m
  while ((m = re.exec(html))) {
    hrefs.push(m[1])
  }
  const segs = hrefs.map(h => {
    try { const u = new URL(h, BASE); return u.pathname.split('/').filter(Boolean) } catch { return [] }
  })
  const wanted = segs.filter(s => s[0] === 'ikinci-el' && s[1] === 'otomobil' && s.length >= 3)
  const last = wanted.map(s => s[2])
  // brand: s.length===3 && s[2]===brandSlug
  // model: s.length===3 && s[2].startsWith(`${brandSlug}-`) && !s[2].includes(`${brandSlug}-${modelSlug}-`)
  // series: s.length===3 && s[2].startsWith(`${brandSlug}-${modelSlug}-`) && (seriesSlug ? !s[2].includes(`${brandSlug}-${modelSlug}-${seriesSlug}-`) : true)
  const models = uniq(last.filter(x => x && x.startsWith(`${brandSlug}-`) && x !== brandSlug && !BLOCK.some(b=> x.includes(b))))
  const series = modelSlug ? uniq(last.filter(x => x && x.startsWith(`${brandSlug}-${modelSlug}-`) && x !== `${brandSlug}-${modelSlug}` && !BLOCK.some(b=> x.includes(b)))) : []
  const trims = seriesSlug ? uniq(last.filter(x => x && x.startsWith(`${brandSlug}-${modelSlug}-${seriesSlug}-`) && !BLOCK.some(b=> x.includes(b)))) : []
  return { models, series, trims }
}

function brandUrl(brand) { return `${BASE}/ikinci-el/otomobil/${trSlug(brand)}` }
function modelUrl(brand, model) { return `${BASE}/ikinci-el/otomobil/${trSlug(brand)}-${trSlug(model)}` }
function seriesUrl(brand, model, series) { return `${BASE}/ikinci-el/otomobil/${trSlug(brand)}-${trSlug(model)}-${trSlug(series)}` }

async function scrapeBrand(brand) {
  const out = []
  const bSlug = trSlug(brand)
  const bHtml = await getHtml(brandUrl(brand))
  const { models } = extractSlugs(bHtml, bSlug)
  const modelSlugs = models.map(ms => ms.replace(`${bSlug}-`, ''))
  for (const mSlug of modelSlugs) {
    const mHtml = await getHtml(modelUrl(brand, cleanFromSlug(mSlug)))
    const { series } = extractSlugs(mHtml, bSlug, mSlug)
    const seriesSlugs = series.map(ss => ss.replace(`${bSlug}-${mSlug}-`, ''))
    if (!seriesSlugs.length) {
      out.push(['Otomobil', brand, cleanFromSlug(mSlug), '', ''])
      continue
    }
    for (const sSlug of seriesSlugs) {
      const sHtml = await getHtml(seriesUrl(brand, cleanFromSlug(mSlug), cleanFromSlug(sSlug)))
      const { trims } = extractSlugs(sHtml, bSlug, mSlug, sSlug)
      const trimSlugs = trims.map(ts => ts.replace(`${bSlug}-${mSlug}-${sSlug}-`, ''))
      if (!trimSlugs.length) {
        const text = sHtml.replace(/<[^>]+>/g, ' ')
        const pat = new RegExp(`${brand.replace(/\s+/g,'\\s+')}\\s+${cleanFromSlug(mSlug).replace(/\s+/g,'\\s+')}\\s+${cleanFromSlug(sSlug).replace(/\s+/g,'\\s+')}\\s+([A-Za-z0-9\-\s]{2,20})`, 'ig')
        let mm
        const fromTitles = []
        while ((mm = pat.exec(text))) {
          let t = mm[1].trim()
          if (!t) continue
          t = t.replace(/\s+\d.*$/, '')
          t = t.replace(/[,.:;]+$/,'')
          const up = t.toUpperCase().replace(/\s+/g,' ').trim()
          const noise = ['SAHIBINDEN','GALERIDEN','MOTOR','MODEL','YIL','KM','FIYAT','RENK','BEYAZ','BORDO','LACIVERT']
          if (!up || noise.some(n=> up.includes(n))) continue
          if (!fromTitles.includes(up)) fromTitles.push(up)
        }
        for (const t of fromTitles) {
          out.push(['Otomobil', brand, cleanFromSlug(mSlug), cleanFromSlug(sSlug), t])
        }
      }
      if (!trimSlugs.length) {
        out.push(['Otomobil', brand, cleanFromSlug(mSlug), cleanFromSlug(sSlug), ''])
        continue
      }
      for (const tSlug of trimSlugs) {
        out.push(['Otomobil', brand, cleanFromSlug(mSlug), cleanFromSlug(sSlug), cleanFromSlug(tSlug)])
      }
    }
  }
  return out
}

async function main() {
  const brands = SEED.length ? SEED : ['Opel','Renault','Volkswagen','Toyota','Honda','Hyundai','Kia','Ford','Peugeot','Citroën','Audi','BMW','Mercedes','Skoda','Nissan']
  const rows = []
  for (const b of brands) {
    const r = await scrapeBrand(b)
    rows.push(...r)
  }
  const lines = ['category,brand,model,series,trim', ...rows.map(r=> r.map(v=> String(v).replace(/,/g,' ')).join(','))]
  fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true })
  fs.writeFileSync(OUT_CSV, lines.join('\n'))
  console.log(`Written ${OUT_CSV} rows=${rows.length}`)
}

main().catch(e => { console.error(e); process.exit(1) })