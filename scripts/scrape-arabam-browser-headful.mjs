import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'

const BASE_URL = process.env.ARABAM_BASE_URL || 'https://www.arabam.com/'
const OUT_CSV = process.env.ARABAM_SCRAPE_OUT || path.resolve(process.cwd(), 'import/arabam-scraped.csv')
const LOG_PATH = path.resolve(process.cwd(), 'import/scraper.log')
const SS_DIR = path.resolve(process.cwd(), 'import/screenshots')
const SEED_BRANDS = (process.env.ARABAM_SEED_BRANDS || '').split(',').map(s=> s.trim()).filter(Boolean)

function sleep(ms) { return new Promise(r=> setTimeout(r, ms)) }

function trSlug(s) {
  const map = { 'ğ':'g','Ğ':'g','ü':'u','Ü':'u','ş':'s','Ş':'s','ı':'i','İ':'i','ö':'o','Ö':'o','ç':'c','Ç':'c' }
  return String(s || '').split('').map(ch=> map[ch] ?? ch).join('').toLowerCase()
    .replace(/\s+/g,'-').replace(/\.+/g,'-').replace(/[^a-z0-9-]/g,'')
    .replace(/-+/g, '-') // Collapse multiple dashes
    .replace(/^-|-$/g, '') // Trim dashes
}

const BLACKLIST = [
  'tumu','giris-yap','uye-ol','ilan-ver','bana-ozel','garajim','mesajlarim',
  'favorilerim','aramalarim','karsilastirma','yetkili-bayiden','sahibinden',
  'galeriden','arac-tramer-sorgulama','arac-degerleme','ekspertiz',
  'kredi-teklifleri','sigorta-teklifleri','kampanyalar','haberler',
  'sirala','filtrele','temizle','detayli-arama','hizli-arama',
  'iletisim','hakkimizda','reklam','gizlilik','kullanim-kosullari',
  'emlakjet','sigortam.net','kariyer.net','isinolsun.com','chemorbis',
  'cimri.com','steelorbis','neredekal.com','yardim',
  'ucretsiz-teklif-al','randevunu-yonet','otomobil','motosiklet',
  'minivan-panelvan','ticari-araclar','kiralik-araclar','hasarli-araclar',
  'yedek-parca-aksesuar-donanim-tuning','traktor','tarim-is-makineleri',
  'klasik-araclar','elektrikli-araclar','atv-utv','karavan','engelli-araclari',
  'modifiyeli-araclar','sedan','hatchback','station-wagon','suv-pick-up',
  'coupe','cabrio','van-panelvan','minibus','tum-2-el-ilanlar',
  'bana-arac-oner','arabam-kac-para','galeriler','0-km-araclar',
  'markalar','sehirler','tedarik','trink-sat','turbolar',
  'filo-araclarini-hizli-sat','hasar-sorgulama','otomobil-terimleri-sozlugu',
  'garaj','blog-anasayfa','testler','inceleme','otomobille-yasam',
  'danisman','kurumsal-basvuru','garaji-kesfet','lastik','oto-kuafor',
  'servis-bakim','renault-bakim','opel-bakim','toyota-bakim',
  'paketleri-incele','subeleri-gor','bayilik-basvurusu'
]

function isGarbage(text) {
  if (!text) return true
  const s = trSlug(text)
  if (s.length < 2) return true
  if (BLACKLIST.some(b => s.includes(b))) return true
  if (/^(19|20)\d{2}$/.test(text.trim())) return true // Years 19xx-20xx
  if (/^\d+$/.test(s)) return false // Allow pure numbers like "3008", "5008"
  return false
}

function cleanName(text) {
  // Remove trailing numbers (counts) like "Focus 500" -> "Focus"
  // But preserve "3008" (no space)
  let t = sanitizeName(text)
  // Remove count inside parens (10)
  t = t.replace(/\s*\(\d+\)$/, '')
  // Remove trailing number if preceded by space (supports "26.940")
  t = t.replace(/\s+[\d\.]+$/, '')
  return t
}

function log(line) {
  try { fs.appendFileSync(LOG_PATH, `[HEADFUL ${new Date().toISOString()}] ${line}\n`) } catch {}
}

async function shot(page, name) {
  try { fs.mkdirSync(SS_DIR, { recursive: true }) } catch {}
  const fp = path.join(SS_DIR, `${Date.now()}-${name}.png`)
  try { await page.screenshot({ path: fp, fullPage: true }) } catch {}
}

function buildBrandUrl(brand) { return new URL(`/ikinci-el/otomobil/${trSlug(brand)}`, BASE_URL).toString() }
function buildModelUrl(brand, model) { return new URL(`/ikinci-el/otomobil/${trSlug(brand)}-${trSlug(model)}`, BASE_URL).toString() }
function buildSeriesUrl(brand, model, series) { return new URL(`/ikinci-el/otomobil/${trSlug(brand)}-${trSlug(model)}-${trSlug(series)}`, BASE_URL).toString() }
function buildTrimUrl(brand, model, series, trim) { return new URL(`/ikinci-el/otomobil/${trSlug(brand)}-${trSlug(model)}-${trSlug(series)}-${trSlug(trim)}`, BASE_URL).toString() }

