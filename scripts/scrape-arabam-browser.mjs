import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'

const BASE_URL = process.env.ARABAM_BASE_URL || 'https://www.arabam.com/'
const OUT_CSV = process.env.ARABAM_SCRAPE_OUT || path.resolve(process.cwd(), 'import/arabam-scraped.csv')
const DELAY_MS = Number(process.env.ARABAM_DELAY || 800)
const SEED_BRANDS = (process.env.ARABAM_SEED_BRANDS || '').split(',').map(s=> s.trim()).filter(Boolean)
const LOG_PATH = path.resolve(process.cwd(), 'import/scraper.log')

function sleep(ms) { return new Promise(r=> setTimeout(r, ms)) }

function pathSegments(href) {
  try {
    const u = new URL(href, BASE_URL)
    const segs = u.pathname.split('/').filter(Boolean)
    return segs
  } catch { return [] }
}

function sanitizeName(txt) {
  return String(txt || '')
    .replace(/\s*[0-9\.,]+\s*$/,'')
    .replace(/\s+/g,' ')
    .trim()
}

const BLOCK_TERMS = ['ikinci el','sahibinden','bakım','blog','testler','haberler','servis','oto kuaför','trink','garaj','hasar sorgulama']

async function extractByPattern(page, predicate) {
  const anchors = await page.$$eval('a[href]', list => list.map(a => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() })))
  const out = []
  for (const a of anchors) {
    const segs = pathSegments(a.href)
    if (predicate(segs)) {
      const low = (a.text || '').toLowerCase()
      if (BLOCK_TERMS.some(term => low.includes(term))) continue
      const clean = sanitizeName(a.text)
      if (clean && !out.find(x=> x.text === clean)) out.push({ text: clean, href: a.href })
    }
  }
  return out
}

async function textCandidates(page) {
  const texts = await page.$$eval('a,button,li,span,div', list => list.map(el => (el.textContent || '').trim()))
  const uniq = []
  for (const t of texts) {
    const clean = sanitizeName(t)
    const low = clean.toLowerCase()
    if (!clean) continue
    if (BLOCK_TERMS.some(term => low.includes(term))) continue
    if (clean.length < 1 || clean.length > 30) continue
    if (/^[0-9\.,]+$/.test(clean)) continue
    if (!uniq.includes(clean)) uniq.push(clean)
  }
  return uniq
}

function segSlug(s) {
  return slugifyTr(String(s || '').replace(/\./g, '-'))
}

function brandUrl(brand) {
  const b = segSlug(brand)
  return new URL(`/ikinci-el/otomobil/${b}`, BASE_URL).toString()
}

function modelUrl(brand, model) {
  const b = segSlug(brand), m = segSlug(model)
  return new URL(`/ikinci-el/otomobil/${b}-${m}`, BASE_URL).toString()
}

function seriesUrl(brand, model, series) {
  const b = segSlug(brand), m = segSlug(model), s = segSlug(series)
  return new URL(`/ikinci-el/otomobil/${b}-${m}-${s}`, BASE_URL).toString()
}

function trimUrl(brand, model, series, trim) {
  const b = segSlug(brand), m = segSlug(model), s = segSlug(series), t = segSlug(trim)
  return new URL(`/ikinci-el/otomobil/${b}-${m}-${s}-${t}`, BASE_URL).toString()
}

