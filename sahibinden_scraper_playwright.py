#!/usr/bin/env python3
"""
Sahibinden.com Kategori ve Filtre Çekme Botu (Playwright)
Tüm kategorileri, alt kategorileri ve filtre seçeneklerini otomatik çeker
"""

import json
import time
import asyncio
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import logging

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SahibindenScraper:
    def __init__(self):
        self.data = {
            'categories': [],
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
    
    async def scrape_page(self, page, url):
        """Sayfayı yükle"""
        try:
            await page.goto(url, wait_until='domcontentloaded', timeout=15000)
            await page.wait_for_timeout(2000)
            return True
        except Exception as e:
            logger.error(f"Sayfa yüklenemedi {url}: {e}")
            return False
    
    async def get_main_categories(self, page):
        """Ana kategorileri çek"""
        logger.info("🔍 Ana kategoriler alınıyor...")
        
        # Sahibinden ana sayfaya git
        await self.scrape_page(page, "https://www.sahibinden.com/kategori")
        
        categories = []
        
        # Tüm linkleri al
        links = await page.query_selector_all('a[href]')
        
        category_keywords = ['emlak', 'vasita', 'yedek-parca', 'alisveris', 'is-makineleri', 
                            'ustalar', 'ozel-ders', 'is-ilanlari', 'hayvanlar']
        
        for link in links[:200]:  # İlk 200 linki kontrol et
            href = await link.get_attribute('href')
            text = await link.text_content()
            
            if href and text:
                text = text.strip()
                # Kategori linki mi kontrol et
                if any(f'/{keyword}' in href for keyword in category_keywords):
                    full_url = href if href.startswith('http') else f"https://www.sahibinden.com{href}"
                    
                    categories.append({
                        'name': text,
                        'url': full_url,
                        'slug': self.extract_slug(href)
                    })
        
        # Tekrarları temizle
        unique = {}
        for cat in categories:
            if cat['slug'] and cat['slug'] not in unique and len(cat['name']) > 2:
                unique[cat['slug']] = cat
        
        result = list(unique.values())
        logger.info(f"✅ {len(result)} ana kategori bulundu: {[c['name'] for c in result[:5]]}")
        return result
    
    async def get_subcategories_from_page(self, page, category_url, category_slug):
        """Bir kategorinin alt kategorilerini çek"""
        logger.info(f"🔍 Alt kategoriler alınıyor: {category_slug}")
        
        await self.scrape_page(page, category_url)
        
        subcategories = []
        
        # Alt kategori linklerini bul
        links = await page.query_selector_all('a[href]')
        
        for link in links[:100]:
            href = await link.get_attribute('href')
            text = await link.text_content()
            
            if href and text and category_slug in href:
                text = text.strip()
                if len(text) > 2 and '/' in href:
                    full_url = href if href.startswith('http') else f"https://www.sahibinden.com{href}"
                    
                    subcategories.append({
                        'name': text,
                        'url': full_url,
                        'slug': self.extract_slug(href)
                    })
        
        # Tekrarları temizle
        unique = {}
        for sub in subcategories:
            key = sub['slug']
            if key and key != category_slug and key not in unique:
                unique[key] = sub
        
        result = list(unique.values())
        logger.info(f"✅ {len(result)} alt kategori bulundu")
        return result[:15]  # İlk 15 alt kategori
    
    async def get_filters_from_page(self, page, url):
        """Sayfadaki filtreleri çek"""
        logger.info(f"🔍 Filtreler alınıyor...")
        
        await self.scrape_page(page, url)
        
        filters = []
        
        try:
            # Filtre containerlarını bul
            filter_sections = await page.query_selector_all('.searchFilterContainer, .filter, [class*="filter"]')
            
            logger.info(f"   {len(filter_sections)} filtre bölümü bulundu")
            
            for section in filter_sections[:30]:  # İlk 30 filtre
                try:
                    # Label bul
                    label_elem = await section.query_selector('label, .filter-label, h3, strong, legend')
                    if not label_elem:
                        continue
                    
                    label = await label_elem.text_content()
                    label = label.strip()
                    
                    if not label or len(label) < 2:
                        continue
                    
                    filter_data = {
                        'label': label,
                        'type': 'select',
                        'options': []
                    }
                    
                    # Select/dropdown kontrol et
                    select = await section.query_selector('select')
                    if select:
                        options = await select.query_selector_all('option')
                        for opt in options:
                            text = await opt.text_content()
                            if text and text.strip():
                                filter_data['options'].append(text.strip())
                    
                    # Checkbox kontrol et
                    checkboxes = await section.query_selector_all('input[type="checkbox"]')
                    if checkboxes:
                        filter_data['type'] = 'multiselect'
                        labels = await section.query_selector_all('label')
                        for lbl in labels:
                            text = await lbl.text_content()
                            if text and text.strip() and text.strip() != label:
                                filter_data['options'].append(text.strip())
                    
                    # Input kontrol et
                    inputs = await section.query_selector_all('input[type="number"], input[type="text"]')
                    if len(inputs) >= 2:
                        filter_data['type'] = 'range-number'
                    elif len(inputs) == 1:
                        filter_data['type'] = 'number'
                    
                    # Eğer filtre verisi varsa ekle
                    if filter_data['options'] or filter_data['type'] in ['number', 'range-number']:
                        filters.append(filter_data)
                
                except Exception as e:
                    continue
            
            logger.info(f"✅ {len(filters)} filtre bulundu")
            
        except Exception as e:
            logger.error(f"Filtre çekme hatası: {e}")
        
        return filters
    
    def extract_slug(self, url):
        """URL'den slug çıkar"""
        if not url:
            return ""
        parts = url.rstrip('/').split('/')
        return parts[-1] if parts else ""
    
    async def run(self, max_categories=3, max_subcategories=2):
        """Ana scraping fonksiyonu"""
        logger.info("🚀 Sahibinden.com scraping başlıyor...\n")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                # Ana kategorileri al
                main_categories = await self.get_main_categories(page)
                
                if not main_categories:
                    logger.warning("⚠️  Kategori bulunamadı, manuel liste kullanılıyor...")
                    main_categories = [
                        {'name': 'Emlak', 'url': 'https://www.sahibinden.com/emlak', 'slug': 'emlak'},
                        {'name': 'Vasıta', 'url': 'https://www.sahibinden.com/vasita', 'slug': 'vasita'},
                        {'name': 'Yedek Parça', 'url': 'https://www.sahibinden.com/yedek-parca-aksesuar', 'slug': 'yedek-parca'},
                    ]
                
                # Her kategori için işlem yap
                for i, category in enumerate(main_categories[:max_categories]):
                    logger.info(f"\n{'='*60}")
                    logger.info(f"📦 [{i+1}/{min(len(main_categories), max_categories)}] {category['name']}")
                    logger.info(f"{'='*60}")
                    
                    category_data = {
                        'name': category['name'],
                        'slug': category['slug'],
                        'url': category['url'],
                        'subcategories': []
                    }
                    
                    # Alt kategorileri al
                    subcategories = await self.get_subcategories_from_page(page, category['url'], category['slug'])
                    
                    for j, subcategory in enumerate(subcategories[:max_subcategories]):
                        logger.info(f"\n  📂 [{j+1}/{min(len(subcategories), max_subcategories)}] {subcategory['name']}")
                        
                        # Filtreleri al
                        filters = await self.get_filters_from_page(page, subcategory['url'])
                        
                        subcategory_data = {
                            'name': subcategory['name'],
                            'slug': subcategory['slug'],
                            'url': subcategory['url'],
                            'filters': filters
                        }
                        
                        category_data['subcategories'].append(subcategory_data)
                        
                        await page.wait_for_timeout(1500)
                    
                    self.data['categories'].append(category_data)
                    await page.wait_for_timeout(2000)
                
                logger.info(f"\n{'='*60}")
                logger.info("✅ Scraping tamamlandı!")
                logger.info(f"{'='*60}\n")
                
            finally:
                await browser.close()
        
        return self.data
    
    def save_to_file(self, filename='sahibinden_scraped_full.json'):
        """JSON olarak kaydet"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        
        # İstatistikler
        total_subs = sum(len(cat['subcategories']) for cat in self.data['categories'])
        total_filters = sum(
            len(sub['filters']) 
            for cat in self.data['categories'] 
            for sub in cat['subcategories']
        )
        
        logger.info(f"💾 Veri kaydedildi: {filename}")
        logger.info(f"\n📈 İSTATİSTİKLER:")
        logger.info(f"   • Ana Kategori: {len(self.data['categories'])}")
        logger.info(f"   • Alt Kategori: {total_subs}")
        logger.info(f"   • Toplam Filtre: {total_filters}\n")


async def main():
    scraper = SahibindenScraper()
    
    try:
        # 3 kategori, her kategoriden 2 alt kategori
        await scraper.run(max_categories=3, max_subcategories=2)
        scraper.save_to_file('/app/sahibinden_scraped_full.json')
        
    except KeyboardInterrupt:
        logger.warning("\n⚠️  Durduruldu")
    except Exception as e:
        logger.error(f"\n❌ Hata: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    asyncio.run(main())
