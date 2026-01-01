#!/usr/bin/env python3
"""
SAHİBİNDEN.COM GERÇEK VERİ ÇEKME BOTU
Anti-bot bypass + Gerçek browser simülasyonu
"""

import json
import asyncio
import time
from playwright.async_api import async_playwright
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# Manuel kategori ve alt kategori listesi (sahibinden.com'dan)
REAL_STRUCTURE = {
    'emlak': {
        'name': 'Emlak',
        'base_url': 'https://www.sahibinden.com/emlak',
        'subcategories': [
            'konut-satilik',
            'konut-kiralik', 
            'konut-gunluk-kiralik',
            'isyeri-satilik',
            'isyeri-kiralik',
            'isyeri-gunluk-kiralik',
            'bina-satilik',
            'bina-kiralik',
            'arsa-satilik',
            'arsa-kiralik',
            'devremulk-satilik',
            'devremulk-kiralik',
        ]
    },
    'vasita': {
        'name': 'Vasıta',
        'base_url': 'https://www.sahibinden.com/vasita',
        'subcategories': [
            'otomobil',
            'arazi-suv-pickup',
            'motosiklet',
            'minivan-panelvan',
            'kamyon-cekici',
            'ticari-araclar',
            'otomobil-klasik',
            'elektrikli-araclar',
        ]
    }
}

async def get_page_html(url):
    """Sayfanın HTML'ini al - Anti-bot bypass"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,  # GUI modda çalış - daha az şüphe
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
            ]
        )
        
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            locale='tr-TR',
        )
        
        # Extra scripts to hide automation
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
        """)
        
        page = await context.new_page()
        
        try:
            logger.info(f"🌐 Sayfa açılıyor: {url}")
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            # JavaScript render için bekle
            await page.wait_for_timeout(5000)
            
            # Scroll yaparak lazy load'ları tetikle
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight / 2)')
            await page.wait_for_timeout(2000)
            
            html = await page.content()
            
            # Screenshot debug için
            await page.screenshot(path=f'/tmp/page_{int(time.time())}.png')
            
            logger.info(f"✅ Sayfa alındı ({len(html)} karakter)")
            
            return html
            
        except Exception as e:
            logger.error(f"❌ Sayfa alınamadı: {e}")
            return None
        finally:
            await browser.close()

async def extract_filters_from_html(html):
    """HTML'den filtreleri çıkar"""
    from bs4 import BeautifulSoup
    
    soup = BeautifulSoup(html, 'html.parser')
    filters = []
    
    # Select elementleri bul
    selects = soup.find_all('select')
    logger.info(f"   📋 {len(selects)} select bulundu")
    
    for select in selects:
        try:
            name = select.get('name', '')
            select_id = select.get('id', '')
            
            # Label bul
            label_text = ""
            if select_id:
                label = soup.find('label', {'for': select_id})
                if label:
                    label_text = label.get_text(strip=True)
            
            # Options
            options = []
            for opt in select.find_all('option'):
                text = opt.get_text(strip=True)
                if text and text not in ['-', 'Seçiniz', '']:
                    options.append(text)
            
            if len(options) > 0:
                filters.append({
                    'label': label_text or name or 'Unknown',
                    'key': name or select_id,
                    'type': 'select',
                    'options': options[:50]
                })
                
        except:
            continue
    
    logger.info(f"   ✅ {len(filters)} filtre çıkarıldı")
    return filters

async def scrape_category_filters():
    """Kategorileri ve filtreleri çek"""
    logger.info("="*70)
    logger.info("🚀 SAHİBİNDEN.COM VERİ ÇEKME BAŞLIYOR")
    logger.info("="*70)
    
    result = {
        'scrape_date': time.strftime('%Y-%m-%d %H:%M:%S'),
        'categories': []
    }
    
    # BS4 yükle
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        logger.error("❌ BeautifulSoup4 yüklü değil")
        return result
    
    for cat_slug, cat_data in list(REAL_STRUCTURE.items())[:2]:
        logger.info(f"\n{'='*70}")
        logger.info(f"📦 {cat_data['name']}")
        logger.info(f"{'='*70}")
        
        category_result = {
            'name': cat_data['name'],
            'slug': cat_slug,
            'subcategories': []
        }
        
        # İlk 3 alt kategori
        for sub_slug in cat_data['subcategories'][:3]:
            url = f"{cat_data['base_url']}/{sub_slug}"
            
            logger.info(f"\n📂 {sub_slug}")
            logger.info(f"   URL: {url}")
            
            # HTML'i al
            html = await get_page_html(url)
            
            if html:
                # Filtreleri çıkar
                filters = await extract_filters_from_html(html)
                
                category_result['subcategories'].append({
                    'name': sub_slug,
                    'slug': sub_slug,
                    'url': url,
                    'filters': filters
                })
            
            await asyncio.sleep(5)  # Rate limiting
        
        result['categories'].append(category_result)
    
    return result

async def main():
    # BeautifulSoup4 kontrol
    try:
        import bs4
    except ImportError:
        logger.info("📦 BeautifulSoup4 yükleniyor...")
        import subprocess
        subprocess.run(['pip', 'install', 'beautifulsoup4', '-q'])
    
    # Scraping başlat
    data = await scrape_category_filters()
    
    # Kaydet
    filename = '/app/sahibinden_scraped_NEW.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # İstatistikler
    total_subs = sum(len(cat['subcategories']) for cat in data['categories'])
    total_filters = sum(
        len(sub['filters'])
        for cat in data['categories']
        for sub in cat['subcategories']
    )
    
    logger.info(f"\n{'='*70}")
    logger.info("✅ TAMAMLANDI!")
    logger.info(f"{'='*70}")
    logger.info(f"💾 Dosya: {filename}")
    logger.info(f"\n📊 İSTATİSTİKLER:")
    logger.info(f"   • Kategori: {len(data['categories'])}")
    logger.info(f"   • Alt Kategori: {total_subs}")
    logger.info(f"   • Filtre: {total_filters}")

if __name__ == '__main__':
    asyncio.run(main())
