const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

// --- CONFIGURATION ---
const START_URL = 'https://www.sahibinden.com/otomobil';
const OUTPUT_FILE = 'sahibinden_data_full.xlsx';
const VISITED_FILE = 'visited_urls.json';
const MAX_DEPTH = 5; // Updated to 5: Marka > Model > Seri > Model Detay > Paket
const SAVE_INTERVAL = 20; // Save every 20 items

// --- TARGETING ---
const START_FROM_BRAND = ''; // Start directly from this brand
let startBrandFound = false; // Internal flag

// --- STATE ---
let browser;
let page;
let allData = [];
let visitedUrls = new Set(); // URLs we have FULLY scraped
let isPaused = false;

// Selectors for Sahibinden categories
const CATEGORY_SELECTORS = [
    '#searchCategoryContainer ul li a', 
    'ul.categoryList li a',
    '.cl-filter-list li a',
    '.category-list li a',
    '.categories-board li a'
];

async function main() {
    console.log('🚀 Sahibinden Smart Bot Starting...');
    console.log('   Depth: 5 Levels');
    console.log('   Mode: Human-like (Random Delays)');
    console.log('   Resume: Active');

    // 1. Load Previous State
    loadState();
    
    // 2. CLEANUP STATE (Fix for premature stopping)
    // Remove main category pages from visited list so we always re-check them
    console.log('🧹 Cleaning up visited list to ensure deep check...');
    let cleanedCount = 0;
    const criticalKeywords = ['otomobil', 'hyundai', 'audi', 'bmw', 'mercedes', 'fiat', 'ford', 'renault', 'honda', 'toyota', 'volkswagen'];
    
    for (const url of visitedUrls) {
        // If it looks like a main category page (short URL or contains keyword but not deep details)
        // A simple heuristic: Category pages usually end with the category name or have few slashes
        // But safer approach: Just remove the start URL and brand URLs if possible.
        
        // Actually, the most robust way is to rely on our previous fix (not adding parents).
        // But since we have old data, let's remove the START_URL specifically.
        if (url === START_URL || url.endsWith('/otomobil') || url.endsWith('/otomobil/')) {
            visitedUrls.delete(url);
            cleanedCount++;
        }
        
        // Also remove Brand pages if we suspect they are blocked
        // We can check if the URL matches a known brand pattern "otomobil/marka"
        if (url.match(/otomobil\/[a-z-]+$/) || url.match(/otomobil\/[a-z-]+\/$/)) {
             visitedUrls.delete(url);
             cleanedCount++;
        }
    }
    console.log(`✨ Removed ${cleanedCount} parent nodes from visited list.`);

    try {
        // 3. Connect to Chrome
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        console.log('✅ Connected to Chrome.');

        const pages = await browser.pages();
        page = pages.find(p => p.url().includes('sahibinden.com')) || pages[0];
        
        if (!page) page = await browser.newPage();

        // 3. Initial Navigation
        if (!page.url().includes('otomobil')) {
            console.log('➡️ Navigating to start URL...');
            await page.goto(START_URL, { waitUntil: 'domcontentloaded' });
        }

        // 4. Start/Resume Scraping (Loop for Restart)
        while (true) {
            try {
                // Ensure we are at start page if restarting
                if (!page.url().includes('otomobil')) {
                    await page.goto(START_URL, { waitUntil: 'domcontentloaded' });
                }
                
                // CRITICAL FIX: If we are targeting a specific brand, 
                // we MUST force re-scan of the main category page even if visited before.
                const currentUrl = page.url();
                if (START_FROM_BRAND && visitedUrls.has(currentUrl)) {
                    console.log(`🔓 Re-opening main category to find target: ${START_FROM_BRAND}`);
                    visitedUrls.delete(currentUrl);
                }

                await checkSecurity();
                await scrapeLevel([], 1);
                break; // If finished successfully, exit loop

            } catch (e) {
                if (e === 'RESTART_SCRAPER') {
                    console.log('\n🔄 RESTARTING FROM SCRATCH (As requested)...');
                    console.log('⏩ Previous data will be skipped automatically.');
                    await randomSleep(2000, 4000);
                    // Loop continues, restarting scrapeLevel([], 1)
                } else {
                    throw e; // Real error
                }
            }
        }

    } catch (error) {
        console.error('❌ Fatal Error:', error);
    } finally {
        saveState();
        console.log('👋 Bot Stopped.');
        if (browser) browser.disconnect();
    }
}

// --- CORE SCRAPING LOGIC ---

