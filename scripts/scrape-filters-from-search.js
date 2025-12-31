const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

const OUTPUT_FILE = 'sahibinden_filters_search.xlsx';
const SEARCH_URL = 'https://www.sahibinden.com/arama/detayli';

let browser;
let page;
let allData = [];

(async () => {
    console.log('🕵️ Detailed Search Tree Crawler Starting...');
    
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: { width: 1920, height: 1080 }
        });
        
        const pages = await browser.pages();
        page = pages.find(p => p.url().includes('sahibinden.com')) || pages[0];
        if (!page) page = await browser.newPage();

        // Enable console logs from browser
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded' });
        await sleep(3000);

        // Start Recursive Process
        await processLevel([], 0);

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        saveData();
        console.log('👋 Done.');
        if (browser) browser.disconnect();
    }
})();

async function processLevel(path, depth) {
    console.log(`\n📂 Current Path: ${path.join(' > ') || 'Root'}`);

    // 1. Check if Form exists (Leaf Node)
    const hasForm = await page.evaluate(() => {
        // Look for detailed search content or many inputs
        const content = document.querySelector('.detailed-search-content');
        if (content && content.offsetParent !== null) {
             return content.querySelectorAll('input, select').length > 3;
        }
        return false;
    });

    if (hasForm) {
        console.log('   ✅ Form detected. Extracting fields...');
        await extractFormFields(path.join(' > '));
        return; 
    }

    // 2. If no form, look for active category list
    const paneData = await page.evaluate((depth) => {
        // Helper to check visibility
        function isVisible(el) {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
        }

        // Try to find the specific container for category selection
        // This is a guess, but if it exists, it filters out the user menu automatically.
        let container = document.querySelector('.category-selection-content') || document.body;
        
        // Find ULs inside the container
        let allUls = Array.from(container.querySelectorAll('ul'));
        
        // Filter for valid Category Panes
        const categoryPanes = allUls.filter((ul, index) => {
            const isVis = isVisible(ul);
            const text = ul.innerText;
            const shortText = text.substring(0, 50).replace(/\n/g, ' ');
            
            if (!isVis) {
                // console.log(`   [Debug] Pane #${index} skipped (hidden): ${shortText}`);
                return false;
            }

            // STRICT Blacklist
            const blacklist = [
                'Giriş Yap', 'Hesap Aç', 'Bana Özel', 'Çıkış Yap',
                'Kurumsal', 'Hakkımızda', 'Müşteri Hizmetleri',
                'İşlemlerim', 'Mağaza Sayfam', 'Mesajlar', 'Favoriler', 
                'İlanlarım', 'Alım İşlemlerim', 'Satış İşlemlerim',
                'Emlak Ofisim', 'Yardım Merkezi',
                'Türkiye', 'KKTC', 'Mahalle', 'Semt', 'Posta Kodu'
            ];
            
            if (blacklist.some(term => text.includes(term))) {
                console.log(`   [Debug] Pane #${index} skipped (blacklist match): ${shortText}`);
                return false;
            }

            // Exclude dropdowns/forms
            if (ul.closest('.search-item') || ul.closest('.detailed-search-content')) return false;
            if (ul.closest('header') || ul.closest('footer') || ul.closest('.footer') || ul.closest('.user-menu')) return false;
            
            // Check content items to identify Address Panes vs Category Panes
            const listItems = Array.from(ul.querySelectorAll('li')).map(li => li.innerText.trim().split('\n')[0]);
            const addressKeywords = ['Türkiye', 'İl', 'İlçe', 'Semt', 'Mahalle', 'Köy', 'KKTC'];
            if (listItems.some(item => addressKeywords.includes(item))) {
                 console.log(`   [Debug] Pane #${index} skipped (address keywords): ${listItems.slice(0, 3).join(', ')}`);
                 return false;
            }

            // Must have multiple items
            const lis = ul.querySelectorAll('li');
            if (lis.length < 2) return false;
            
            console.log(`   [Debug] Pane #${index} ACCEPTED: ${shortText}`);
            return true;
        });

        // Sort by position in DOM (assuming left-to-right or top-to-bottom hierarchy)
        // This helps align the array index with the logical depth
        // But 'depth' logic relies on the assumption that panes open sequentially.
        
        // Identify the target pane for the current depth
        let targetPaneIndex = -1;
        let items = [];

        if (depth === 0) {
            // Root must contain "Emlak"
            targetPaneIndex = categoryPanes.findIndex(ul => {
                const txt = ul.innerText;
                return txt.includes('Emlak') && txt.includes('Vasıta');
            });
        } else {
            // For depth > 0, we expect the (depth)-th pane to be the one
            // We need to be careful. If we filtered correctly, categoryPanes[depth] should be it.
            if (depth < categoryPanes.length) {
                targetPaneIndex = depth;
            }
        }

        if (targetPaneIndex !== -1) {
            const pane = categoryPanes[targetPaneIndex];
            items = Array.from(pane.querySelectorAll('li')).map(li => ({
                text: li.innerText.trim().split('\n')[0], // Take first line only
                fullText: li.innerText.trim()
            })).filter(i => i.text && !['Tümü'].includes(i.text));
        }

        return {
            items,
            targetPaneIndex, // Return which pane we found (index in the filtered list is tricky to reuse, better to use a unique characteristic or just trust the index if we re-query identically)
            totalPanes: categoryPanes.length
        };
    }, depth);

    if (paneData.items.length === 0) {
        console.log('   ⚠️ No items found here. Dead end?');
        return;
    }

    console.log(`   Found ${paneData.items.length} sub-categories in Pane #${paneData.targetPaneIndex} (Total Panes: ${paneData.totalPanes})`);

    // 3. Iterate Items
    for (let i = 0; i < paneData.items.length; i++) {
        const item = paneData.items[i];
        
        // Skip if already in path (avoid loops)
        if (path.includes(item.text)) continue;

        console.log(`   👉 Clicking: ${item.text}`);
        
        // Click the item - SCOPED to the specific pane
        const success = await page.evaluate((txt, paneIdx) => {
            // Re-run the EXACT same logic to find the pane
            function isVisible(el) {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
            }
            let container = document.querySelector('.category-selection-content') || document.body;
            let allUls = Array.from(container.querySelectorAll('ul'));
            const categoryPanes = allUls.filter(ul => {
                if (!isVisible(ul)) return false;
                const text = ul.innerText;
                const blacklist = [
                    'Giriş Yap', 'Hesap Aç', 'Bana Özel', 'Çıkış Yap',
                    'Kurumsal', 'Hakkımızda', 'Müşteri Hizmetleri',
                    'İşlemlerim', 'Mağaza Sayfam', 'Mesajlar', 'Favoriler', 
                    'İlanlarım', 'Alım İşlemlerim', 'Satış İşlemlerim',
                    'Emlak Ofisim', 'Yardım Merkezi',
                    // Location / Address filters - Use specific terms that identify address lists
                    // 'İl' is too short and matches 'İlanlarım'. Avoid simple includes for short words.
                    'Türkiye', 'KKTC', 'Mahalle', 'Semt', 'Posta Kodu'
                ];
                if (blacklist.some(term => text.includes(term))) return false;
                if (ul.closest('.search-item') || ul.closest('.detailed-search-content')) return false;
                if (ul.closest('header') || ul.closest('footer') || ul.closest('.footer') || ul.closest('.user-menu')) return false;
                
                // Check content items to identify Address Panes vs Category Panes
                const listItems = Array.from(ul.querySelectorAll('li')).map(li => li.innerText.trim().split('\n')[0]);
                const addressKeywords = ['Türkiye', 'İl', 'İlçe', 'Semt', 'Mahalle', 'Köy', 'KKTC'];
                if (listItems.some(item => addressKeywords.includes(item))) return false;

                if (ul.querySelectorAll('li').length < 2) return false;
                return true;
            });

            // Find the pane
            let pane = null;
            if (paneIdx < categoryPanes.length && paneIdx >= 0) {
                pane = categoryPanes[paneIdx];
            } else if (paneIdx === -1) {
                 // Fallback for root if index failed but we passed logic (shouldn't happen with new logic)
                 pane = categoryPanes.find(ul => ul.innerText.includes('Emlak') && ul.innerText.includes('Vasıta'));
            }

            if (pane) {
                // Find LI inside THIS pane
                const lis = Array.from(pane.querySelectorAll('li'));
                const el = lis.find(e => e.innerText.trim().startsWith(txt)); // startsWith to handle extra text
                if (el) {
                    const clickable = el.querySelector('a') || el.querySelector('label') || el;
                    clickable.click();
                    return true;
                }
            }
            return false;
        }, item.text, paneData.targetPaneIndex);

        if (success) {
            // Wait for new pane to appear
            await sleep(3000); 
            
            // Recurse
            await processLevel([...path, item.text], depth + 1);
            
            // Reload to reset state for next item at this level (Safest way)
            if (depth === 0) {
                 await page.reload();
                 await sleep(3000);
            }
        }
    }
}