async function main() {
  try { fs.writeFileSync(LOG_PATH, '') } catch {}
  log('Scrape started')
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 900 } })
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36')
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
  await sleep(800)
  try {
    const buttons = await page.$$eval('button', list => list.map(b => (b.textContent || '').trim().toLowerCase()))
    const idx = buttons.findIndex(t => t.includes('kabul') || t.includes('tümünü kabul') || t.includes('accept') || t.includes('allow'))
    if (idx >= 0) {
      const handle = (await page.$$('button'))[idx]
      if (handle) { await handle.click(); log('Clicked cookie accept'); await sleep(400) }
    }
  } catch {}

  try {
    const anchors = await page.$$eval('a[href]', list => list.map(a => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() })))
    const otomobil = anchors.find(a => {
      const segs = (new URL(a.href, BASE_URL)).pathname.split('/').filter(Boolean)
      return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 2
    })
    if (otomobil) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.goto(new URL(otomobil.href, BASE_URL).toString())
      ])
      log('Navigated to otomobil category')
    } else {
      await page.goto(new URL('/ikinci-el/otomobil', BASE_URL).toString(), { waitUntil: 'networkidle2' })
      log('Direct goto otomobil category')
    }
  } catch {}

  let brands = await extractByPattern(page, (segs) => segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3)
  if (!brands.length) {
    const fallback = SEED_BRANDS.length ? SEED_BRANDS : ['Opel','Renault','Volkswagen','Toyota','Honda','Hyundai','Kia','Ford','Peugeot','Audi','BMW','Mercedes','Skoda','Nissan','Alfa Romeo']
    brands = fallback.map(b=> ({ text: b, href: brandUrl(b) }))
  }
  if (SEED_BRANDS.length) {
    const seedsLow = SEED_BRANDS.map(s=> s.toLowerCase())
    const filtered = brands.filter(b=> seedsLow.includes(b.text.toLowerCase()))
    if (filtered.length) {
      brands = filtered
      log(`Filtered to seeds: ${SEED_BRANDS.join(',')}`)
    } else {
      brands = SEED_BRANDS.map(b=> ({ text: b, href: brandUrl(b) }))
      log(`Seeds used directly: ${SEED_BRANDS.join(',')}`)
    }
  }
  log(`Brands found: ${brands.length}`)

  const rows = []
  for (const b of brands) {
    log(`Visit brand: ${b.text}`)
    await page.goto(new URL(b.href, BASE_URL).toString(), { waitUntil: 'networkidle2' })
    await sleep(DELAY_MS)
    const brandSlug = segSlug(b.text)
    let models = await extractByPattern(page, (segs) => {
      return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && (segs[2] || '').startsWith(`${brandSlug}-`)
    })
    if (!models.length) {
      try {
        await page.waitForSelector('a[href]', { timeout: 4000 })
        const anchors = await page.$$eval('a[href]', list => list.map(a => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() })))
        models = anchors.filter(a => {
          const segs = (new URL(a.href, BASE_URL)).pathname.split('/').filter(Boolean)
          return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && (segs[2] || '').startsWith(`${brandSlug}-`)
        }).map(a => ({ text: sanitizeName(a.text), href: modelUrl(b.text, sanitizeName(a.text)) })).filter(a => a.text && !BLOCK_TERMS.some(term => a.text.toLowerCase().includes(term)))
      } catch {}
    }
    if (!models.length) {
      try {
        const candidates = await textCandidates(page)
        models = candidates.map(m => ({ text: m, href: modelUrl(b.text, m) }))
        log(`Models fallback candidates used: ${models.length}`)
      } catch {}
    }
    log(`Models for ${brandSlug}: ${models.length}`)
    if (!models.length) rows.push(['Otomobil', b.text, '', '', ''])
    for (const m of models) {
      log(`Visit model: ${m.text}`)
      await page.goto(new URL(m.href, BASE_URL).toString(), { waitUntil: 'networkidle2' })
      await sleep(DELAY_MS)
      const modelSlug = segSlug(m.text)
      let series = await extractByPattern(page, (segs) => {
        const seg = segs[2] || ''
        return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && seg.startsWith(`${brandSlug}-${modelSlug}-`)
      })
      let trims = []
      if (!series.length || !trims.length) {
        try {
          await page.waitForSelector('a[href]', { timeout: 3000 })
          const anchors = await page.$$eval('a[href]', list => list.map(a => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() })))
          if (!series.length) {
            series = anchors.filter(a => {
              const segs = (new URL(a.href, BASE_URL)).pathname.split('/').filter(Boolean)
              const seg = segs[2] || ''
              return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && seg.startsWith(`${brandSlug}-${modelSlug}-`)
            }).map(a => ({ text: sanitizeName(a.text), href: seriesUrl(b.text, m.text, sanitizeName(a.text)) })).filter(a => a.text && !BLOCK_TERMS.some(term => a.text.toLowerCase().includes(term)))
          }
          if (!trims.length) {
            trims = anchors.filter(a => {
              const segs = (new URL(a.href, 'https://www.arabam.com')).pathname.split('/').filter(Boolean)
              return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs[2] === sModelSegs[2] && segs[3] === sModelSegs[3] && segs.length === 6
            }).map(a => ({ text: sanitizeName(a.text), href: a.href })).filter(a => a.text && !BLOCK_TERMS.some(term => a.text.toLowerCase().includes(term)))
          }
        } catch {}
      }
      if (!series.length) {
        try {
          const cand = await textCandidates(page)
          series = cand.map(s => ({ text: s, href: seriesUrl(b.text, m.text, s) }))
          log(`Series fallback candidates used: ${series.length}`)
        } catch {}
      }
      // Collect trims by visiting each series page
      for (const s of series) {
        await page.goto(seriesUrl(b.text, m.text, s.text), { waitUntil: 'networkidle2' })
        await sleep(400)
        let localTrims = await extractByPattern(page, (segs) => {
          const seg = segs[2] || ''
          return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && seg.startsWith(`${brandSlug}-${modelSlug}-${segSlug(s.text)}-`)
        })
        if (!localTrims.length) {
          try {
            await page.waitForSelector('a[href]', { timeout: 3000 })
            const anchors = await page.$$eval('a[href]', list => list.map(a => ({ href: a.getAttribute('href') || '', text: (a.textContent || '').trim() })))
            localTrims = anchors.filter(a => {
              const segs = (new URL(a.href, BASE_URL)).pathname.split('/').filter(Boolean)
              const seg = segs[2] || ''
              return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && seg.startsWith(`${brandSlug}-${modelSlug}-${segSlug(s.text)}-`)
            }).map(a => ({ text: sanitizeName(a.text), href: trimUrl(b.text, m.text, s.text, sanitizeName(a.text)) }))
          } catch {}
        }
        for (const t of localTrims) rows.push(['Otomobil', b.text, m.text, s.text, t.text])
      }
      log(`Series: ${series.length} Trims: ${trims.length} for ${b.text}/${m.text}`)
      if (!series.length && !trims.length) rows.push(['Otomobil', b.text, m.text, '', ''])
  if (series.length && !trims.length) for (const s of series) rows.push(['Otomobil', b.text, m.text, s.text, ''])
  if (!series.length && trims.length) for (const t of trims) rows.push(['Otomobil', b.text, m.text, '', t.text])
  if (series.length && trims.length) for (const s of series) for (const t of trims) rows.push(['Otomobil', b.text, m.text, s.text, t.text])
    }
  }

  const lines = ['category,brand,model,series,trim', ...rows.map(r=> r.map(v=> String(v).replace(/,/g,' ')).join(','))]
  fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true })
  fs.writeFileSync(OUT_CSV, lines.join('\n'))
  console.log(`Written ${OUT_CSV}`)
  log(`CSV written: ${OUT_CSV}, rows=${rows.length}`)
  await browser.close()
  log('Scrape finished')
}

main().catch(async (e) => { console.error(e); process.exit(1) })
function log(line) {
  try {
    const ts = new Date().toISOString()
    fs.appendFileSync(LOG_PATH, `[SCRAPE ${ts}] ${line}\n`)
  } catch {}
}
function slugifyTr(s) {
  const map = { 'ğ':'g','Ğ':'g','ü':'u','Ü':'u','ş':'s','Ş':'s','ı':'i','İ':'i','ö':'o','Ö':'o','ç':'c','Ç':'c' }
  return s.split('').map(ch=> map[ch] ?? ch).join('').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
}
