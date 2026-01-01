#!/usr/bin/env python3
"""
Sahibinden.com Kategori ve Filtre Çekme Botu
Tüm kategorileri, alt kategorileri ve filtre seçeneklerini otomatik çeker
"""

import json
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SahibindenScraper:
    def __init__(self):
        """Chrome driver'ı başlat"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Arka planda çalış
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        self.data = {
            'categories': [],
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def get_main_categories(self):
        """Ana kategorileri çek"""
        logger.info("Ana kategoriler alınıyor...")
        
        try:
            self.driver.get("https://www.sahibinden.com")
            time.sleep(2)
            
            # Ana kategori menüsünü bul
            category_sections = self.driver.find_elements(By.CSS_SELECTOR, ".category-list, .categories, [class*='category']")
            
            logger.info(f"Bulunan kategori bölümü sayısı: {len(category_sections)}")
            
            # Alternatif: Doğrudan linkleri bul
            all_links = self.driver.find_elements(By.TAG_NAME, "a")
            
            categories = []
            category_keywords = ['emlak', 'vasita', 'yedek-parca', 'alisveris', 'is-makineleri', 
                                'ustalar', 'ozel-ders', 'is-ilanlari', 'yardimci', 'hayvanlar']
            
            for link in all_links:
                href = link.get_attribute('href')
                text = link.text.strip()
                
                if href and any(keyword in href for keyword in category_keywords):
                    if text and len(text) > 2:
                        categories.append({
                            'name': text,
                            'url': href,
                            'slug': self.extract_slug(href)
                        })
            
            # Tekrarları temizle
            unique_categories = {}
            for cat in categories:
                if cat['slug'] not in unique_categories:
                    unique_categories[cat['slug']] = cat
            
            logger.info(f"✅ {len(unique_categories)} ana kategori bulundu")
            return list(unique_categories.values())
            
        except Exception as e:
            logger.error(f"❌ Ana kategori alınamadı: {e}")
            return []
    
    def get_subcategories(self, category_url):
        """Bir kategorinin alt kategorilerini çek"""
        logger.info(f"Alt kategoriler alınıyor: {category_url}")
        
        try:
            self.driver.get(category_url)
            time.sleep(2)
            
            subcategories = []
            
            # Alt kategori linklerini bul
            links = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/']")
            
            for link in links:
                href = link.get_attribute('href')
                text = link.text.strip()
                
                if href and text and category_url in href and href != category_url:
                    subcategories.append({
                        'name': text,
                        'url': href,
                        'slug': self.extract_slug(href)
                    })
            
            # Tekrarları temizle
            unique_subs = {}
            for sub in subcategories:
                if sub['slug'] not in unique_subs and sub['name']:
                    unique_subs[sub['slug']] = sub
            
            logger.info(f"✅ {len(unique_subs)} alt kategori bulundu")
            return list(unique_subs.values())[:20]  # İlk 20 alt kategori
            
        except Exception as e:
            logger.error(f"❌ Alt kategori alınamadı: {e}")
            return []
    
    def get_filters(self, page_url):
        """Bir sayfadaki tüm filtreleri çek"""
        logger.info(f"Filtreler alınıyor: {page_url}")
        
        try:
            self.driver.get(page_url)
            time.sleep(3)
            
            filters = []
            
            # Farklı filtre tiplerini bul
            filter_containers = self.driver.find_elements(By.CSS_SELECTOR, 
                ".searchFilterContainer, .filter-item, [class*='filter'], .form-group")
            
            logger.info(f"Bulunan filtre container sayısı: {len(filter_containers)}")
            
            for container in filter_containers:
                try:
                    # Filtre başlığını bul
                    label = container.find_element(By.CSS_SELECTOR, "label, .filter-label, h3, strong").text.strip()
                    
                    if not label:
                        continue
                    
                    # Filtre tipini belirle
                    filter_data = {
                        'label': label,
                        'type': 'unknown',
                        'options': []
                    }
                    
                    # Select/dropdown mu?
                    selects = container.find_elements(By.TAG_NAME, "select")
                    if selects:
                        filter_data['type'] = 'select'
                        options = selects[0].find_elements(By.TAG_NAME, "option")
                        filter_data['options'] = [opt.text.strip() for opt in options if opt.text.strip()]
                    
                    # Checkbox mu?
                    checkboxes = container.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
                    if checkboxes:
                        filter_data['type'] = 'multiselect'
                        labels = container.find_elements(By.TAG_NAME, "label")
                        filter_data['options'] = [lbl.text.strip() for lbl in labels if lbl.text.strip()]
                    
                    # Input range mi?
                    inputs = container.find_elements(By.CSS_SELECTOR, "input[type='number'], input[type='text']")
                    if len(inputs) >= 2:
                        filter_data['type'] = 'range-number'
                        filter_data['minKey'] = 'min'
                        filter_data['maxKey'] = 'max'
                    elif len(inputs) == 1:
                        filter_data['type'] = 'number'
                    
                    if filter_data['label'] and (filter_data['options'] or filter_data['type'] in ['number', 'range-number']):
                        filters.append(filter_data)
                        
                except Exception as e:
                    continue
            
            logger.info(f"✅ {len(filters)} filtre bulundu")
            return filters
            
        except Exception as e:
            logger.error(f"❌ Filtre alınamadı: {e}")
            return []
    
    def extract_slug(self, url):
        """URL'den slug çıkar"""
        if not url:
            return ""
        
        # Son kısmı al
        parts = url.rstrip('/').split('/')
        return parts[-1] if parts else ""
    
    def scrape_all(self, max_categories=5, max_subcategories=3):
        """Tüm kategori ve filtreleri çek"""
        logger.info("🚀 Sahibinden.com scraping başlıyor...")
        
        # Ana kategorileri al
        main_categories = self.get_main_categories()
        
        if not main_categories:
            logger.warning("⚠️ Ana kategori bulunamadı, alternatif yöntem deneniyor...")
            # Manuel kategori listesi
            main_categories = [
                {'name': 'Emlak', 'url': 'https://www.sahibinden.com/emlak', 'slug': 'emlak'},
                {'name': 'Vasıta', 'url': 'https://www.sahibinden.com/vasita', 'slug': 'vasita'},
                {'name': 'Yedek Parça', 'url': 'https://www.sahibinden.com/yedek-parca', 'slug': 'yedek-parca'},
            ]
        
        for i, category in enumerate(main_categories[:max_categories]):
            logger.info(f"\n{'='*60}")
            logger.info(f"📦 İşleniyor [{i+1}/{min(len(main_categories), max_categories)}]: {category['name']}")
            logger.info(f"{'='*60}")
            
            category_data = {
                'name': category['name'],
                'slug': category['slug'],
                'url': category['url'],
                'subcategories': []
            }
            
            # Alt kategorileri al
            subcategories = self.get_subcategories(category['url'])
            
            for j, subcategory in enumerate(subcategories[:max_subcategories]):
                logger.info(f"\n  📂 Alt kategori [{j+1}/{min(len(subcategories), max_subcategories)}]: {subcategory['name']}")
                
                # Filtreleri al
                filters = self.get_filters(subcategory['url'])
                
                subcategory_data = {
                    'name': subcategory['name'],
                    'slug': subcategory['slug'],
                    'url': subcategory['url'],
                    'filters': filters
                }
                
                category_data['subcategories'].append(subcategory_data)
                
                time.sleep(1)  # Rate limiting
            
            self.data['categories'].append(category_data)
            time.sleep(2)  # Rate limiting
        
        logger.info(f"\n{'='*60}")
        logger.info("✅ Scraping tamamlandı!")
        logger.info(f"📊 Toplam {len(self.data['categories'])} kategori işlendi")
        logger.info(f"{'='*60}\n")
        
        return self.data
    
    def save_to_file(self, filename='sahibinden_full_data.json'):
        """Veriyi JSON dosyasına kaydet"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"💾 Veri kaydedildi: {filename}")
        
        # İstatistikler
        total_subcategories = sum(len(cat['subcategories']) for cat in self.data['categories'])
        total_filters = sum(
            len(sub['filters']) 
            for cat in self.data['categories'] 
            for sub in cat['subcategories']
        )
        
        logger.info(f"\n📈 İSTATİSTİKLER:")
        logger.info(f"   • Ana Kategori: {len(self.data['categories'])}")
        logger.info(f"   • Alt Kategori: {total_subcategories}")
        logger.info(f"   • Toplam Filtre: {total_filters}")
    
    def close(self):
        """Browser'ı kapat"""
        self.driver.quit()
        logger.info("🔒 Browser kapatıldı")


def main():
    """Ana fonksiyon"""
    scraper = SahibindenScraper()
    
    try:
        # Scraping yap (5 kategori, her kategoriden 3 alt kategori)
        data = scraper.scrape_all(max_categories=5, max_subcategories=3)
        
        # Kaydet
        scraper.save_to_file('/app/sahibinden_scraped_data.json')
        
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Kullanıcı tarafından durduruldu")
    except Exception as e:
        logger.error(f"\n❌ Hata oluştu: {e}")
        import traceback
        traceback.print_exc()
    finally:
        scraper.close()


if __name__ == '__main__':
    main()
