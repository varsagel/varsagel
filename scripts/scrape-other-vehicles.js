const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

// --- CONFIGURATION ---
const OUTPUT_FILE = 'sahibinden_data_others.xlsx';
const VISITED_FILE = 'visited_urls_others.json';
const MAX_DEPTH = 6; // Increased depth just in case
const SAVE_INTERVAL = 20; // Save every 20 items

// --- TARGET CATEGORIES ---
const TARGET_CATEGORIES = [
    { name: 'Arazi, SUV & Pickup', url: 'https://www.sahibinden.com/arazi-suv-pickup' },
    { name: 'Motosiklet', url: 'https://www.sahibinden.com/motosiklet' },
    { name: 'Minivan & Panelvan', url: 'https://www.sahibinden.com/minivan-panelvan' },
    { name: 'ATV & UTV', url: 'https://www.sahibinden.com/atv-utv' },
    { name: 'Karavan', url: 'https://www.sahibinden.com/karavan' },
    { name: 'Ticari Araçlar', url: 'https://www.sahibinden.com/ticari-araclar' }
];

// --- STATE ---
let browser;
let page;
let allData = [];
let visitedUrls = new Set();
let currentCategory = null; // Track current category for data tagging

// Selectors for Sahibinden categories
const CATEGORY_SELECTORS = [
    '#searchCategoryContainer ul li a', 
    'ul.categoryList li a',
    '.cl-filter-list li a',
    '.category-list li a',
    '.categories-board li a'
];

async function main() {
    console.log('🚀 Sahibinden Smart Bot (Other Vehicles) Starting...');
    console.log('   Target Categories:', TARGET_CATEGORIES.map(c => c.name).join(', '));
    console.log('   Mode: Human-like (Random Delays)');

    // 1. Load Previous State
    loadState();

    try {
        // 2. Connect to Chrome
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        console.log('✅ Connected to Chrome.');

        const pages = await browser.pages();
        page = pages.find(p => p.url().includes('sahibinden.com')) || pages[0];
        
        if (!page) page = await browser.newPage();

        // 3. Loop through categories
        for (const category of TARGET_CATEGORIES) {
            currentCategory = category.name;
            console.log(`\n\n📌 STARTING CATEGORY: ${category.name}`);
            console.log(`   URL: ${category.url}`);
            
            // Navigate to Category URL
            await page.goto(category.url, { waitUntil: 'domcontentloaded' });
            
            // Check Security
            await checkSecurity();

            // Start Scraping for this category
            // We pass depth 1 because we are at the root of the category
            await scrapeLevel([], 1);
        }

    } catch (error) {
        console.error('❌ Fatal Error:', error);
        process.exit(1); // Exit with error code so the batch file knows to restart
    } finally {
        saveState();
        console.log('👋 Bot Stopped.');
        if (browser) browser.disconnect();
        process.exit(0); // Exit cleanly
    }
}

// --- CORE SCRAPING LOGIC ---

async function scrapeLevel(currentPath, depth) {
    const currentUrl = page.url();
    
    // Check if we already fully scraped this URL
    if (visitedUrls.has(currentUrl)) {
        return;
    }

    const statusMsg = `📂 Category: ${currentCategory}<br>Path: ${currentPath.join(' > ') || 'Root'}<br>📊 Total: ${allData.length}<br>🎯 Depth: ${depth}`;
    console.log(`\n📂 [${currentCategory}] Path: ${currentPath.join(' > ')} (Depth: ${depth})`);
    await updateStatus(statusMsg, 'white');

    await randomSleep(800, 2000);

    if (await checkSecurity()) return;

    // Extract Links
    const links = await extractLinks();
    
    console.log(`   Found ${links.length} items.`);
    await updateStatus(`${statusMsg}<br>Found: ${links.length} items`, '#00ff00');

    // --- BASE CASE: No links or Max Depth ---
    if (links.length === 0 || depth >= MAX_DEPTH) {
        if (links.length === 0) console.log('   ⚠️ End of line (Leaf node).');
        else console.log('   🛑 Max depth reached.');

        // Save Data
        if (links.length > 0 && depth >= MAX_DEPTH) {
            // If stopped by depth, save all links as items
            for (const link of links) {
                const fullPath = [...currentPath, link.text];
                saveItem(fullPath, link.href);
            }
        } else if (currentPath.length > 0) {
            // Leaf node
            saveItem(currentPath, currentUrl);
        }
        
        markVisited(currentUrl);
        
        if (allData.length % SAVE_INTERVAL === 0) saveState();
        return;
    }

    // --- RECURSIVE STEP ---
    for (const link of links) {
        if (['tümü', 'detaylı arama', 'temizle', 'tümünü göster'].includes(link.text.toLowerCase())) continue;

        if (visitedUrls.has(link.href)) continue;

        console.log(`   👉 Clicking: ${link.text}`);
        await updateStatus(`👉 Clicking: ${link.text}<br>Depth: ${depth}`, 'cyan');
        
        try {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
                page.goto(link.href)
            ]);
            
            await randomSleep(1500, 4000);

            await scrapeLevel([...currentPath, link.text], depth + 1);

            console.log('   ⬅️ Going back...');
            await updateStatus(`⬅️ Going back...`, 'orange');
            
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
                page.goBack()
            ]);
            
            await randomSleep(1000, 2500);

        } catch (e) {
            console.error(`   ❌ Navigation Error (${link.text}):`, e.message);
            await updateStatus(`❌ Error: ${e.message}`, 'red');
            await randomSleep(5000, 10000);
        }
    }
    
    // We don't mark parent nodes as visited to allow re-entry if needed, 
    // but strictly speaking for a tree traversal we could. 
    // For now, let's leave it to ensure thoroughness.
    saveState();
}

