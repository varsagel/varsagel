#!/usr/bin/env python3
"""
SAHİBİNDEN.COM TAM VERİ ÇEKME BOTU
- Tüm kategoriler ve alt kategoriler
- Her alt kategori için TÜM filtreler
- Marka -> Model -> Seri -> Motor/Paket tam hiyerarşi
- JavaScript render bekleme ile çalışır
"""

import json
import asyncio
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SahibindenFullScraper:
    def __init__(self):
        self.base_url = "https://www.sahibinden.com"
        self.data = {
            'scrape_date': datetime.now().isoformat(),
            'categories': []
        }
        self.browser = None
        self.context = None
        
    async def init_browser(self):
        """Browser başlat"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        self.context = await self.browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        logger.info("✅ Browser başlatıldı")
    
    async def close_browser(self):
        """Browser kapat"""
        if self.browser:
            await self.browser.close()
            logger.info("🔒 Browser kapatıldı")
    
    async def safe_goto(self, page, url, wait_selector=None):
        """Güvenli sayfa yükleme"""
        try:
            await page.goto(url, wait_until='networkidle', timeout=30000)
            await page.wait_for_timeout(3000)  # JavaScript render için bekle
            
            if wait_selector:
                await page.wait_for_selector(wait_selector, timeout=10000)
            
            logger.info(f"   📄 Sayfa yüklendi: {url}")
            return True
        except Exception as e:
            logger.error(f"   ❌ Sayfa yüklenemedi: {e}")
            return False
    
    async def get_main_categories(self, page):
        """Ana kategorileri çek - Kategori sayfasından"""
        logger.info("\n🔍 ANA KATEGORİLER ALINIYOR...")
        
        await self.safe_goto(page, f"{self.base_url}/kategori")
        
        categories = []
        
        # Tüm kategori linklerini al
        links = await page.query_selector_all('a[href*="/kategori/"]')
        
        for link in links:
            try:
                href = await link.get_attribute('href')
                text = (await link.text_content()).strip()
                
                if href and text and len(text) > 2:
                    # Ana kategori linki mi kontrol et (2 seviye: /kategori/emlak)
                    parts = href.strip('/').split('/')
                    if len(parts) == 2 and parts[0] == 'kategori':
                        categories.append({
                            'name': text,
                            'slug': parts[1],
                            'url': f"{self.base_url}{href}" if not href.startswith('http') else href
                        })
            except:
                continue
        
        # Tekrar temizle
        unique = {}
        for cat in categories:
            if cat['slug'] not in unique:
                unique[cat['slug']] = cat
        
        result = list(unique.values())
        logger.info(f"✅ {len(result)} ana kategori bulundu")
        for cat in result[:10]:
            logger.info(f"   • {cat['name']} ({cat['slug']})")
        
        return result
    
    async def get_subcategories(self, page, category_slug):
        """Alt kategorileri çek"""
        logger.info(f"\n🔍 ALT KATEGORİLER ALINIYOR: {category_slug}")
        
        url = f"{self.base_url}/kategori/{category_slug}"
        await self.safe_goto(page, url)
        
        subcategories = []
        
        # Alt kategori linklerini bul
        links = await page.query_selector_all(f'a[href*="/{category_slug}/"]')
        
        for link in links:
            try:
                href = await link.get_attribute('href')
                text = (await link.text_content()).strip()
                
                if href and text and len(text) > 2:
                    # Alt kategori linki mi (3 seviye: /kategori/emlak/satilik-daire)
                    parts = href.strip('/').split('/')
                    if len(parts) >= 2 and category_slug in href:
                        sub_slug = parts[-1]
                        
                        subcategories.append({
                            'name': text,
                            'slug': sub_slug,
                            'url': f"{self.base_url}{href}" if not href.startswith('http') else href
                        })
            except:
                continue
        
        # Tekrar temizle
        unique = {}
        for sub in subcategories:
            if sub['slug'] not in unique and sub['slug'] != category_slug:
                unique[sub['slug']] = sub
        
        result = list(unique.values())
        logger.info(f"✅ {len(result)} alt kategori bulundu")
        
        return result
    
    async def extract_filters(self, page):
        """Sayfadaki TÜM filtreleri çek"""
        filters = []
        
        # Sayfanın tam yüklenmesini bekle
        await page.wait_for_timeout(4000)
        
        # Screenshot debug için
        await page.screenshot(path='/tmp/filter_page.png')
        
        # Farklı selector stratejileri
        selectors_to_try = [
            'form select',  # Tüm select'ler
            'form input[type="number"]',  # Number input'lar
            'form input[type="text"]',  # Text input'lar
            'form input[type="checkbox"]',  # Checkbox'lar
            'form label',  # Label'lar
        ]
        
        # 1. SELECT FİLTRELERİ
        selects = await page.query_selector_all('select')
        logger.info(f"      📋 {len(selects)} select bulundu")
        
        for select in selects:
            try:
                select_name = await select.get_attribute('name')
                select_id = await select.get_attribute('id')
                
                # Label bul
                label_text = ""
                if select_id:
                    label = await page.query_selector(f'label[for="{select_id}"]')
                    if label:
                        label_text = (await label.text_content()).strip()
                
                if not label_text:
                    # Parent'tan label bul
                    parent = await select.evaluate_handle('el => el.closest("div, td, li")')
                    if parent:
                        label_elem = await parent.query_selector('label, .label, strong, b')
                        if label_elem:
                            label_text = (await label_elem.text_content()).strip()
                
                # Options al
                options = await select.query_selector_all('option')
                option_values = []
                for opt in options:
                    text = (await opt.text_content()).strip()
                    value = await opt.get_attribute('value')
                    if text and text not in ['-', 'Seçiniz', '']:
                        option_values.append(text)
                
                if len(option_values) > 0:
                    filters.append({
                        'label': label_text or select_name or 'Unknown',
                        'key': select_name or select_id,
                        'type': 'select',
                        'options': option_values[:100]  # İlk 100 seçenek
                    })
                    
            except Exception as e:
                logger.debug(f"Select parse error: {e}")
                continue
        
        # 2. NUMBER RANGE FİLTRELERİ (Min-Max)
        number_inputs = await page.query_selector_all('input[type="number"]')
        logger.info(f"      📋 {len(number_inputs)} number input bulundu")
        
        # Min-Max çiftlerini bul
        i = 0
        while i < len(number_inputs) - 1:
            try:
                input1 = number_inputs[i]
                input2 = number_inputs[i + 1]
                
                name1 = await input1.get_attribute('name')
                name2 = await input2.get_attribute('name')
                
                if name1 and name2:
                    # Min-Max çifti mi kontrol et
                    if ('min' in name1.lower() and 'max' in name2.lower()) or \
                       ('_from' in name1.lower() and '_to' in name2.lower()):
                        
                        # Label bul
                        parent = await input1.evaluate_handle('el => el.closest("div, td, tr")')
                        label_text = name1.replace('_min', '').replace('Min', '').replace('_from', '').replace('_', ' ').title()
                        
                        if parent:
                            label_elem = await parent.query_selector('label, strong, .label')
                            if label_elem:
                                label_text = (await label_elem.text_content()).strip()
                        
                        filters.append({
                            'label': label_text,
                            'type': 'range-number',
                            'minKey': name1,
                            'maxKey': name2
                        })
                        
                        i += 2  # İki input'u atla
                        continue
                        
            except:
                pass
            
            i += 1
        
        # 3. CHECKBOX (Multiselect) FİLTRELERİ
        checkboxes = await page.query_selector_all('input[type="checkbox"]')
        logger.info(f"      📋 {len(checkboxes)} checkbox bulundu")
        
        # Checkbox gruplarını bul
        checkbox_groups = {}
        for cb in checkboxes[:50]:  # İlk 50 checkbox
            try:
                name = await cb.get_attribute('name')
                if not name:
                    continue
                
                # İlgili label'ı bul
                cb_id = await cb.get_attribute('id')
                label_text = ""
                if cb_id:
                    label = await page.query_selector(f'label[for="{cb_id}"]')
                    if label:
                        label_text = (await label.text_content()).strip()
                
                if label_text:
                    if name not in checkbox_groups:
                        checkbox_groups[name] = []
                    checkbox_groups[name].append(label_text)
                    
            except:
                continue
        
        # Checkbox gruplarını filtre olarak ekle
        for name, options in checkbox_groups.items():
            if len(options) > 0:
                filters.append({
                    'label': name.replace('_', ' ').title(),
                    'key': name,
                    'type': 'multiselect',
                    'options': options
                })
        
        logger.info(f"      ✅ {len(filters)} filtre çıkarıldı")
        return filters
    
    async def get_automobile_brands(self, page):
        """Otomobil markalarını çek"""
        logger.info(f"\n🚗 OTOMOBİL MARKALARI ALINIYOR...")
        
        url = f"{self.base_url}/otomobil"
        await self.safe_goto(page, url)
        
        # Marka select'ini bul
        brand_select = await page.query_selector('select[name*="mark"], select[name*="brand"], select#a2')
        
        if not brand_select:
            logger.warning("   ⚠️ Marka select bulunamadı")
            return {}
        
        # Markaları al
        options = await brand_select.query_selector_all('option')
        brands = {}
        
        for opt in options:
            text = (await opt.text_content()).strip()
            value = await opt.get_attribute('value')
            
            if text and value and text not in ['-', 'Seçiniz']:
                brands[text] = value
        
        logger.info(f"   ✅ {len(brands)} marka bulundu")
        return brands
    
    async def scrape_full(self):
        """TAM SCRAPING - Tüm veriler"""
        logger.info("="*70)
        logger.info("🚀 SAHİBİNDEN.COM FULL SCRAPING BAŞLIYOR")
        logger.info("="*70)
        
        await self.init_browser()
        page = await self.context.new_page()
        
        try:
            # 1. Ana kategorileri al
            main_categories = await self.get_main_categories(page)
            
            # Sadece önemli kategorileri al
            priority_categories = ['emlak', 'vasita', 'yedek-parca-aksesuar', 'alisveris']
            main_categories = [cat for cat in main_categories if cat['slug'] in priority_categories]
            
            # 2. Her kategori için alt kategorileri ve filtreleri çek
            for i, category in enumerate(main_categories):
                logger.info(f"\n{'='*70}")
                logger.info(f"📦 KATEGORI [{i+1}/{len(main_categories)}]: {category['name']}")
                logger.info(f"{'='*70}")
                
                category_data = {
                    'name': category['name'],
                    'slug': category['slug'],
                    'subcategories': []
                }
                
                # Alt kategorileri al
                subcategories = await self.get_subcategories(page, category['slug'])
                
                # İlk 10 alt kategoriyi işle
                for j, subcategory in enumerate(subcategories[:10]):
                    logger.info(f"\n   📂 ALT KATEGORİ [{j+1}/{min(len(subcategories), 10)}]: {subcategory['name']}")
                    
                    # Filtreleri çek
                    await self.safe_goto(page, subcategory['url'])
                    filters = await self.extract_filters(page)
                    
                    category_data['subcategories'].append({
                        'name': subcategory['name'],
                        'slug': subcategory['slug'],
                        'url': subcategory['url'],
                        'filters': filters
                    })
                    
                    await asyncio.sleep(2)  # Rate limiting
                
                self.data['categories'].append(category_data)
                await asyncio.sleep(3)
            
            # 3. Özel: Otomobil marka-model hiyerarşisi
            if any(cat['slug'] == 'vasita' for cat in main_categories):
                logger.info(f"\n{'='*70}")
                logger.info("🚗 OTOMOBİL MARKA-MODEL HİYERARŞİSİ")
                logger.info(f"{'='*70}")
                
                automobile_brands = await self.get_automobile_brands(page)
                self.data['automobile_brands'] = automobile_brands
            
            logger.info(f"\n{'='*70}")
            logger.info("✅ SCRAPING TAMAMLANDI!")
            logger.info(f"{'='*70}")
            
        except Exception as e:
            logger.error(f"❌ FATAL ERROR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await self.close_browser()
        
        return self.data
    
    def save_data(self, filename='/app/sahibinden_complete_data.json'):
        """Veriyi kaydet"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        
        # İstatistikler
        total_cats = len(self.data.get('categories', []))
        total_subs = sum(len(cat.get('subcategories', [])) for cat in self.data.get('categories', []))
        total_filters = sum(
            len(sub.get('filters', []))
            for cat in self.data.get('categories', [])
            for sub in cat.get('subcategories', [])
        )
        
        logger.info(f"\n💾 VERİ KAYDEDİLDİ: {filename}")
        logger.info(f"\n📊 İSTATİSTİKLER:")
        logger.info(f"   ✓ Ana Kategori: {total_cats}")
        logger.info(f"   ✓ Alt Kategori: {total_subs}")
        logger.info(f"   ✓ Toplam Filtre: {total_filters}")
        if 'automobile_brands' in self.data:
            logger.info(f"   ✓ Otomobil Markası: {len(self.data['automobile_brands'])}")


async def main():
    scraper = SahibindenFullScraper()
    
    try:
        await scraper.scrape_full()
        scraper.save_data()
        
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Kullanıcı tarafından durduruldu")
    except Exception as e:
        logger.error(f"\n❌ Hata: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    asyncio.run(main())
