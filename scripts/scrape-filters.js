const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

const OUTPUT_FILE = 'sahibinden_filters.xlsx';

(async () => {
    console.log('🏗️  Filter Structure Scraper Starting...');
    
    try {
        // Connect to existing Chrome
        const browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        
        const pages = await browser.pages();
        const page = pages.find(p => p.url().includes('sahibinden.com')) || pages[0];
        
        // Get Category Name from Breadcrumb or Title
        const categoryName = await page.evaluate(() => {
            const breadcrumbs = Array.from(document.querySelectorAll('.u-bread-crumb li a'));
            return breadcrumbs.map(b => b.innerText.trim()).join(' > ') || document.title;
        });
        
        console.log(`📂 Analyzing Category: ${categoryName}`);

        // Extract Filters
        const filters = await page.evaluate(() => {
            const extracted = [];
            
            // STRATEGY 1: Definition Lists (Standard Filters)
            const dlElements = document.querySelectorAll('dl.search-filter-dl, .search-filter dl');
            
            dlElements.forEach(dl => {
                const dt = dl.querySelector('dt');
                if (!dt) return;
                
                const filterName = dt.innerText.trim();
                const dd = dl.querySelector('dd');
                if (!dd) return;

                let type = 'Unknown';
                let values = [];

                if (dd.querySelector('input[placeholder*="min"]') || dd.querySelector('.min-max-input')) {
                    type = 'Range (Min/Max)';
                } else {
                    type = 'Select / List';
                    const items = dd.querySelectorAll('li a, li label, ul li');
                    items.forEach(item => {
                        let val = item.innerText.replace(/\(\d+\)/g, '').trim();
                        if (val && val !== 'Tümü') values.push(val);
                    });
                }
                
                if (filterName) extracted.push({ name: filterName, type: type, values: values.join(', ') });
            });

            // STRATEGY 2: Address / Location Filters (Special Structure)
            const locFilters = document.querySelectorAll('.search-filter .jspPane ul');
            if (locFilters.length > 0) {
                 // Check headers for these lists
                 const headers = document.querySelectorAll('.search-filter h3, .search-filter dt');
                 // This is harder to map, usually Strategy 1 covers it if structure is DL/DT
            }

            // STRATEGY 3: Faceted Navigation (Left Menu Categories acting as filters)
            const facets = document.querySelectorAll('.cl-filter-list');
            facets.forEach(list => {
                // Try to find previous sibling header
                let header = list.previousElementSibling;
                while (header && !['H3', 'H4', 'DT', 'DIV'].includes(header.tagName)) {
                    header = header.previousElementSibling;
                }
                const name = header ? header.innerText.trim() : 'Kategori/Filtre';
                
                let values = [];
                list.querySelectorAll('li a').forEach(a => {
                    let val = a.innerText.replace(/\(\d+\)/g, '').trim();
                    if (val) values.push(val);
                });
                
                if (values.length > 0) {
                    extracted.push({ name: name, type: 'Category/Facet', values: values.join(', ') });
                }
            });

            return extracted;
        });

        console.log(`✅ Found ${filters.length} filters.`);
        
        // Save to Excel
        saveFilters(categoryName, filters);

        console.log('👋 Done. Filters saved.');
        browser.disconnect();

    } catch (e) {
        console.error('❌ Error:', e);
    }
})();

function saveFilters(category, filters) {
    let workbook;
    let data = [];

    // Load existing file if exists
    if (fs.existsSync(OUTPUT_FILE)) {
        workbook = XLSX.readFile(OUTPUT_FILE);
        const sheet = workbook.Sheets['Filtreler'];
        if (sheet) {
            data = XLSX.utils.sheet_to_json(sheet);
        }
    } else {
        workbook = XLSX.utils.book_new();
    }

    // Append new data
    filters.forEach(f => {
        // Avoid duplicates for same category + filter
        const exists = data.some(d => d.Category === category && d.FilterName === f.name);
        if (!exists) {
            data.push({
                Category: category,
                FilterName: f.name,
                Type: f.type,
                Options: f.values.substring(0, 32000) // Excel cell limit protection
            });
        }
    });

    const ws = XLSX.utils.json_to_sheet(data);
    
    // Create or Update sheet
    if (workbook.SheetNames.includes('Filtreler')) {
        const idx = workbook.SheetNames.indexOf('Filtreler');
        workbook.SheetNames[idx] = 'Filtreler'; // Update logic handled by assignment usually, but here we replace
        workbook.Sheets['Filtreler'] = ws;
    } else {
        XLSX.utils.book_append_sheet(workbook, ws, 'Filtreler');
    }

    XLSX.writeFile(workbook, OUTPUT_FILE);
    console.log(`💾 Saved to ${OUTPUT_FILE}`);
}
