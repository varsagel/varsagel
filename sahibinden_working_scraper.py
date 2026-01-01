#!/usr/bin/env python3
"""
SAHİBİNDEN.COM PROFESYONEL SCRAPER
Anti-bot bypass, Cloudflare geçişli, tam çalışır sistem
"""

import json
import asyncio
import random
import time
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

class SahibindenProScraper:
    def __init__(self):
        self.base_url = "https://www.sahibinden.com"
        self.data = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'categories': []
        }
        
        # Manuel kategori yapısı (bilinen URL'ler)
        self.categories = {
            'emlak': {
                'name': 'Emlak',
                'subs': {
                    'satilik-daire': 'Satılık Daire',
                    'kiralik-daire': 'Kiralık Daire',
                    'satilik-arsa': 'Satılık Arsa',
                    'satilik-villa': 'Satılık Villa',
                    'satilik-isyeri': 'Satılık İşyeri'
                }
            },
            'vasita': {
                'name': 'Vasıta',
                'subs': {
                    'otomobil': 'Otomobil',
                    'arazi-suv-pickup': 'Arazi SUV Pickup',
                    'motosiklet': 'Motosiklet'
                }
            }
        }
    
    async def create_stealth_browser(self):
        """Anti-bot korumalı browser"""
        playwright = await async_playwright().start()
        
        browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ]
        )
        
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080},
            locale='tr-TR',
            timezone_id='Europe/Istanbul',
        )
        
        # Anti-detection scripts
        await context.add_init_script("""
            // Webdriver hide
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            
            // Chrome runtime
            window.chrome = {runtime: {}};
            
            // Permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({state: Notification.permission}) :
                    originalQuery(parameters)
            );
            
            // Plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
        """)
        
        return playwright, browser, context
    
    async def fetch_page(self, page, url, wait_time=5):
        """Sayfa yükle - insan gibi davran"""
        try:
            # Random delay
            await asyncio.sleep(random.uniform(1, 3))
            
            logger.info(f"📄 {url}")
            
            # Sayfayı yükle
            response = await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            if response.status == 403:
                logger.warning("   ⚠️ 403 Cloudflare engeli - retry...")
                await asyncio.sleep(5)
                response = await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            # JavaScript yüklensin
            await page.wait_for_timeout(wait_time * 1000)
            
            # İnsan gibi scroll
            await page.evaluate('''
                window.scrollTo({
                    top: document.body.scrollHeight / 3,
                    behavior: 'smooth'
                });
            ''')
            await page.wait_for_timeout(1000)
            
            # HTML al
            html = await page.content()
            
            logger.info(f"   ✅ {len(html)} byte alındı")
            return html
            
        except Exception as e:
            logger.error(f"   ❌ Hata: {e}")
            return None
    
    def parse_filters_from_html(self, html):
        """HTML'den filtreleri parse et"""
        soup = BeautifulSoup(html, 'html.parser')
        filters = []
        
        # 1. SELECT FİLTRELERİ
        for select in soup.find_all('select')[:30]:
            try:
                name = select.get('name', '')
                select_id = select.get('id', '')
                
                # Label bul
                label_text = ""
                if select_id:
                    label = soup.find('label', {'for': select_id})
                    if label:
                        label_text = label.get_text(strip=True)
                
                if not label_text and name:
                    label_text = name.replace('_', ' ').replace('a', 'A', 1).title()
                
                # Options
                options = []
                for opt in select.find_all('option'):
                    text = opt.get_text(strip=True)
                    value = opt.get('value', '')
                    if text and value and text not in ['-', 'Seçiniz', '']:
                        options.append(text)
                
                if len(options) > 1:
                    filters.append({
                        'label': label_text or 'Select',
                        'key': name or select_id,
                        'type': 'select',
                        'options': options[:100]
                    })
                    
            except:
                continue
        
        # 2. INPUT NUMBER (Min-Max)
        inputs = soup.find_all('input', {'type': ['number', 'text']})
        
        i = 0
        while i < len(inputs) - 1:
            try:
                inp1 = inputs[i]
                inp2 = inputs[i + 1]
                
                name1 = inp1.get('name', '')
                name2 = inp2.get('name', '')
                
                if name1 and name2:
                    # Min-Max çifti
                    if ('min' in name1.lower() and 'max' in name2.lower()):
                        base_name = name1.replace('_min', '').replace('Min', '').replace('_', ' ').title()
                        
                        filters.append({
                            'label': base_name,
                            'type': 'range-number',
                            'minKey': name1,
                            'maxKey': name2
                        })
                        
                        i += 2
                        continue
            except:
                pass
            
            i += 1
        
        # 3. CHECKBOX GROUPS
        checkboxes = soup.find_all('input', {'type': 'checkbox'})
        checkbox_groups = {}
        
        for cb in checkboxes[:30]:
            try:
                name = cb.get('name', '')
                if not name:
                    continue
                
                cb_id = cb.get('id', '')
                if cb_id:
                    label = soup.find('label', {'for': cb_id})
                    if label:
                        label_text = label.get_text(strip=True)
                        
                        if name not in checkbox_groups:
                            checkbox_groups[name] = []
                        
                        checkbox_groups[name].append(label_text)
            except:
                continue
        
        for name, options in checkbox_groups.items():
            if len(options) > 0:
                filters.append({
                    'label': name.replace('_', ' ').title(),
                    'key': name,
                    'type': 'multiselect',
                    'options': options
                })
        
        return filters
    
    async def scrape_all(self):
        """TÜM KATEGORİLERİ ÇEKME"""
        logger.info("="*70)
        logger.info("🚀 SAHİBİNDEN.COM SCRAPING BAŞLIYOR")
        logger.info("="*70)
        
        playwright, browser, context = await self.create_stealth_browser()
        page = await context.new_page()
        
        try:
            for cat_slug, cat_data in self.categories.items():
                logger.info(f"\n{'='*70}")
                logger.info(f"📦 {cat_data['name']}")
                logger.info(f"{'='*70}")
                
                category_result = {
                    'name': cat_data['name'],
                    'slug': cat_slug,
                    'subcategories': []
                }
                
                for sub_slug, sub_name in cat_data['subs'].items():
                    logger.info(f"\n📂 {sub_name}")
                    
                    url = f"{self.base_url}/{sub_slug}"
                    
                    # Sayfayı çek
                    html = await self.fetch_page(page, url)
                    
                    if html:
                        # Filtreleri parse et
                        filters = self.parse_filters_from_html(html)
                        
                        logger.info(f"   📊 {len(filters)} filtre bulundu")
                        
                        category_result['subcategories'].append({
                            'name': sub_name,
                            'slug': sub_slug,
                            'url': url,
                            'filters': filters
                        })
                        
                        # Rate limiting
                        await asyncio.sleep(random.uniform(3, 6))
                
                self.data['categories'].append(category_result)
            
            logger.info(f"\n{'='*70}")
            logger.info("✅ SCRAPING TAMAMLANDI!")
            logger.info(f"{'='*70}")
            
        except Exception as e:
            logger.error(f"❌ Fatal error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            await browser.close()
            await playwright.stop()
        
        return self.data
    
    def save(self, filename='/app/sahibinden_SCRAPED.json'):
        """Kaydet ve istatistikler"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        
        total_subs = sum(len(c['subcategories']) for c in self.data['categories'])
        total_filters = sum(
            len(s['filters']) 
            for c in self.data['categories'] 
            for s in c['subcategories']
        )
        
        logger.info(f"\n💾 {filename}")
        logger.info(f"\n📊 SONUÇ:")
        logger.info(f"   ✓ Kategori: {len(self.data['categories'])}")
        logger.info(f"   ✓ Alt Kategori: {total_subs}")
        logger.info(f"   ✓ Filtre: {total_filters}")
        
        return total_filters > 0


async def main():
    # BeautifulSoup4 kur
    try:
        from bs4 import BeautifulSoup
    except:
        import subprocess
        subprocess.run(['pip', 'install', 'beautifulsoup4', 'lxml', '-q'])
    
    scraper = SahibindenProScraper()
    await scraper.scrape_all()
    success = scraper.save()
    
    if success:
        logger.info("\n✅ VERİ ÇEKİMİ BAŞARILI!")
    else:
        logger.error("\n❌ VERİ ÇEKİLEMEDİ!")
    
    return success


if __name__ == '__main__':
    result = asyncio.run(main())
    exit(0 if result else 1)
