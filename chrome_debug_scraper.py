#!/usr/bin/env python3
"""
SAHİBİNDEN.COM CHROME DEBUG SCRAPER
Chrome'u remote debugging modunda başlatır ve bağlanır
Bot tespitinden kaçınır
"""

import json
import asyncio
import subprocess
import time
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

class ChromeDebugScraper:
    def __init__(self):
        self.debug_port = 9222
        self.chrome_process = None
        self.data = {
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'categories': []
        }
    
    def start_chrome_debug(self):
        """Chrome'u debug modunda başlat"""
        logger.info("🚀 Chrome debug mode başlatılıyor...")
        
        # Eski Chrome'u kapat
        subprocess.run(['pkill', '-9', 'chrome'], stderr=subprocess.DEVNULL)
        time.sleep(2)
        
        # Chrome debug komutu
        chrome_cmd = [
            'google-chrome',
            '--remote-debugging-port=9222',
            '--no-first-run',
            '--no-default-browser-check',
            '--user-data-dir=/tmp/chrome-debug-profile',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            'about:blank'
        ]
        
        try:
            self.chrome_process = subprocess.Popen(
                chrome_cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            logger.info(f"✅ Chrome başlatıldı (PID: {self.chrome_process.pid})")
            logger.info(f"🔗 Debug port: {self.debug_port}")
            time.sleep(5)
            return True
        except FileNotFoundError:
            logger.error("❌ google-chrome bulunamadı!")
            # Chromium dene
            try:
                chrome_cmd[0] = 'chromium-browser'
                self.chrome_process = subprocess.Popen(
                    chrome_cmd,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                logger.info(f"✅ Chromium başlatıldı (PID: {self.chrome_process.pid})")
                time.sleep(5)
                return True
            except:
                logger.error("❌ Chromium da bulunamadı!")
                return False
    
    def stop_chrome(self):
        """Chrome'u kapat"""
        if self.chrome_process:
            self.chrome_process.terminate()
            self.chrome_process.wait(timeout=5)
            logger.info("🔒 Chrome kapatıldı")
    
    async def connect_to_chrome(self):
        """Debug modundaki Chrome'a bağlan"""
        logger.info("🔌 Chrome'a bağlanılıyor...")
        
        playwright = await async_playwright().start()
        
        try:
            browser = await playwright.chromium.connect_over_cdp(
                f'http://localhost:{self.debug_port}'
            )
            logger.info("✅ Chrome'a bağlandı!")
            
            # Mevcut context'i al
            contexts = browser.contexts
            if contexts:
                context = contexts[0]
            else:
                context = await browser.new_context()
            
            return playwright, browser, context
            
        except Exception as e:
            logger.error(f"❌ Bağlantı hatası: {e}")
            await playwright.stop()
            return None, None, None
    
    async def scrape_page(self, page, url):
        """Bir sayfayı scrape et"""
        logger.info(f"\n📄 {url}")
        
        try:
            # Sayfaya git
            await page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            # JavaScript yüklensin
            await page.wait_for_timeout(5000)
            
            # Scroll
            await page.evaluate('window.scrollTo(0, 500)')
            await page.wait_for_timeout(2000)
            
            # HTML al
            html = await page.content()
            logger.info(f"   ✅ {len(html):,} karakter alındı")
            
            # Parse
            soup = BeautifulSoup(html, 'html.parser')
            
            filters = []
            
            # SELECT elementleri
            selects = soup.find_all('select')
            logger.info(f"   📋 {len(selects)} select bulundu")
            
            for select in selects[:30]:
                try:
                    name = select.get('name', '')
                    select_id = select.get('id', '')
                    
                    # Label bul
                    label_text = ""
                    if select_id:
                        label = soup.find('label', {'for': select_id})
                        if label:
                            label_text = label.get_text(strip=True)
                    
                    if not label_text:
                        # Parent'tan label bul
                        parent = select.find_parent(['div', 'td', 'li'])
                        if parent:
                            label_elem = parent.find(['label', 'strong', 'b'])
                            if label_elem:
                                label_text = label_elem.get_text(strip=True)
                    
                    # Options
                    options = []
                    for opt in select.find_all('option'):
                        text = opt.get_text(strip=True)
                        value = opt.get('value', '')
                        if text and value and text not in ['-', 'Seçiniz', '']:
                            options.append(text)
                    
                    if len(options) > 1:
                        filters.append({
                            'label': label_text or name or select_id or 'Select',
                            'key': name or select_id,
                            'type': 'select',
                            'options': options[:100]
                        })
                        
                except:
                    continue
            
            # NUMBER inputs (min-max)
            inputs = soup.find_all('input', {'type': ['number', 'text']})
            logger.info(f"   📋 {len(inputs)} input bulundu")
            
            i = 0
            while i < len(inputs) - 1:
                try:
                    inp1 = inputs[i]
                    inp2 = inputs[i + 1]
                    
                    name1 = inp1.get('name', '')
                    name2 = inp2.get('name', '')
                    
                    if name1 and name2:
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
            
            # CHECKBOX
            checkboxes = soup.find_all('input', {'type': 'checkbox'})
            logger.info(f"   📋 {len(checkboxes)} checkbox bulundu")
            
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
            
            logger.info(f"   ✅ {len(filters)} filtre çıkarıldı")
            
            return filters
            
        except Exception as e:
            logger.error(f"   ❌ Hata: {e}")
            return []
    
    async def scrape_categories(self):
        """Kategorileri scrape et"""
        
        # Chrome'u başlat
        if not self.start_chrome_debug():
            logger.error("❌ Chrome başlatılamadı!")
            return
        
        # Bağlan
        playwright, browser, context = await self.connect_to_chrome()
        
        if not browser:
            self.stop_chrome()
            return
        
        # Yeni sayfa aç veya mevcut sayfayı kullan
        pages = context.pages
        if pages:
            page = pages[0]
        else:
            page = await context.new_page()
        
        logger.info(f"\n{'='*70}")
        logger.info("🚀 SCRAPING BAŞLIYOR")
        logger.info(f"{'='*70}")
        
        # Test kategorileri
        categories = {
            'emlak': {
                'name': 'Emlak',
                'subs': {
                    'satilik-daire': 'Satılık Daire',
                    'kiralik-daire': 'Kiralık Daire',
                    'satilik-arsa': 'Satılık Arsa',
                }
            },
            'vasita': {
                'name': 'Vasıta',
                'subs': {
                    'otomobil': 'Otomobil',
                    'motosiklet': 'Motosiklet',
                }
            }
        }
        
        try:
            for cat_slug, cat_data in categories.items():
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
                    
                    url = f"https://www.sahibinden.com/{sub_slug}"
                    
                    filters = await self.scrape_page(page, url)
                    
                    category_result['subcategories'].append({
                        'name': sub_name,
                        'slug': sub_slug,
                        'url': url,
                        'filters': filters
                    })
                    
                    # Rate limiting
                    await asyncio.sleep(3)
                
                self.data['categories'].append(category_result)
        
        finally:
            await browser.close()
            await playwright.stop()
            self.stop_chrome()
    
    def save(self, filename='/app/sahibinden_CHROME_DEBUG.json'):
        """Kaydet"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        
        # İstatistikler
        total_subs = sum(len(c['subcategories']) for c in self.data['categories'])
        total_filters = sum(
            len(s['filters'])
            for c in self.data['categories']
            for s in c['subcategories']
        )
        
        logger.info(f"\n{'='*70}")
        logger.info(f"💾 {filename}")
        logger.info(f"{'='*70}")
        logger.info(f"\n📊 SONUÇ:")
        logger.info(f"   ✓ Kategori: {len(self.data['categories'])}")
        logger.info(f"   ✓ Alt Kategori: {total_subs}")
        logger.info(f"   ✓ Filtre: {total_filters}")
        
        if total_filters > 0:
            logger.info("\n✅ VERİ ÇEKİMİ BAŞARILI!")
            return True
        else:
            logger.info("\n⚠️ FİLTRE ÇEKİLEMEDİ!")
            return False


async def main():
    # BeautifulSoup
    try:
        from bs4 import BeautifulSoup
    except:
        import subprocess
        subprocess.run(['pip', 'install', 'beautifulsoup4', 'lxml', '-q'])
    
    scraper = ChromeDebugScraper()
    
    try:
        await scraper.scrape_categories()
        success = scraper.save()
        return success
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Kullanıcı durdurdu")
        scraper.stop_chrome()
        return False
    except Exception as e:
        logger.error(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        scraper.stop_chrome()
        return False


if __name__ == '__main__':
    result = asyncio.run(main())
    exit(0 if result else 1)
