const puppeteer = require('puppeteer');
const fs = require('fs');
const XLSX = require('xlsx');

async function run() {
    try {
        const browser = await puppeteer.connect({ 
            browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser',
            defaultViewport: null 
        });
        
        const page = await browser.newPage();
        
        // Handle page errors
        page.on('pageerror', error => {
            console.log('Page error:', error.message);
        });
        
        console.log('🏠 Sahibinden Homepage Filter Extractor Starting...');
        
        // Initialize data storage
        let allData = [];
        const dataFile = 'sahibinden_filters_homepage.xlsx';
        
        // Load existing data if available
        if (fs.existsSync(dataFile)) {
            try {
                const workbook = XLSX.readFile(dataFile);
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                allData = XLSX.utils.sheet_to_json(sheet);
                console.log(`📚 Loaded ${allData.length} existing records.`);
            } catch (e) {
                console.log('📄 Starting fresh data file.');
            }
        }
        
        // Save data function
        function saveData() {
            try {
                const worksheet = XLSX.utils.json_to_sheet(allData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtreler');
                XLSX.writeFile(workbook, dataFile);
                console.log(`💾 Saved ${allData.length} records to ${dataFile}`);
            } catch (e) {
                console.log('❌ Error saving data:', e.message);
            }
        }
        
        await page.goto('https://www.sahibinden.com/', { waitUntil: 'domcontentloaded' });
        
        // Wait for page to load
        await page.waitForTimeout(3000);
        
        console.log('📂 Analyzing homepage structure...');
        
        // Get page structure
        const structure = await page.evaluate(() => {
            const info = {
                title: document.title,
                url: window.location.href,
                categories: []
            };
            
            // Look for all text that contains category names and numbers
            const allText = document.body.innerText;
            const lines = allText.split('\n').filter(line => line.trim().length > 0);
            
            lines.forEach(line => {
                const trimmed = line.trim();
                // Look for patterns like "Emlak (1,234,567)" or "Vasıta 750,108"
                const match = trimmed.match(/^(Emlak|Vasıta|İş|Hayvan|Alışveriş|İkinci El|Yedek Parça|İş Makineleri|Ustalar|Özel Ders|İş İlanları|Yardımcı|Yepyyeni)\s*[\(\s]*(\d{1,3}(?:,\d{3})*)[\)\s]*$/);
                
                if (match) {
                    info.categories.push({
                        name: match[1],
                        count: match[2],
                        fullText: trimmed
                    });
                }
            });
            
            return info;
        });
        
        console.log(`Found ${structure.categories.length} categories on homepage:`);
        structure.categories.forEach(cat => {
            console.log(`- ${cat.name}: ${cat.count} ilan`);
        });
        
        // Process each category
        for (const category of structure.categories) {
            try {
                console.log(`\n📂 Processing: ${category.name}`);
                
                // Find and click the category link
                const clicked = await page.evaluate((catName) => {
                    // Find element containing the category name and count
                    const xpath = `//*[contains(text(), '${catName}')]`;
                    const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    
                    for (let i = 0; i < result.snapshotLength; i++) {
                        const element = result.snapshotItem(i);
                        if (element) {
                            // Try to find a clickable parent or the element itself
                            let clickable = element;
                            let maxDepth = 3;
                            
                            while (maxDepth > 0 && clickable) {
                                if (clickable.tagName === 'A' || clickable.querySelector('a')) {
                                    const link = clickable.tagName === 'A' ? clickable : clickable.querySelector('a');
                                    if (link.href && link.href.includes('/kategori/')) {
                                        window.location.href = link.href;
                                        return true;
                                    }
                                }
                                clickable = clickable.parentElement;
                                maxDepth--;
                            }
                        }
                    }
                    return false;
                }, category.name);
                
                if (clicked) {
                    // Wait for navigation
                    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
                    await page.waitForTimeout(2000);
                    
                    console.log(`   📍 Navigated to: ${page.url()}`);
                    
                    // Extract filters from this page
                    const filters = await extractFiltersFromPage(page, category.name);
                    
                    if (filters.length > 0) {
                        console.log(`   ✅ Found ${filters.length} filters`);
                        filters.forEach(filter => {
                            allData.push({
                                Category: category.name,
                                Filter: filter.name,
                                Type: filter.type,
                                Options: filter.options
                            });
                        });
                        saveData();
                    } else {
                        console.log(`   ⚠️ No filters found`);
                    }
                    
                    // Go back to homepage
                    await page.goto('https://www.sahibinden.com/', { waitUntil: 'domcontentloaded' });
                    await page.waitForTimeout(2000);
                    
                } else {
                    console.log(`   ❌ Could not find clickable link for ${category.name}`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error processing ${category.name}:`, error.message);
            }
        }
        
        console.log('\n👋 Done.');
        await browser.close();
        
    } catch (error) {
        console.log('❌ Script error:', error.message);
    }
}

async function extractFiltersFromPage(page, categoryName) {
    return await page.evaluate((catName) => {
        const filters = [];
        
        // Look for form elements
        const formSelectors = [
            'form[action*="arama"]',
            '.search-form',
            '.filter-form', 
            '.filters',
            '.detailed-search',
            '.search-item',
            'table',
            '.form-table',
            '.search-filters',
            '.category-selection-wrapper'
        ];
        
        let formContainer = null;
        for (const selector of formSelectors) {
            formContainer = document.querySelector(selector);
            if (formContainer) break;
        }
        
        // If no form container, look for any inputs with names
        if (!formContainer) {
            const inputs = document.querySelectorAll('input[name], select[name], textarea[name]');
            if (inputs.length === 0) return [];
            
            // Group inputs by their parent elements
            const parentGroups = new Map();
            inputs.forEach(input => {
                const parent = input.closest('tr, .search-item, .form-group, .field-group, .filter-item') || input.parentElement;
                if (!parentGroups.has(parent)) parentGroups.set(parent, []);
                parentGroups.get(parent).push(input);
            });
            
            parentGroups.forEach((inputs, parent) => {
                const label = parent.querySelector('label, .label, .field-name, td:first-child') || 
                             document.querySelector(`label[for="${inputs[0].id}"]`);
                
                const name = label ? label.innerText.trim().replace(':', '') : inputs[0].name || inputs[0].placeholder || 'Unknown';
                let type = 'Input';
                let options = [];
                
                if (inputs[0].tagName === 'SELECT') {
                    type = 'Select';
                    Array.from(inputs[0].options).forEach(o => {
                        if (o.innerText.trim() !== 'Seçiniz' && o.innerText.trim() !== '') {
                            options.push(o.innerText.trim());
                        }
                    });
                } else if (inputs[0].type === 'checkbox') {
                    type = 'Checkbox';
                } else if (inputs[0].type === 'radio') {
                    type = 'Radio';
                } else if (inputs[0].type === 'text' && inputs.length === 2) {
                    type = 'Price Range';
                    options = ['Min', 'Max'];
                }
                
                if (name && name.length > 0) {
                    filters.push({
                        name: name,
                        type: type,
                        options: options.slice(0, 50).join(', ')
                    });
                }
            });
            
            return filters;
        }
        
        // Process form rows
        const formRows = formContainer.querySelectorAll('tr, .search-item, .filter-item, .form-row, .form-group');
        
        formRows.forEach(row => {
            const label = row.querySelector('label, .field-name, .label, td:first-child');
            if (!label) return;
            
            const name = label.innerText.trim().replace(':', '');
            let type = 'Text/Select';
            let options = [];

            // Check for inputs
            if (row.querySelector('input[type="text"]')) type = 'Input';
            if (row.querySelector('input[type="checkbox"]')) type = 'Checkbox';
            if (row.querySelector('input[type="radio"]')) type = 'Radio';
            
            // Check for selects
            const select = row.querySelector('select');
            if (select) {
                type = 'Select';
                Array.from(select.options).forEach(o => {
                    if (o.innerText.trim() !== 'Seçiniz' && o.innerText.trim() !== '') {
                        options.push(o.innerText.trim());
                    }
                });
            }
            
            // Check for ul/li lists (custom dropdowns)
            const ul = row.querySelector('ul');
            if (ul) {
                type = 'List';
                ul.querySelectorAll('li').forEach(li => {
                    const text = li.innerText.trim();
                    if (text && text !== '') options.push(text);
                });
            }

            // Check for price ranges
            const priceInputs = row.querySelectorAll('input[type="text"]');
            if (priceInputs.length === 2) {
                type = 'Price Range';
                options = ['Min', 'Max'];
            }

            if (name && name.length > 0) {
                filters.push({
                    name: name,
                    type: type,
                    options: options.slice(0, 50).join(', ') // Limit options
                });
            }
        });
        
        return filters;
    }, categoryName);
}

// Run the script
run();