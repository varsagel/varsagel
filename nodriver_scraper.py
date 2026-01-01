#!/usr/bin/env python3
"""
SAHİBİNDEN.COM NODRIVER SCRAPER
nodriver kullanarak Cloudflare bypass ve tüm filtreleri çekme
GitHub: 0Baris/sahibinden-scraper'dan ilham alınmıştır
"""

import asyncio
import nodriver as uc
from bs4 import BeautifulSoup
import json
import time
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

async def scrape_filters(url, name):
    """Bir sayfanın filtrelerini çek"""
    logger.info(f"\n{'='*70}")
    logger.info(f"📂 {name}")
    logger.info(f"🔗 {url}")
    logger.info(f"{'='*70}")
    
    driver = await uc.start(headless=True)
    
    try:
        # Sayfayı aç
        tab = await driver.get(url)
        logger.info("⏳ Sayfa yükleniyor...")
        await tab.sleep(5)
        
        # Cookie kabul et
        try:
            accept_btn = await tab.find('Tüm Çerezleri Kabul Et', best_match=True)
            if accept_btn:
                await accept_btn.click()
                await tab.sleep(2)
                logger.info("✓ Cookie kabul edildi")
        except:
            pass
        
        # JavaScript yüklensin
        await tab.sleep(8)
        logger.info("✓ JavaScript render tamamlandı")
        
        # HTML al
        html_content = await tab.get_content()
        logger.info(f"✓ HTML alındı: {len(html_content):,} karakter")
        
        # Parse
        soup = BeautifulSoup(html_content, 'html.parser')
        
        filters = []
        
        # SELECT elementleri
        selects = soup.find_all('select')
        logger.info(f"\n📋 {len(selects)} SELECT bulundu")
        
        for sel in selects[:30]:
            try:
                name_attr = sel.get('name', '')
                id_attr = sel.get('id', '')
                
                # Label bul
                label_text = ""
                if id_attr:
                    label = soup.find('label', {'for': id_attr})
                    if label:
                        label_text = label.get_text(strip=True)
                
                # Options
                options = []
                for opt in sel.find_all('option'):
                    text = opt.get_text(strip=True)
                    value = opt.get('value', '')
                    if text and value and text not in ['-', 'Seçiniz', '']:
                        options.append(text)
                
                if len(options) > 1:
                    logger.info(f"   ✓ {name_attr or id_attr}: {len(options)} seçenek")
                    
                    filters.append({
                        'label': label_text or name_attr or id_attr,
                        'key': name_attr or id_attr,
                        'type': 'select',
                        'options': options[:100]
                    })
                    
            except:
                continue
        
        # INPUT (number range)
        inputs = soup.find_all('input', {'type': ['number', 'text']})
        logger.info(f"📋 {len(inputs)} INPUT bulundu")
        
        i = 0
        while i < len(inputs) - 1:
            try:
                inp1 = inputs[i]
                inp2 = inputs[i + 1]
                
                name1 = inp1.get('name', '')
                name2 = inp2.get('name', '')
                
                if name1 and name2:
                    if ('min' in name1.lower() and 'max' in name2.lower()):
                        base = name1.replace('_min', '').replace('Min', '').replace('_', ' ').title()
                        
                        logger.info(f"   ✓ Range: {name1} - {name2}")
                        
                        filters.append({
                            'label': base,
                            'type': 'range-number',
                            'minKey': name1,
                            'maxKey': name2
                        })
                        
                        i += 2
                        continue
            except:
                pass
            
            i += 1
        
        # CHECKBOX/LINKS (faceted filters)
        checkboxes = soup.find_all('a', class_='facetedCheckbox')
        logger.info(f"📋 {len(checkboxes)} FACETED CHECKBOX bulundu")
        
        checkbox_groups = {}
        for cb in checkboxes[:50]:
            try:
                data_name = cb.get('data-name', '')
                text = cb.get_text(strip=True)
                
                if data_name and text:
                    if data_name not in checkbox_groups:
                        checkbox_groups[data_name] = []
                    checkbox_groups[data_name].append(text)
                    
            except:
                continue
        
        for name, options in checkbox_groups.items():
            if len(options) > 0:
                logger.info(f"   ✓ {name}: {len(options)} seçenek")
                
                filters.append({
                    'label': name.replace('_', ' ').title(),
                    'key': name,
                    'type': 'multiselect',
                    'options': options
                })
        
        logger.info(f"\n✅ TOPLAM {len(filters)} FİLTRE ÇIKARILDI")
        
        return filters
        
    except Exception as e:
        logger.error(f"❌ Hata: {e}")
        import traceback
        traceback.print_exc()
        return []
    
    finally:
        driver.stop()


async def main():
    """Ana scraping fonksiyonu"""
    logger.info("="*70)
    logger.info("🚀 SAHİBİNDEN.COM NODRIVER SCRAPER")
    logger.info("="*70)
    
    # Test kategorileri
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
    
    results = []
    
    for test in test_cases:
        filters = await scrape_filters(test['url'], test['name'])
        
        results.append({
            'name': test['name'],
            'category': test['category'],
            'url': test['url'],
            'filters': filters
        })
        
        # Rate limiting
        await asyncio.sleep(5)
    
    # Kaydet
    output_file = '/app/sahibinden_NODRIVER_SUCCESS.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    # Özet
    total_filters = sum(len(r['filters']) for r in results)
    
    logger.info(f"\n{'='*70}")
    logger.info(f"💾 {output_file}")
    logger.info(f"{'='*70}")
    logger.info(f"\n📊 SONUÇ:")
    logger.info(f"   • Test: {len(results)} sayfa")
    logger.info(f"   • Filtre: {total_filters}")
    
    if total_filters > 0:
        logger.info(f"\n✅ BAŞARILI! {total_filters} FİLTRE ÇEKİLDİ!")
        return True
    else:
        logger.info(f"\n❌ FİLTRE ÇEKİLEMEDİ!")
        return False


if __name__ == '__main__':
    result = uc.loop().run_until_complete(main())
    exit(0 if result else 1)