async function scrapeLevel(currentPath, depth) {
    const currentUrl = page.url();
    
    // Check if we already fully scraped this URL
    if (visitedUrls.has(currentUrl)) {
        // console.log(`⏩ Skipping (Already Scraped): ${currentPath.join(' > ')}`);
        // Reduce log noise during restart
        return;
    }

    const statusMsg = `📂 Path: ${currentPath.join(' > ') || 'Start'}<br>📊 Total: ${allData.length}<br>🎯 Depth: ${depth}/${MAX_DEPTH}`;
    console.log(`\n📂 Current Path: ${currentPath.join(' > ')} (Depth: ${depth})`);
    await updateStatus(statusMsg, 'white');

    // Random Human Delay before acting
    await randomSleep(800, 2000);

    // Check Security again before scraping
    if (await checkSecurity()) return;

    // Extract Links
    const links = await extractLinks();
    
    console.log(`   Found ${links.length} items.`);
    await updateStatus(`${statusMsg}<br>Found: ${links.length} items`, '#00ff00');

    // --- BASE CASE: No links or Max Depth ---
    if (links.length === 0 || depth >= MAX_DEPTH) {
        if (links.length === 0) console.log('   ⚠️ End of line (Leaf node).');
        else console.log('   🛑 Max depth reached.');

        // If we have links at max depth, save them all as items
        if (links.length > 0 && depth >= MAX_DEPTH) {
            for (const link of links) {
                const fullPath = [...currentPath, link.text];
                if (!isDuplicate(fullPath)) {
                    allData.push({ path: fullPath, url: link.href });
                    console.log(`   ✅ Saved: ${fullPath.join(' > ')}`);
                }
            }
        } 
        // If no links (leaf), save current path
        else if (currentPath.length > 0) {
            if (!isDuplicate(currentPath)) {
                allData.push({ path: currentPath, url: currentUrl });
                console.log(`   ✅ Saved: ${currentPath.join(' > ')}`);
            }
            // ONLY mark LEAF nodes (actual data pages) as visited
            markVisited(currentUrl);
        }
        
        // Save periodically
        if (allData.length % SAVE_INTERVAL === 0) saveState();
        return;
    }

    // --- RECURSIVE STEP ---
    for (const link of links) {
        // Skip specific keywords
        if (['tümü', 'detaylı arama', 'temizle'].includes(link.text.toLowerCase())) continue;

        // Skip if this specific link is already visited
        if (visitedUrls.has(link.href)) {
             // console.log(`   ⏩ Skipping branch: ${link.text}`); // Commented out for speed
             continue; // SUPER FAST SKIP
        }

        // --- START FROM SPECIFIC BRAND LOGIC ---
        // Only apply this logic at Depth 1 (Brands level)
        if (depth === 1 && START_FROM_BRAND && !startBrandFound) {
            if (link.text.trim() === START_FROM_BRAND) {
                console.log(`🎯 Target Brand Found: ${link.text}. Starting scrape...`);
                startBrandFound = true;
            } else {
                // console.log(`⏩ Skipping Brand: ${link.text} (Waiting for ${START_FROM_BRAND})`);
                continue; // Skip this brand
            }
        }

        console.log(`   👉 Clicking: ${link.text}`);
        await updateStatus(`👉 Clicking: ${link.text}<br>Depth: ${depth}`, 'cyan');
        
        try {
            // Human-like: Scroll to element sometimes? (Optional, but good for detection)
            // Navigate
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
                page.goto(link.href)
            ]);
            
            // Random delay after page load (Human reading time)
            await randomSleep(1500, 4000);

            // Recurse
            await scrapeLevel([...currentPath, link.text], depth + 1);

            // Return
            console.log('   ⬅️ Going back...');
            await updateStatus(`⬅️ Going back...`, 'orange');
            
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
                page.goBack()
            ]);
            
            // Random delay after going back
            await randomSleep(1000, 2500);

        } catch (e) {
            console.error(`   ❌ Navigation Error (${link.text}):`, e.message);
            await updateStatus(`❌ Error: ${e.message}`, 'red');
            await randomSleep(5000, 10000); // Wait longer on error
        }
    }
    
    // DO NOT mark parent pages (like 'Hyundai' or 'Accent') as visited.
    // This allows us to re-enter them to find missed children.
    // markVisited(currentUrl); // <-- REMOVED THIS LINE
    saveState();
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
                    
                    if (text && !text.includes('Fiyat') && !text.includes('km')) {
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
    const title = await page.title();
    // Also check body text for specific block messages
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    const isBlocked = title.includes('Just a moment') || 
                      title.includes('Security') || 
                      title.includes('Doğrulama') ||
                      bodyText.includes('olağan dışı erişim') ||
                      bodyText.includes('unusual access');

    if (isBlocked) {
        console.log('\n🛑 SECURITY / IP BLOCK DETECTED!');
        console.log('   Action: Refreshing Page to resolve...');
        await updateStatus('🛑 Block Detected! Refreshing...', 'red');
        
        // Reload Page
        try {
            await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (e) {
            console.log('   Refresh timeout (page might be slow), checking anyway...');
        }
        
        await randomSleep(4000, 7000);

        // Check Again
        const newTitle = await page.title();
        const newBody = await page.evaluate(() => document.body.innerText);
        const stillBlocked = newTitle.includes('Just a moment') || 
                             newTitle.includes('Security') || 
                             newBody.includes('olağan dışı erişim');

        if (stillBlocked) {
            console.log('   ❌ Refresh did not solve it yet.');
            console.log('   ⏳ Waiting 10 seconds before next retry...');
            await updateStatus('❌ Still Blocked. Retrying in 10s...', 'red');
            await randomSleep(10000, 15000);
            // Recursive check (keep trying to refresh)
            return await checkSecurity();
        } else {
            console.log('✅ Security check passed after refresh.');
            console.log('🔄 Triggering Restart...');
            await updateStatus('✅ Solved! Restarting bot...', 'green');
            // Throw special error to trigger main loop restart
            throw 'RESTART_SCRAPER';
        }
    }
    return false;
}

// Human-like random sleep (Increased for safety)
function randomSleep(min, max) {
    // Increase base values slightly to be safer
    const safeMin = min * 1.5;
    const safeMax = max * 1.5;
    const duration = Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
    // Add small micro-variation
    const variation = Math.random() * 200;
    return new Promise(resolve => setTimeout(resolve, duration + variation));
}

// --- PERSISTENCE ---

function loadState() {
    // 1. Load Data
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const workbook = XLSX.readFile(OUTPUT_FILE);
            const sheet = workbook.Sheets['Otomobiller'];
            const rawData = XLSX.utils.sheet_to_json(sheet);
            
            // Convert flat Excel data back to path arrays for checking duplicates
            allData = rawData.map(row => ({
                path: [
                    row['Marka'], 
                    row['Model'], 
                    row['Seri'], 
                    row['Motor/Paket'], 
                    row['Donanım']
                ].filter(Boolean),
                url: row['URL']
            }));
            
            console.log(`📚 Loaded ${allData.length} existing records.`);
        } catch (e) {
            console.log('⚠️ Could not load existing Excel file. Starting fresh.');
        }
    }

    // 2. Load Visited URLs
    if (fs.existsSync(VISITED_FILE)) {
        try {
            const data = fs.readFileSync(VISITED_FILE, 'utf8');
            visitedUrls = new Set(JSON.parse(data));
            console.log(`🗺️ Loaded ${visitedUrls.size} visited pages.`);
        } catch (e) {
            console.log('⚠️ Could not load visited URLs.');
        }
    }
}

