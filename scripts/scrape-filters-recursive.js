const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

const OUTPUT_FILE = 'sahibinden_filters_full.xlsx';
const START_URL = 'https://www.sahibinden.com/'; // Start from homepage or specific category
const MAX_DEPTH = 6; // Increased to 6 to handle deep categories (Brand > Model > Series > Detail > Trim)

// State
let browser;
let page;
let visitedUrls = new Set();
let allFilters = [];
let pageCount = 0; // Counter for periodic save

(async () => {
    console.log('🕷️  Category & Filter Crawler Starting...');
    
    try {
        // Connect to Chrome
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: { width: 1920, height: 1080 } // Force Desktop View
        });
        
        const pages = await browser.pages();
        page = pages.find(p => p.url().includes('sahibinden.com')) || pages[0];
        
        if (!page) page = await browser.newPage();

        // Set User Agent just in case
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Start Crawling
        await crawlCategory(START_URL, 1);

    } catch (e) {
        console.error('❌ Fatal Error:', e);
    } finally {
        saveFilters();
        console.log('👋 Done.');
        if (browser) browser.disconnect();
    }
})();

async function crawlCategory(url, depth) {
    if (visitedUrls.has(url)) return;
    visitedUrls.add(url);
    pageCount++;

    console.log(`\n📂 Visiting: ${url} (Depth: ${depth})`);
    
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        // Wait for filter container to appear if possible
        try {
            await page.waitForSelector('#searchResultLeft-filter, .search-filter', { timeout: 3000 });
        } catch (e) {
            // Ignore timeout, maybe no filters here
        }
        
        // Periodic Save
        if (pageCount % 5 === 0) {
            console.log('💾 Periodic Save...');
            saveFilters();
        }

        // 1. Get Category Name
        const categoryName = await page.evaluate(() => {
            const breadcrumbs = Array.from(document.querySelectorAll('.u-bread-crumb li a'));
            return breadcrumbs.map(b => b.innerText.trim()).join(' > ') || document.title;
        });

        // 3. Find Subcategories to visit (if not too deep)
        // MOVED UP: Search for subcategories BEFORE clicking any detailed search button
        let subLinks = [];
        if (depth < MAX_DEPTH) {
            subLinks = await page.evaluate(() => {
                const links = [];
                const seen = new Set();
                
                const add = (l) => {
                    if (l && l.includes('sahibinden.com') && !l.includes('javascript') && !seen.has(l)) {
                        links.push(l);
                        seen.add(l);
                    }
                };

                // 1. Homepage Left Menu (Main Categories)
                document.querySelectorAll('.categories-left-menu li a').forEach(a => add(a.href));
                
                // 2. Standard Category Lists
                document.querySelectorAll('ul.categoryList li a').forEach(a => add(a.href));
                
                // 3. Sidebar Filters (Subcategories)
                document.querySelectorAll('.cl-filter-list li a').forEach(a => add(a.href));
                
                // 4. Categories Board (Homepage tiles)
                document.querySelectorAll('.categories-board li a').forEach(a => add(a.href));
                
                // 5. Desktop Menu (Top)
                document.querySelectorAll('ul.main-menu li a').forEach(a => add(a.href));

                // 6. Generic Category Lists (Deep diving)
                document.querySelectorAll('.category-list li a').forEach(a => add(a.href));
                document.querySelectorAll('.searchResultsCategoryList li a').forEach(a => add(a.href));

                // 7. NEW: Search Results Category List (Common in sub-pages)
                document.querySelectorAll('.searchResultsCategoryList ul li a').forEach(a => add(a.href));
                
                // 8. NEW: Any link inside "Kategoriler" box
                const catHeader = Array.from(document.querySelectorAll('h3, h4, dt')).find(h => h.innerText.includes('Kategoriler') || h.innerText.includes('İlgili Kategoriler'));
                if (catHeader) {
                    let parent = catHeader.parentElement;
                    while(parent && parent.tagName !== 'DIV' && parent.tagName !== 'UL') parent = parent.parentElement;
                    if (parent) {
                        parent.querySelectorAll('a').forEach(a => add(a.href));
                    }
                }

                // 9. NEW: Smart URL Pattern Matching (Aggressive)
                // If we are in /satilik, look for /satilik-daire, /satilik-arsa etc.
                const currentPath = window.location.pathname.replace(/^\/|\/$/g, '');
                if (currentPath && currentPath.length > 2) {
                     document.querySelectorAll('a').forEach(a => {
                         if (a.href && a.href.includes(currentPath + '-')) {
                             add(a.href);
                         }
                     });
                }

                // 10. FALLBACK: If on Homepage and found nothing, add Main Categories manually
                if (links.length === 0 && window.location.pathname === '/') {
                    const mainCats = [
                        'https://www.sahibinden.com/kategori/emlak',
                        'https://www.sahibinden.com/kategori/vasita',
                        'https://www.sahibinden.com/kategori/yedek-parca-aksesuar-donanim-tuning',
                        'https://www.sahibinden.com/kategori/ikinci-el-ve-sifir-alisveris',
                        'https://www.sahibinden.com/kategori/is-makineleri-sanayi',
                        'https://www.sahibinden.com/kategori/ustalar-ve-hizmetler',
                        'https://www.sahibinden.com/kategori/ozel-ders-verenler',
                        'https://www.sahibinden.com/kategori/is-ilanlari',
                        'https://www.sahibinden.com/kategori/yardimci-arayanlar',
                        'https://www.sahibinden.com/kategori/hayvanlar-alemi'
                    ];
                    mainCats.forEach(l => add(l));
                }

                return links;
            });

            console.log(`   found ${subLinks.length} sub-categories.`);
        }

        // 2. Extract Filters on current page
        const filters = await extractFiltersOnPage();
        if (filters.length > 0) {
            console.log(`   ✅ Found ${filters.length} filters for "${categoryName}"`);
            filters.forEach(f => {
                allFilters.push({ category: categoryName, ...f });
            });
            // Save immediately just in case
            saveFilters();
        } else {
            console.log('   ⚠️ No filters found here.');
        }

        // CLICK "Detaylı Arama" if exists (common in new design)
        // BUT ONLY if we are deep enough AND we are NOT in a category selection page
        const hasCategoryList = subLinks.length > 0; // Use our found links to determine if it's a category page
        
        if (depth > 2 && !hasCategoryList) {
            try {
                const detailBtn = await page.$('a[title="Detaylı Arama"], .search-filter-open-btn');
                if (detailBtn) {
                    const href = await page.evaluate(el => el.getAttribute('href'), detailBtn);
                    // Don't click if it goes to /arama/detayli (generic search)
                    if (href && !href.includes('/arama/detayli')) {
                        console.log('   👆 Clicking "Detaylı Arama" button...');
                        await detailBtn.click();
                        await sleep(1500);
                        
                        // Re-extract filters after clicking
                        const newFilters = await extractFiltersOnPage();
                        if (newFilters.length > 0) {
                            console.log(`   ✅ Found ${newFilters.length} MORE filters after click`);
                            newFilters.forEach(f => allFilters.push({ category: categoryName, ...f }));
                        }
                    }
                }
            } catch (e) {}
        }
        
        await sleep(1000); // Extra safety wait

        // 3. Find Subcategories to visit (Process found links)
        if (depth < MAX_DEPTH) {
            // Process each subcategory
            for (const link of subLinks) {
                if (!visitedUrls.has(link)) {
                    await crawlCategory(link, depth + 1);
                }
            }
        }

    } catch (e) {
        console.error(`   ❌ Error visiting ${url}:`, e.message);
    }
}

