#!/usr/bin/env python3
"""
SAHİBİNDEN.COM ULTIMATE SCRAPER v2
- Uzun bekleme süreleri
- React/AJAX render beklemeli  
- Screenshot debug
- Gerçek selector'lar
"""

import json
import asyncio
import time
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

async def scrape_sahibinden():
    """Main scraper"""
    logger.info("🚀 BAŞLIYOR...\n")
    
    playwright = await async_playwright().start()
    browser = await playwright.chromium.launch(headless=True)
    context = await browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        viewport={'width': 1920, 'height': 1080}
    )
    
    page = await context.new_page()
    
    results = []
    
    # Test URL'leri
    test_urls = [
        ('Satılık Daire', 'https://www.sahibinden.com/satilik-daire'),
        ('Otomobil', 'https://www.sahibinden.com/otomobil'),
    ]
    
    for name, url in test_urls:
        logger.info(f"\n{'='*60}")
        logger.info(f"📂 {name}")
        logger.info(f"🔗 {url}")
        logger.info(f"{'='*60}")
        
        try:
            # Sayfayı yükle
            await page.goto(url, wait_until='networkidle', timeout=30000)
            logger.info("✓ Sayfa yüklendi")
            
            # REACT render için uzun bekle
            await page.wait_for_timeout(8000)
            logger.info("✓ 8 saniye beklendi")
            
            # Screenshot
            screenshot_path = f'/tmp/{name.replace(" ", "_")}.png'
            await page.screenshot(path=screenshot_path, full_page=True)
            logger.info(f"✓ Screenshot: {screenshot_path}")
            
            # HTML al
            html = await page.content()
            logger.info(f"✓ HTML: {len(html):,} karakter")
            
            # Parse
            soup = BeautifulSoup(html, 'html.parser')
            
            # Select'leri bul
            selects = soup.find_all('select')
            logger.info(f"\n📋 {len(selects)} SELECT bulundu")
            
            filters = []
            for i, sel in enumerate(selects[:10]):
                name_attr = sel.get('name', '')
                id_attr = sel.get('id', '')
                
                options = [opt.get_text(strip=True) for opt in sel.find_all('option')]
                options = [o for o in options if o and o != '-']
                
                logger.info(f"   {i+1}. name='{name_attr}' id='{id_attr}' → {len(options)} options")
                
                if len(options) > 0:
                    filters.append({
                        'name': name_attr or id_attr,
                        'options': options[:20]
                    })
            
            # Form elementleri
            inputs = soup.find_all('input')
            logger.info(f"\n📋 {len(inputs)} INPUT bulundu")
            
            input_types = {}
            for inp in inputs:
                inp_type = inp.get('type', 'text')
                input_types[inp_type] = input_types.get(inp_type, 0) + 1
            
            for t, count in input_types.items():
                logger.info(f"   {t}: {count}")
            
            # Tüm form elementlerini logla
            forms = soup.find_all('form')
            logger.info(f"\n📋 {len(forms)} FORM bulundu")
            
            results.append({
                'name': name,
                'url': url,
                'selects': len(selects),
                'inputs': len(inputs),
                'forms': len(forms),
                'filters': filters
            })
            
        except Exception as e:
            logger.error(f"❌ {e}")
    
    await browser.close()
    await playwright.stop()
    
    # Kaydet
    with open('/app/sahibinden_DEBUG.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    logger.info(f"\n{'='*60}")
    logger.info("💾 /app/sahibinden_DEBUG.json")
    logger.info(f"{'='*60}\n")
    
    # Özet
    total_filters = sum(len(r['filters']) for r in results)
    logger.info(f"📊 TOPLAM {total_filters} FİLTRE BULUNDU")
    
    return results

if __name__ == '__main__':
    asyncio.run(scrape_sahibinden())