function saveItem(path, url) {
    // Check duplicate
    // We include category in the check implicitly by checking the full object? 
    // Or just path + category
    const isDup = allData.some(d => d.category === currentCategory && d.path.join('>') === path.join('>'));
    if (!isDup) {
        allData.push({ 
            category: currentCategory,
            path: path, 
            url: url 
        });
        console.log(`   ✅ Saved: [${currentCategory}] ${path.join(' > ')}`);
    }
}

// --- HELPERS ---

async function extractLinks() {
    return await page.evaluate((selectors) => {
        let items = [];
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(el => {
                    let text = el.innerText.trim();
                    text = text.replace(/\(\d+\)/g, '').replace(/\d+ ilan/, '').trim();
                    
                    if (text && !text.includes('Fiyat') && !text.includes('km') && !text.includes('Ara')) {
                        items.push({ text: text, href: el.href });
                    }
                });
                if (items.length > 0) break;
            }
        }
        return items;
    }, CATEGORY_SELECTORS);
}

async function checkSecurity() {
    try {
        const title = await page.title();
        const bodyText = await page.evaluate(() => document.body.innerText);
        
        const isBlocked = title.includes('Just a moment') || 
                        title.includes('Security') || 
                        title.includes('Doğrulama') ||
                        bodyText.includes('olağan dışı erişim');

        if (isBlocked) {
            console.log('\n🛑 SECURITY / IP BLOCK DETECTED! Stopping process as requested.');
            saveState();
            if (browser) await browser.close();
            process.exit(0); // Exit with 0 to STOP the batch loop
        }
    } catch(e) {}
    return false;
}

function randomSleep(min, max) {
    const duration = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, duration));
}

// --- PERSISTENCE ---

function loadState() {
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const workbook = XLSX.readFile(OUTPUT_FILE);
            const sheet = workbook.Sheets['DigerVasitalar'];
            if (sheet) {
                const rawData = XLSX.utils.sheet_to_json(sheet);
                allData = rawData.map(row => ({
                    category: row['Kategori'],
                    path: [
                        row['Seviye 1'], 
                        row['Seviye 2'], 
                        row['Seviye 3'], 
                        row['Seviye 4'], 
                        row['Seviye 5']
                    ].filter(Boolean),
                    url: row['URL']
                }));
                console.log(`📚 Loaded ${allData.length} existing records.`);
            }
        } catch (e) {
            console.log('⚠️ Could not load existing Excel file.');
        }
    }

    if (fs.existsSync(VISITED_FILE)) {
        try {
            const data = fs.readFileSync(VISITED_FILE, 'utf8');
            visitedUrls = new Set(JSON.parse(data));
        } catch (e) {}
    }
}

function saveState() {
    fs.writeFileSync(VISITED_FILE, JSON.stringify([...visitedUrls], null, 2));

    if (allData.length === 0) return;

    const flatData = allData.map(item => {
        const row = { 'Kategori': item.category };
        // Generic Level Names
        const cols = ['Seviye 1', 'Seviye 2', 'Seviye 3', 'Seviye 4', 'Seviye 5', 'Seviye 6'];
        item.path.forEach((p, i) => {
            if (i < cols.length) row[cols[i]] = p;
        });
        row['URL'] = item.url;
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DigerVasitalar");
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`💾 Saved ${allData.length} records.`);
}

function markVisited(url) {
    visitedUrls.add(url);
}

async function updateStatus(text, color = 'blue') {
    try {
        await page.evaluate((msg, clr) => {
            let box = document.getElementById('varsagel-status-box');
            if (!box) {
                box = document.createElement('div');
                box.id = 'varsagel-status-box';
                box.style.position = 'fixed';
                box.style.bottom = '20px';
                box.style.right = '20px';
                box.style.padding = '15px';
                box.style.background = 'rgba(0,0,0,0.9)';
                box.style.color = 'white';
                box.style.borderRadius = '8px';
                box.style.zIndex = '999999';
                document.body.appendChild(box);
            }
            box.innerHTML = `<h3 style="margin:0 0 5px 0;color:#00ffff">🤖 Varsagel Bot (Multi)</h3><div style="font-size:14px;color:${clr}">${msg}</div>`;
        }, text, color);
    } catch (e) {}
}

process.on('SIGINT', () => {
    saveState();
    process.exit();
});

main();