async function extractListItems(page) {
  // Try to find the main list of items (brands, models, etc.)
  // Usually in a ul or div list. We look for elements that look like category links.
  return await page.$$eval('ul li a, div.list-group a, .category-list a, .filter-list a', list => 
    list.map(a => {
      if (a.closest('header') || a.closest('footer') || a.closest('.footer') || a.closest('.header')) return null
      return { href: a.getAttribute('href') || '', text: (a.textContent || '').trim() }
    })
    .filter(x => x && x.href && x.text && x.text.length < 50)
  )
}

async function extractByPattern(page, predicate) {
  const anchors = await extractListItems(page)
  const out = []
  const seen = new Set()
  
  for (const a of anchors) {
    try {
      const u = new URL(a.href, BASE_URL)
      const segs = u.pathname.split('/').filter(Boolean)
      if (predicate(segs)) {
        if (!seen.has(u.toString())) {
          seen.add(u.toString())
          out.push({ href: u.toString(), text: a.text })
        }
      }
    } catch {}
  }
  return out
}

function sanitizeName(txt) { return String(txt || '').replace(/\s+/g,' ').trim() }

function toCsv(...args) {
  return args.map(a => `"${String(a||'').replace(/"/g, '""')}"`).join(',') + '\n'
}

async function main() {
  try { fs.writeFileSync(LOG_PATH, '') } catch {}
  
  // Load existing CSV to avoid overwriting if in append mode (optional logic, but good for safety)
  // For this request, we rewrite to ensure clean slate if user asked for "baştan sona tekrar kontrol et"
  // BUT we will buffer writes to not lose data on crash, or use appendSync for rows.
  // Actually, let's read existing if we want to support incremental, but the user said "check from start to finish".
  // So we might want to start fresh or just append. Let's overwrite for a clean "re-check".
  
  const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1280, height: 900 } })
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36')
  
  // Navigate to Home
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
    await shot(page, 'home')
    log('Home opened')
  } catch (e) {
    log(`Error loading home: ${e}`)
  }

  // Navigate to Category
  try {
    await page.goto(new URL('/ikinci-el/otomobil', BASE_URL).toString(), { waitUntil: 'networkidle2' })
    await shot(page, 'category')
    log('Category opened')
  } catch (e) {
    log(`Error loading category: ${e}`)
  }

  let brands = await extractByPattern(page, (segs) => segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3)
  
  // Fallback for brands if extraction fails (common main brands)
  if (!brands.length) {
    const fallback = SEED_BRANDS.length ? SEED_BRANDS : ['Opel','Renault','Volkswagen','Toyota','Honda','Hyundai','Kia','Ford','Peugeot','Audi','BMW','Mercedes','Skoda','Nissan','Alfa Romeo']
    brands = fallback.map(b => ({ href: buildBrandUrl(b), text: b }))
  }

  // Filter if seed brands provided
  if (SEED_BRANDS.length) {
    const seeds = SEED_BRANDS.map(s=> s.toLowerCase())
    const filtered = brands.filter(b=> seeds.includes(b.text.toLowerCase()))
    brands = filtered.length ? filtered : SEED_BRANDS.map(b=> ({ href: buildBrandUrl(b), text: b }))
  }

  // Initialize CSV with header
  fs.mkdirSync(path.dirname(OUT_CSV), { recursive: true })
  if (!fs.existsSync(OUT_CSV)) {
     fs.writeFileSync(OUT_CSV, 'category,brand,model,series,trim\n')
  }

  for (const b of brands) {
    b.text = cleanName(b.text) // Clean brand name immediately
    log(`Brand ${b.text}`)
    try {
      await page.goto(b.href, { waitUntil: 'networkidle2' })
      await shot(page, `brand-${trSlug(b.text)}`)
    } catch { continue }

    // Derive brand slug from href (reliable) or fallback to text
    let brandSlug = ''
    try {
        const u = new URL(b.href)
        const segs = u.pathname.split('/').filter(Boolean)
        if (segs.length >= 3) brandSlug = segs[2]
    } catch {}
    if (!brandSlug) brandSlug = trSlug(b.text)
    
    // 1. Try extracting models from links
    let models = await extractByPattern(page, (segs) => segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && (segs[2] || '').startsWith(`${brandSlug}-`))
    
    // 2. Fallback: Look for "Models" list specifically if pattern fails
    if (!models.length) {
       const links = await extractListItems(page)
       // Filter links that look like models (not garbage)
       models = links.filter(l => {
         if (isGarbage(l.text)) return false
         if (l.text.toLowerCase() === b.text.toLowerCase()) return false
         // Verify HREF contains brand slug
         try {
            const u = new URL(l.href, BASE_URL).pathname
            if (!u.includes(brandSlug)) return false
         } catch { return false }
         return true
       })
       .map(m => ({ href: new URL(m.href, BASE_URL).toString(), text: m.text }))
       
       // Remove duplicates
       models = models.filter((v,i,a)=> a.findIndex(t=>(t.text===v.text))===i)
    }

    for (const m of models) {
      const mName = cleanName(m.text)
      if (isGarbage(mName)) continue
      
      log(`Model ${b.text}/${mName} -> ${m.href}`)
      try {
        await page.goto(m.href, { waitUntil: 'networkidle2' }) // USE HREF
        await shot(page, `model-${trSlug(b.text)}-${trSlug(mName)}`)
      } catch { continue }

      const modelSlug = trSlug(mName) // Note: This might still be "145-10" if text is "145 10". But we navigated correctly.
      // Better: derive model slug from href if possible to help finding series
      let currentSlug = ''
      try {
          const u = new URL(m.href)
          const segs = u.pathname.split('/').filter(Boolean)
          if (segs.length >= 3) currentSlug = segs[2]
      } catch {}
      
      // If we couldn't derive slug from href, fallback to text slug
      if (!currentSlug) currentSlug = `${brandSlug}-${modelSlug}`

      let series = await extractByPattern(page, (segs) => {
        const seg = segs[2] || ''
        return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && seg.startsWith(`${currentSlug}-`)
      })

      if (!series.length) {
        const links = await extractListItems(page)
        series = links.filter(l => {
          if (isGarbage(l.text)) return false
          if (l.text.toLowerCase() === mName.toLowerCase()) return false
          // Verify HREF contains brand AND model slug
          try {
             const u = new URL(l.href, BASE_URL).pathname
             if (!u.includes(brandSlug)) return false
             // modelSlug might be partial (e.g. '145' in '145-1-4'), but it should exist.
             // Note: '145' slug is simple. Complex slugs might fail exact match.
             // But usually it should be present.
             if (!u.includes(modelSlug)) return false
          } catch { return false }
          return true
        })
        .map(s => ({ href: new URL(s.href, BASE_URL).toString(), text: s.text }))
        
        series = series.filter((v,i,a)=> a.findIndex(t=>(t.text===v.text))===i)

        if (!series.length) {
          fs.appendFileSync(OUT_CSV, toCsv('Otomobil', b.text, mName, '', ''))
          continue
        }
      }

      for (const s of series) {
        const sName = cleanName(s.text)
        if (isGarbage(sName)) continue
        
        log(`Series ${b.text}/${mName}/${sName} -> ${s.href}`)
        try {
           await page.goto(s.href, { waitUntil: 'networkidle2' }) // USE HREF
           await shot(page, `series-${trSlug(b.text)}-${trSlug(mName)}-${trSlug(sName)}`)
        } catch { continue }
        
        // Derive series slug from href
        let seriesSlug = ''
        try {
            const u = new URL(s.href)
            const segs = u.pathname.split('/').filter(Boolean)
            if (segs.length >= 3) seriesSlug = segs[2]
        } catch {}
        if (!seriesSlug) seriesSlug = `${currentSlug}-${trSlug(sName)}`

        let trims = await extractByPattern(page, (segs) => {
          const seg = segs[2] || ''
          return segs[0] === 'ikinci-el' && segs[1] === 'otomobil' && segs.length === 3 && seg.startsWith(`${seriesSlug}-`)
        })

        if (!trims.length) {
          const links = await extractListItems(page)
          trims = links.filter(l => {
             const txt = l.text.toLowerCase()
             if (isGarbage(l.text)) return false
             if (txt === sName.toLowerCase()) return false
             if (txt === mName.toLowerCase()) return false
             if (txt === b.text.toLowerCase()) return false
             if (['audi','bmw','ford','fiat','honda','toyota','mercedes - benz','renault'].includes(txt) && txt !== b.text.toLowerCase()) return false
             
             // Verify HREF contains brand, model, AND series slug
             try {
                 const u = new URL(l.href, BASE_URL).pathname
                 if (!u.includes(brandSlug)) return false
                 if (!u.includes(modelSlug)) return false
                 // Strict check: Trim URL must contain the current Series slug
                 // This filters out sibling series (e.g. 1.6 vs 1.8) and parent model links
                 if (seriesSlug && !u.includes(seriesSlug)) return false
             } catch { return false }
             
             return true
          }).map(t => ({ href: new URL(t.href, BASE_URL).toString(), text: t.text }))
          
          trims = trims.filter((v,i,a)=> a.findIndex(t=>(t.text===v.text))===i)
        }

        if (!trims.length) {
          fs.appendFileSync(OUT_CSV, toCsv('Otomobil', b.text, mName, sName, ''))
        } else {
          for (const t of trims) {
            const tName = cleanName(t.text).toUpperCase()
            if (isGarbage(tName)) continue
            fs.appendFileSync(OUT_CSV, toCsv('Otomobil', b.text, mName, sName, tName))
          }
        }
      }
    }
  }

  await browser.close()
}

main().catch(async (e) => { try { fs.appendFileSync(LOG_PATH, String(e)) } catch {}; process.exit(1) })