function saveState() {
    // 1. Save Visited URLs
    fs.writeFileSync(VISITED_FILE, JSON.stringify([...visitedUrls], null, 2));

    // 2. Save Excel
    if (allData.length === 0) return;

    const flatData = allData.map(item => {
        const row = {};
        // Dynamic columns based on path
        const cols = ['Marka', 'Model', 'Seri', 'Motor/Paket', 'Donanım'];
        item.path.forEach((p, i) => {
            if (i < cols.length) row[cols[i]] = p;
        });
        row['URL'] = item.url;
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Otomobiller");
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`💾 Saved ${allData.length} records.`);
}

function markVisited(url) {
    visitedUrls.add(url);
}

function isDuplicate(pathArray) {
    // Check if this exact path exists in allData
    const pathStr = pathArray.join('>');
    return allData.some(d => d.path.join('>') === pathStr);
}

// --- UI ---
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
                box.style.fontFamily = 'Arial, sans-serif';
                box.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                box.style.minWidth = '250px';
                document.body.appendChild(box);
            }
            box.innerHTML = `<h3 style="margin:0 0 5px 0;color:#00ffff">🤖 Varsagel Bot v2</h3>
                             <div style="font-size:14px;color:${clr}">${msg}</div>`;
        }, text, color);
    } catch (e) {}
}

// Handle User Interrupt (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n🛑 Interrupted by user. Saving...');
    saveState();
    process.exit();
});

main();
