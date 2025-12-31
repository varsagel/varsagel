const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

const OUTPUT_FILE = 'sahibinden_filters_homepage.xlsx';
const HOMEPAGE_URL = 'https://www.sahibinden.com';

let browser;
let page;
let allData = [];

(async () => {
    console.log('🏠 Homepage Category & Filter Crawler Starting...');
    
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

        await page.goto(HOMEPAGE_URL, { waitUntil: 'domcontentloaded' });
        await sleep(3000);

        // Start from homepage categories
        await processHomepageCategories();

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        saveData();
        console.log('👋 Done.');
        if (browser) browser.disconnect();
    }
})();

async function processHomepageCategories() {
    console.log('\n📂 Processing homepage categories...');
    
    // Find main categories in left menu
    const mainCategories = await page.evaluate(() => {
        const categories = [];
        
        // Look for elements containing category names and numbers
        const categoryNames = ['Emlak', 'Vasıta', 'İş', 'Hayvan', 'Alışveriş', 'İkinci El', 'Yedek Parça'];
        
        categoryNames.forEach(name => {
            // Find elements containing this category name
            const xpath = `//*[contains(text(), '${name}')]`;
            const result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            
            for (let i = 0; i < result.snapshotLength; i++) {
                const element = result.snapshotItem(i);
                if (element && element.innerText) {
                    const text = element.innerText.trim();
                    // Look for pattern like "Emlak (1,234,567)"
                    if (text.includes(name) && text.match(/\d{1,3}(?:,\d{3})*/)) {
                        const link = element.closest('a') || element.querySelector('a');
                        categories.push({
                            text: text,
                            href: link ? link.href : null
                        });
                        break; // Take first match
                    }
                }
            }
        });
        
        return categories;
    });
    
    console.log(`Found ${mainCategories.length} main categories`);
    
    // Process each main category
    for (let i = 0; i < mainCategories.length; i++) {
        const category = mainCategories[i];
        console.log(`\n📂 Processing: ${category.text}`);
        
        try {
            // Click or hover to open subcategories
            const opened = await openCategoryMenu(category);
            
            if (opened) {
                await sleep(2000);
                await processSubcategories([category.text]);
            }
            
        } catch (error) {
            console.log(`   ⚠️ Error processing ${category.text}: ${error.message}`);
        }
        
        // Small delay between categories
        await sleep(1000);
    }
}

async function openCategoryMenu(category) {
    return await page.evaluate((categoryText) => {
        // Find the category element by text (match just the category name, not the count)
        const allItems = document.querySelectorAll('li');
        const categoryItem = Array.from(allItems).find(item => {
            const itemText = item.innerText.trim();
            // Look for exact match of category name without the count
            return itemText.startsWith(categoryText.split(' (')[0]);
        });
        
        if (!categoryItem) {
            console.log(`Category item not found: ${categoryText}`);
            return false;
        }
        
        // Try different ways to open the menu
        const link = categoryItem.querySelector('a');
        if (link) {
            // If there's a link, click it
            link.click();
            return true;
        }
        
        // If no link, try clicking the item itself
        categoryItem.click();
        return true;
        
    }, category.text);
}

async function processSubcategories(path) {
    const currentUrl = page.url();
    console.log(`   📍 Current URL: ${currentUrl}`);
    
    // Check if we have filters on this page
    const hasFilters = await checkForFilters();
    
    if (hasFilters) {
        console.log(`   ✅ Filters found, extracting...`);
        await extractFormFields(path.join(' > '));
        return; // This is a leaf node
    }
    
    // Look for subcategories
    const subcategories = await findSubcategories();
    
    if (subcategories.length === 0) {
        console.log(`   ⚠️ No subcategories found`);
        return;
    }
    
    console.log(`   Found ${subcategories.length} subcategories`);
    
    // Process each subcategory
    for (const subcategory of subcategories) {
        console.log(`   👉 Processing: ${subcategory.text}`);
        
        try {
            // Navigate to subcategory
            const success = await navigateToSubcategory(subcategory);
            
            if (success) {
                await sleep(2000);
                await processSubcategories([...path, subcategory.text]);
                
                // Go back to parent level
                await page.goBack();
                await sleep(2000);
            }
            
        } catch (error) {
            console.log(`   ⚠️ Error processing ${subcategory.text}: ${error.message}`);
        }
    }
}