async function extractFormFields(categoryPath) {
    const fields = await page.evaluate(() => {
        const extracted = [];
        const formRows = document.querySelectorAll('tr, .search-item');
        
        formRows.forEach(row => {
            const label = row.querySelector('label, .field-name');
            if (!label) return;
            
            const name = label.innerText.trim().replace(':', '');
            let type = 'Text/Select';
            let options = [];

            // Check for inputs
            if (row.querySelector('input[type="text"]')) type = 'Input';
            if (row.querySelector('input[type="checkbox"]')) type = 'Checkbox';
            
            // Check for selects
            const select = row.querySelector('select');
            if (select) {
                type = 'Select';
                Array.from(select.options).forEach(o => {
                    if (o.innerText.trim() !== 'Seçiniz') options.push(o.innerText.trim());
                });
            }
            
            // Check for ul/li lists (custom dropdowns)
            const ul = row.querySelector('ul');
            if (ul) {
                type = 'List';
                ul.querySelectorAll('li').forEach(li => options.push(li.innerText.trim()));
            }

            if (name) {
                extracted.push({
                    name: name,
                    type: type,
                    options: options.slice(0, 100).join(', ')
                });
            }
        });
        return extracted;
    });

    if (fields.length > 0) {
        console.log(`   ✅ Found ${fields.length} fields.`);
        fields.forEach(f => {
            allData.push({ Category: categoryPath, ...f });
        });
        saveData();
    }
}

function saveData() {
    if (allData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FormYapisi");
    XLSX.writeFile(wb, OUTPUT_FILE);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
