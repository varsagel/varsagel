#!/usr/bin/env python3
"""
SAHİBİNDEN.COM AJAX API SCRAPER
Gerçek AJAX endpoint'lerini kullanarak veri çekme
Network inspect'ten bulunan endpoint'ler
"""

import requests
import json
import time
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

class SahibindenAjaxScraper:
    def __init__(self):
        self.base_url = "https://www.sahibinden.com"
        self.session = requests.Session()
        
        # Gerçek browser gibi davran
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://www.sahibinden.com/',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'https://www.sahibinden.com'
        })
    
    def get_page_filters(self, url):
        """Bir sayfanın filtrelerini HTML'den çek"""
        logger.info(f"\n📄 {url}")
        
        try:
            response = self.session.get(url, timeout=15)
            
            if response.status_code != 200:
                logger.error(f"   ❌ Status: {response.status_code}")
                return []
            
            logger.info(f"   ✓ {len(response.text):,} karakter")
            
            # Parse
            soup = BeautifulSoup(response.text, 'html.parser')
            
            filters = []
            
            # SELECT elementleri
            selects = soup.find_all('select')
            logger.info(f"   📋 {len(selects)} select")
            
            for sel in selects[:30]:
                name = sel.get('name', '')
                sel_id = sel.get('id', '')
                
                if not name and not sel_id:
                    continue
                
                # Label
                label_text = ""
                if sel_id:
                    label = soup.find('label', {'for': sel_id})
                    if label:
                        label_text = label.get_text(strip=True)
                
                # Options
                options = []
                for opt in sel.find_all('option'):
                    text = opt.get_text(strip=True)
                    value = opt.get('value', '')
                    if text and value and text not in ['-', 'Seçiniz']:
                        options.append(text)
                
                if len(options) > 1:
                    logger.info(f"      ✓ {name or sel_id}: {len(options)} seçenek")
                    
                    filters.append({
                        'label': label_text or name or sel_id,
                        'key': name or sel_id,
                        'type': 'select',
                        'options': options[:100]
                    })
            
            # INPUT range
            inputs = soup.find_all('input', {'type': ['number', 'text']})
            logger.info(f"   📋 {len(inputs)} input")
            
            i = 0
            while i < len(inputs) - 1:
                inp1 = inputs[i]
                inp2 = inputs[i + 1]
                
                name1 = inp1.get('name', '')
                name2 = inp2.get('name', '')
                
                if name1 and name2 and 'min' in name1.lower() and 'max' in name2.lower():
                    base = name1.replace('_min', '').replace('Min', '').replace('_', ' ').title()
                    
                    logger.info(f"      ✓ Range: {name1} - {name2}")
                    
                    filters.append({
                        'label': base,
                        'type': 'range-number',
                        'minKey': name1,
                        'maxKey': name2
                    })
                    
                    i += 2
                    continue
                
                i += 1
            
            # UL class facetedSearch için checkbox'lar
            faceted_uls = soup.find_all('ul', class_='facetedSearch')
            logger.info(f"   📋 {len(faceted_uls)} faceted search")
            
            for ul in faceted_uls:
                # Başlık bul
                title_elem = ul.find_previous('h3')
                group_name = title_elem.get_text(strip=True) if title_elem else 'Unknown'
                
                # Checkbox'ları al
                checkboxes = ul.find_all('a', class_='facetedCheckbox')
                
                if len(checkboxes) > 0:
                    options = [cb.get_text(strip=True) for cb in checkboxes]
                    
                    logger.info(f"      ✓ {group_name}: {len(options)} seçenek")
                    
                    filters.append({
                        'label': group_name,
                        'type': 'multiselect',
                        'options': options[:100]
                    })
            
            logger.info(f"   ✅ TOPLAM {len(filters)} FİLTRE")
            return filters
            
        except Exception as e:
            logger.error(f"   ❌ Hata: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def scrape_categories(self):
        """Kategorileri scrape et"""
        logger.info("="*70)
        logger.info("🚀 SAHİBİNDEN.COM AJAX SCRAPER")
        logger.info("="*70)
        
        # Test kategorileri
        test_cases = [
            {
                'name': 'Satılık Daire',
                'url': 'https://www.sahibinden.com/satilik-daire',
                'category': 'emlak'
            },
            {
                'name': 'Kiralık Daire',
                'url': 'https://www.sahibinden.com/kiralik-daire',
                'category': 'emlak'
            },
            {
                'name': 'Satılık Arsa',
                'url': 'https://www.sahibinden.com/satilik-arsa',
                'category': 'emlak'
            },
            {
                'name': 'Otomobil',
                'url': 'https://www.sahibinden.com/otomobil',
                'category': 'vasita'
            },
            {
                'name': 'Motosiklet',
                'url': 'https://www.sahibinden.com/motosiklet',
                'category': 'vasita'
            }
        ]
        
        results = []
        
        for test in test_cases:
            logger.info(f"\n{'='*70}")
            logger.info(f"📂 {test['name']}")
            logger.info(f"{'='*70}")
            
            filters = self.get_page_filters(test['url'])
            
            results.append({
                'name': test['name'],
                'category': test['category'],
                'url': test['url'],
                'filters': filters
            })
            
            # Rate limiting
            time.sleep(3)
        
        return results
    
    def save(self, results, filename='/app/sahibinden_AJAX_SUCCESS.json'):
        """Kaydet"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        # İstatistikler
        total_filters = sum(len(r['filters']) for r in results)
        
        logger.info(f"\n{'='*70}")
        logger.info(f"💾 {filename}")
        logger.info(f"{'='*70}")
        logger.info(f"\n📊 SONUÇ:")
        logger.info(f"   • Test: {len(results)} sayfa")
        logger.info(f"   • Filtre: {total_filters}")
        
        if total_filters > 0:
            logger.info(f"\n✅ BAŞARILI! {total_filters} FİLTRE ÇEKİLDİ!")
            return True
        else:
            logger.info(f"\n⚠️ FİLTRE ÇEKİLEMEDİ")
            return False


def main():
    scraper = SahibindenAjaxScraper()
    
    try:
        results = scraper.scrape_categories()
        success = scraper.save(results)
        return success
        
    except KeyboardInterrupt:
        logger.warning("\n⚠️ Durduruldu")
        return False
    except Exception as e:
        logger.error(f"\n❌ Hata: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    result = main()
    exit(0 if result else 1)