async function findSubcategories() {
    return await page.evaluate(() => {
        const subcategories = [];
        
        // Look for category lists, breadcrumbs, or navigation
        const possibleContainers = [
            '.category-list',
            '.subcategory-list', 
            '.categories',
            '.category-menu',
            '.breadcrumb',
            '.navigation',
            '[class*="category"]',
            '[class*="subcat"]'
        ];
        
        for (const selector of possibleContainers) {
            const container = document.querySelector(selector);
            if (container) {
                const items = container.querySelectorAll('a');
                items.forEach(item => {
                    const text = item.innerText.trim();
                    if (text && text.length > 0) {
                        subcategories.push({
                            text: text,
                            href: item.href,
                            element: item
                        });
                    }
                });
                
                if (subcategories.length > 0) break;
            }
        }
        
        // If no specific container found, look for any links that might be categories
        if (subcategories.length === 0) {
            const allLinks = document.querySelectorAll('a');
            const categoryKeywords = ['emlak', 'vasıta', 'konut', 'daire', 'arsa', 'satılık', 'kiralık'];
            
            allLinks.forEach(link => {
                const text = link.innerText.trim().toLowerCase();
                const href = link.href;
                
                if (text && categoryKeywords.some(keyword => text.includes(keyword))) {
                    subcategories.push({
                        text: link.innerText.trim(),
                        href: href,
                        element: link
                    });
                }
            });
        }
        
        return subcategories;
    });
}

async function navigateToSubcategory(subcategory) {
    return await page.evaluate((subcategoryText) => {
        // Find the subcategory link
        const allLinks = document.querySelectorAll('a');
        const targetLink = Array.from(allLinks).find(link => 
            link.innerText.trim() === subcategoryText
        );
        
        if (targetLink) {
            targetLink.click();
            return true;
        }
        
        return false;
    }, subcategory.text);
}

async function checkForFilters() {
    return await page.evaluate(() => {
        // Look for filter forms, search forms, or filter sections
        const filterSelectors = [
            'form[action*="arama"]',
            '.search-form',
            '.filter-form',
            '.filters',
            '[class*="filter"]',
            '.detailed-search',
            '.search-item',
            'select[name]',
            'input[type="text"][name]'
        ];
        
        for (const selector of filterSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 2) { // Need at least 3 filter elements
                return true;
            }
        }
        
        return false;
    });
}

async function extractFormFields(categoryPath) {
    const fields = await page.evaluate(() => {
        const extracted = [];
        
        // Look for form elements - more comprehensive search
        const formSelectors = [
            'form[action*="arama"]',
            '.search-form',
            '.filter-form', 
            '.filters',
            '.detailed-search',
            '.search-item',
            'table',
            '.form-table',
            '.search-filters'
        ];
        
        let formContainer = null;
        for (const selector of formSelectors) {
            formContainer = document.querySelector(selector);
            if (formContainer) break;
        }
        
        if (!formContainer) {
            // Look for any element with form inputs
            const inputs = document.querySelectorAll('input[name], select[name], textarea[name]');
            if (inputs.length === 0) return [];
            
            // Group inputs by their parent elements
            const parentGroups = new Map();
            inputs.forEach(input => {
                const parent = input.closest('tr, .search-item, .form-group, .field-group') || input.parentElement;
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
                    extracted.push({
                        name: name,
                        type: type,
                        options: options.slice(0, 50).join(', ')
                    });
                }
            });
            
            return extracted;
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
                extracted.push({
                    name: name,
                    type: type,
                    options: options.slice(0, 50).join(', ') // Limit options
                });
            }
        });
        
        return extracted;
    });

    if (fields.length > 0) {
        console.log(`   ✅ Found ${fields.length} filter fields`);
        fields.forEach(f => {
            allData.push({ Category: categoryPath, ...f });
        });
        saveData();
    } else {
        console.log(`   ⚠️ No filter fields found`);
    }
}

function saveData() {
    if (allData.length === 0) return;
    
    const ws = XLSX.utils.json_to_sheet(allData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filters");
    XLSX.writeFile(wb, OUTPUT_FILE);
    
    console.log(`💾 Saved ${allData.length} records to ${OUTPUT_FILE}`);
}

function sleep(ms) { 
    return new Promise(r => setTimeout(r, ms)); 
}