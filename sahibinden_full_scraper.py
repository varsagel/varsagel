#!/usr/bin/env python3
"""
Sahibinden.com KAPSAMLI Veri Çekici
Gerçek URL'ler ve sayfa yapısı kullanılarak tüm kategoriler çekilir
"""

import json
import asyncio
from playwright.async_api import async_playwright
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# SAHİBİNDEN.COM GERÇEK KATEGORİ YAPISI
CATEGORIES = {
    'emlak': {
        'name': 'Emlak',
        'subcategories': {
            'satilik-daire': 'Satılık Daire',
            'kiralik-daire': 'Kiralık Daire',
            'satilik-residence': 'Satılık Residence',
            'kiralik-residence': 'Kiralık Residence',
            'satilik-mustakil-ev': 'Satılık Müstakil Ev',
            'kiralik-mustakil-ev': 'Kiralık Müstakil Ev',
            'satilik-villa': 'Satılık Villa',
            'kiralik-villa': 'Kiralık Villa',
            'satilik-yazlik': 'Satılık Yazlık',
            'kiralik-yazlik': 'Kiralık Yazlık',
            'satilik-arsa': 'Satılık Arsa',
            'kiralik-arsa': 'Kiralık Arsa',
            'satilik-isyeri': 'Satılık İşyeri',
            'kiralik-isyeri': 'Kiralık İşyeri',
            'satilik-bina': 'Satılık Bina',
        }
    },
    'vasita': {
        'name': 'Vasıta',
        'subcategories': {
            'otomobil': 'Otomobil',
            'arazi-suv-pickup': 'Arazi, SUV & Pickup',
            'motosiklet': 'Motosiklet',
            'minivan-panelvan': 'Minivan & Panelvan',
            'ticari-araclar': 'Ticari Araçlar',
            'elektrikli-araclar': 'Elektrikli Araçlar',
            'klasik-araclar': 'Klasik Araçlar',
            'motorsiklet-ekipmanlari': 'Motosiklet Ekipmanları',
        }
    },
    'yedek-parca-aksesuar': {
        'name': 'Yedek Parça & Aksesuar',
        'subcategories': {
            'otomobil-yedek-parca': 'Otomobil Yedek Parça',
            'motosiklet-yedek-parca': 'Motosiklet Yedek Parça',
            'aksesuar': 'Aksesuar',
        }
    }
}

async def scrape_filters(page, category_slug, subcategory_slug):
    """Bir alt kategorinin filtrelerini çek"""
    url = f"https://www.sahibinden.com/{category_slug}/{subcategory_slug}"
    
    logger.info(f"   🔍 {url}")
    
    try:
        await page.goto(url, wait_until='domcontentloaded', timeout=15000)
        await page.wait_for_timeout(3000)
        
        filters = []
        
        # Farklı CSS selectorlar dene
        selectors = [
            '.searchFilterContainer',
            '[class*="filter"]',
            '.form-group',
            '.searchOptions',
            '#searchResultsSearchForm'
        ]
        
        for selector in selectors:
            elements = await page.query_selector_all(selector)
            if elements:
                logger.info(f"      ✓ {len(elements)} element bulundu ({selector})")
                break
        
        # Form elementlerini bul
        all_labels = await page.query_selector_all('label')
        all_selects = await page.query_selector_all('select')
        all_inputs = await page.query_selector_all('input[type="number"], input[type="text"]')
        
        logger.info(f"      📋 {len(all_labels)} label, {len(all_selects)} select, {len(all_inputs)} input")
        
        # Select elementlerinden filtre çıkar
        for select in all_selects[:20]:
            try:
                select_id = await select.get_attribute('id')
                select_name = await select.get_attribute('name')
                
                # İlgili label'ı bul
                label_text = ""
                if select_id:
                    label = await page.query_selector(f'label[for="{select_id}"]')
                    if label:
                        label_text = await label.text_content()
                
                if not label_text and select_name:
                    # Name'den label oluştur
                    label_text = select_name.replace('_', ' ').title()
                
                # Options al
                options = await select.query_selector_all('option')
                option_texts = []
                for opt in options[:50]:
                    text = await opt.text_content()
                    if text and text.strip() and text.strip() != '-':
                        option_texts.append(text.strip())
                
                if label_text and option_texts:
                    filters.append({
                        'label': label_text.strip(),
                        'key': select_name or select_id,
                        'type': 'select',
                        'options': option_texts
                    })
            
            except:
                continue
        
        # Input range kontrolü
        number_inputs = [inp for inp in all_inputs if await inp.get_attribute('type') == 'number']
        if len(number_inputs) >= 2:
            # Min-Max çiftlerini bul
            for i in range(0, len(number_inputs) - 1, 2):
                try:
                    inp1_name = await number_inputs[i].get_attribute('name')
                    inp2_name = await number_inputs[i+1].get_attribute('name')
                    
                    if inp1_name and inp2_name and 'min' in inp1_name.lower() and 'max' in inp2_name.lower():
                        # Label bul
                        label_text = inp1_name.replace('_min', '').replace('Min', '').replace('_', ' ').title()
                        
                        filters.append({
                            'label': label_text,
                            'type': 'range-number',
                            'minKey': inp1_name,
                            'maxKey': inp2_name
                        })
                except:
                    continue
        
        logger.info(f"      ✅ {len(filters)} filtre çıkarıldı")
        return filters
        
    except Exception as e:
        logger.error(f"      ❌ Hata: {e}")
        return []

async def main():
    logger.info("🚀 Sahibinden.com FULL Scraper başlıyor...\n")
    
    result = {
        'categories': [],
        'timestamp': '2025-01-01'
    }
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            for cat_slug, cat_data in list(CATEGORIES.items())[:3]:
                logger.info(f"\n{'='*60}")
                logger.info(f"📦 {cat_data['name']}")
                logger.info(f"{'='*60}")
                
                category_result = {
                    'name': cat_data['name'],
                    'slug': cat_slug,
                    'subcategories': []
                }
                
                for sub_slug, sub_name in list(cat_data['subcategories'].items())[:5]:
                    logger.info(f"\n  📂 {sub_name}")
                    
                    filters = await scrape_filters(page, cat_slug, sub_slug)
                    
                    category_result['subcategories'].append({
                        'name': sub_name,
                        'slug': sub_slug,
                        'filters': filters
                    })
                    
                    await page.wait_for_timeout(2000)
                
                result['categories'].append(category_result)
        
        finally:
            await browser.close()
    
    # Kaydet
    with open('/app/sahibinden_real_data.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    # İstatistikler
    total_subs = sum(len(cat['subcategories']) for cat in result['categories'])
    total_filters = sum(len(sub['filters']) for cat in result['categories'] for sub in cat['subcategories'])
    
    logger.info(f"\n{'='*60}")
    logger.info("✅ TAMAMLANDI!")
    logger.info(f"{'='*60}")
    logger.info(f"💾 Dosya: /app/sahibinden_real_data.json")
    logger.info(f"\n📊 İSTATİSTİKLER:")
    logger.info(f"   • Ana Kategori: {len(result['categories'])}")
    logger.info(f"   • Alt Kategori: {total_subs}")
    logger.info(f"   • Toplam Filtre: {total_filters}")

if __name__ == '__main__':
    asyncio.run(main())