async function extractFiltersOnPage() {
    return await page.evaluate(() => {
        const extracted = [];
        
        // --- MASTER SELECTOR STRATEGY ---
        // Look for ANY definition list inside known filter containers
        const filterContainers = [
            '#searchResultLeft-filter', // Main filter area
            '.search-filter',           // Generic filter class
            '.searchResultsSearchForm', // Sometimes inside form
            '#search_left'              // Legacy container
        ];

        let foundAny = false;

        filterContainers.forEach(containerSelector => {
            const container = document.querySelector(containerSelector);
            if (!container) return;

            // Strategy 1: Definition Lists (Standard Filters like "Oda Sayısı")
            const dls = container.querySelectorAll('dl');
            dls.forEach(dl => {
                const dt = dl.querySelector('dt');
                const dd = dl.querySelector('dd');
                if (!dt || !dd) return;
                
                const name = dt.innerText.trim();
                if (!name) return;

                let type = 'Select';
                let values = [];

                // Check for inputs (Range)
                if (dd.querySelector('input')) {
                    type = 'Input/Range';
                }
                
                // Get list items
                dd.querySelectorAll('li a, li label, ul li').forEach(i => {
                    let v = i.innerText.replace(/\(\d+\)/g, '').trim();
                    if (v && v !== 'Tümü') values.push(v);
                });

                if (values.length > 0 || type === 'Input/Range') {
                    extracted.push({ name, type, values: values.join(', ') });
                    foundAny = true;
                }
            });

            // Strategy 2: Faceted Links (e.g. "İl", "İlçe" often in simple lists)
            if (!foundAny) {
                 const lists = container.querySelectorAll('ul');
                 lists.forEach(ul => {
                     // Try to find a header for this list
                     let header = ul.previousElementSibling;
                     while (header && !['H3','H4','DT','DIV','A'].includes(header.tagName)) {
                         header = header.previousElementSibling;
                     }
                     
                     if (header && header.innerText.length < 30) {
                         const name = header.innerText.trim();
                         let values = [];
                         ul.querySelectorAll('li a').forEach(a => {
                            let v = a.innerText.replace(/\(\d+\)/g, '').trim();
                            if (v) values.push(v);
                         });
                         
                         if (values.length > 0) {
                             extracted.push({ name, type: 'Facet', values: values.join(', ') });
                         }
                     }
                 });
            }
        });

        // Debug: Log if we see the filter container but no filters
        if (extracted.length === 0) {
             const hasLeft = document.querySelector('#searchResultLeft-filter');
             const hasForm = document.querySelector('.searchResultsSearchForm');
             if (hasLeft || hasForm) {
                 return [{ name: 'DEBUG', type: 'Error', values: `Container found but no DLs. Left: ${!!hasLeft}, Form: ${!!hasForm}` }];
             } else {
                 // Check if we have H1 title to confirm page loaded
                 const h1 = document.querySelector('h1');
                 return [{ name: 'DEBUG', type: 'Info', values: `No filters. Page Title: ${h1 ? h1.innerText : 'No H1'}` }];
             }
        }

        return extracted;
    });
}

function saveFilters() {
    if (allFilters.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(allFilters);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtreler");
    XLSX.writeFile(wb, OUTPUT_FILE);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
