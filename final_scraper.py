#!/usr/bin/env python3
"""
SAHİBİNDEN.COM FİNAL SCRAPER
Playwright browser + Maximum stealth + Uzun bekleme
"""

import json
import asyncio
import time
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

async def scrape_with_max_stealth():
    """Maximum stealth ile scrape"""
    
    logger.info("="*70)
    logger.info("🚀 SAHİBİNDEN.COM SCRAPER - FINAL VERSION")
    logger.info("="*70)
    
    playwright = await async_playwright().start()
    
    # Stealth browser
    browser = await playwright.chromium.launch(
        headless=True,
        args=[
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-dev-shm-usage',
        ]
    )
    
    context = await browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        viewport={'width': 1920, 'height': 1080},
        locale='tr-TR',
        timezone_id='Europe/Istanbul',
    )
    
    # Anti-detection
    await context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        window.chrome = {runtime: {}};
        Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3]});
    """)
    
    page = await context.new_page()
    
    results = []
    
    # Test URL'leri
    test_cases = [
        {
            'name': 'Satılık Daire',
            'url': 'https://www.sahibinden.com/satilik-daire',
            'category': 'emlak'
        },
        {
            'name': 'Otomobil',
            'url': 'https://www.sahibinden.com/otomobil',
            'category': 'vasita'
        },
        {
            'name': 'Satılık Arsa',
            'url': 'https://www.sahibinden.com/satilik-arsa',
            'category': 'emlak'
        }
    ]
    
    for test in test_cases:
        logger.info(f"\n{'='*70}")
        logger.info(f"📂 {test['name']}")
        logger.info(f"🔗 {test['url']}")
        logger.info(f"{'='*70}")
        
        try:
            # Sayfayı yükle - domcontentloaded yeterli
            logger.info("⏳ Sayfa yükleniyor...")
            await page.goto(test['url'], wait_until='domcontentloaded', timeout=40000)
            logger.info("   ✓ Sayfa yüklendi")
            
            # JavaScript çalışması için UZUN bekle
            logger.info("⏳ JavaScript render bekleniyor (10 saniye)...")
            await page.wait_for_timeout(10000)
            logger.info("   ✓ Render tamamlandı")
            
            # Scroll - lazy load için
            await page.evaluate('window.scrollTo(0, 800)')
            await page.wait_for_timeout(2000)
            
            # HTML
            html = await page.content()
            logger.info(f"📄 HTML: {len(html):,} karakter")
            
            # Cloudflare kontrolü
            if 'cloudflare' in html.lower() or 'challenge' in html.lower():
                logger.warning("⚠️ Cloudflare challenge tespit edildi!")
                
                # Challenge bitsin diye daha fazla bekle
                logger.info("⏳ Challenge çözülmesi bekleniyor (15 saniye)...")
                await page.wait_for_timeout(15000)
                
                html = await page.content()
                logger.info(f"📄 Yeni HTML: {len(html):,} karakter")
            
            # Parse
            soup = BeautifulSoup(html, 'html.parser')
            
            # Elementleri say
            selects = soup.find_all('select')
            inputs = soup.find_all('input')
            forms = soup.find_all('form')
            
            logger.info(f"\n📊 BULUNAN ELEMENTLER:")
            logger.info(f"   • SELECT: {len(selects)}")
            logger.info(f"   • INPUT: {len(inputs)}")
            logger.info(f"   • FORM: {len(forms)}")
            
            # Filtreleri çıkar
            filters = []
            
            for sel in selects[:20]:
                name = sel.get('name', '')
                sel_id = sel.get('id', '')
                
                options = [opt.get_text(strip=True) for opt in sel.find_all('option')]
                options = [o for o in options if o and o not in ['-', 'Seçiniz']]
                
                if len(options) > 0:
                    logger.info(f"   ✓ {name or sel_id}: {len(options)} seçenek")
                    
                    filters.append({
                        'label': name or sel_id,
                        'key': name or sel_id,
                        'type': 'select',
                        'options': options[:50]
                    })
            
            # Number inputs
            number_inputs = [inp for inp in inputs if inp.get('type') == 'number']
            
            i = 0
            while i < len(number_inputs) - 1:
                name1 = number_inputs[i].get('name', '')
                name2 = number_inputs[i+1].get('name', '')
                
                if 'min' in name1.lower() and 'max' in name2.lower():
                    filters.append({
                        'label': name1.replace('_min', '').replace('_', ' ').title(),
                        'type': 'range-number',
                        'minKey': name1,
                        'maxKey': name2
                    })
                    logger.info(f"   ✓ Range: {name1} - {name2}")
                    i += 2
                    continue
                
                i += 1
            
            logger.info(f"\n✅ TOPLAM {len(filters)} FİLTRE ÇIKARILDI")
            
            results.append({
                'name': test['name'],
                'category': test['category'],
                'url': test['url'],
                'filters': filters,
                'html_size': len(html),
                'selects_found': len(selects),
                'inputs_found': len(inputs)
            })
            
            # Rate limiting
            await asyncio.sleep(5)
            
        except Exception as e:
            logger.error(f"❌ Hata: {e}")
            import traceback
            traceback.print_exc()
    
    await browser.close()
    await playwright.stop()
    
    # Kaydet
    output_file = '/app/sahibinden_FINAL_RESULT.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # Özet
    total_filters = sum(len(r['filters']) for r in results)
    
    logger.info(f"\n{'='*70}")
    logger.info(f"💾 DOSYA: {output_file}")
    logger.info(f"{'='*70}")
    logger.info(f"\n📊 TOPLAM SONUÇ:")
    logger.info(f"   • Test Edilen: {len(results)} sayfa")
    logger.info(f"   • Çekilen Filtre: {total_filters}")
    
    if total_filters > 0:
        logger.info(f"\n✅ BAŞARILI! {total_filters} FİLTRE ÇEKİLDİ!")
        return True
    else:
        logger.info(f"\n❌ FİLTRE ÇEKİLEMEDİ!")
        return False


if __name__ == '__main__':
    try:
        from bs4 import BeautifulSoup
    except:
        import subprocess
        subprocess.run(['pip', 'install', 'beautifulsoup4', 'lxml', '-q'])
    
    result = asyncio.run(scrape_with_max_stealth())
    exit(0 if result else 1)
