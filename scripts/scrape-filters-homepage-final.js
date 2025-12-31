const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🏠 Sahibinden Homepage Category & Filter Scraper');

// Configuration
const CONFIG = {
    maxDepth: 6,
    delay: { min: 2000, max: 5000 },
    excelFile: 'sahibinden_filters_homepage.xlsx',
    progressFile: 'sahibinden_progress_homepage.json',
    websocketUrl: 'ws://127.0.0.1:9222/devtools/browser/3cbb933a-d1a6-4cb5-bd43-42fe2d1445dd'
};

// Random delay function
function randomDelay() {
    return Math.floor(Math.random() * (CONFIG.delay.max - CONFIG.delay.min + 1)) + CONFIG.delay.min;
}

// Wait function (replacement for page.waitForTimeout)
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load progress
function loadProgress() {
    try {
        if (fs.existsSync(CONFIG.progressFile)) {
            return JSON.parse(fs.readFileSync(CONFIG.progressFile, 'utf8'));
        }
    } catch (error) {
        console.log('No previous progress found, starting fresh');
    }
    return {
        mainCategories: [],
        completedCategories: [],
        currentDepth: 0,
        totalFilters: 0
    };
}

// Save progress
function saveProgress(progress) {
    try {
        fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
        console.log(`Progress saved: ${progress.completedCategories.length} categories completed`);
    } catch (error) {
        console.log('Failed to save progress:', error.message);
    }
}

// Save to Excel
function saveToExcel(data) {
    try {
        let workbook;
        let existingData = [];
        
        // Check if Excel file exists and read existing data
        if (fs.existsSync(CONFIG.excelFile)) {
            try {
                workbook = XLSX.readFile(CONFIG.excelFile);
                if (workbook.Sheets['Filters']) {
                    existingData = XLSX.utils.sheet_to_json(workbook.Sheets['Filters']);
                }
            } catch (err) {
                console.log('Could not read existing Excel file, creating new one');
            }
        }
        
        // If no existing workbook, create new one
        if (!workbook) {
            workbook = XLSX.utils.book_new();
        }
        
        // Convert new data to worksheet format
        const newWorksheetData = data.map(item => ({
            'Main Category': item.mainCategory,
            'Sub Category': item.subCategory,
            'Depth': item.depth,
            'Filter Name': item.filterName,
            'Filter Type': item.filterType,
            'Filter Options': item.filterOptions,
            'URL': item.url,
            'Timestamp': new Date().toISOString()
        }));
        
        // Combine existing and new data
        const allData = [...existingData, ...newWorksheetData];
        
        // Create new worksheet with all data
        const worksheet = XLSX.utils.json_to_sheet(allData);
        
        // Update workbook with combined data
        workbook.Sheets['Filters'] = worksheet;
        
        // Write to file
        XLSX.writeFile(workbook, CONFIG.excelFile);
        console.log(`✅ Saved ${newWorksheetData.length} new filters to ${CONFIG.excelFile} (Total: ${allData.length})`);
        
    } catch (error) {
        console.log('❌ Failed to save Excel:', error.message);
        console.log('Error details:', error.stack);
    }
}

// Extract filters from page
async function extractFiltersFromPage(page, categoryName, subCategoryName, depth, url) {
    const filters = [];
    
    try {
        console.log(`🔍 Extracting filters from: ${categoryName} > ${subCategoryName}`);
        
        // Wait for page to load
        await wait(randomDelay());
        
        // Look for filter forms
        const filterSelectors = [
            'form[action*="/arama"]',
            '.search-form',
            '.filter-form',
            '.advanced-search',
            '[class*="filter"]',
            '[class*="search"]',
            '.form-container',
            '.search-container'
        ];
        
        for (const selector of filterSelectors) {
            const forms = await page.$$(selector);
            
            for (const form of forms) {
                try {
                    const formData = await page.evaluate((formElement) => {
                        const inputs = formElement.querySelectorAll('input, select, textarea');
                        const formInfo = {
                            filterName: '',
                            filterType: '',
                            filterOptions: [],
                            formHTML: formElement.outerHTML.slice(0, 500) // First 500 chars
                        };
                        
                        // Get form title or nearby text
                        const titleElement = formElement.closest('[class*="container"], [class*="section"], [class*="box"]')?.querySelector('h1, h2, h3, .title, .heading');
                        formInfo.filterName = titleElement?.innerText || 'Unknown Filter';
                        
                        inputs.forEach(input => {
                            const inputInfo = {
                                name: input.name || input.id || input.placeholder || 'Unknown',
                                type: input.type || input.tagName.toLowerCase(),
                                options: []
                            };
                            
                            // For select elements, get options
                            if (input.tagName.toLowerCase() === 'select') {
                                const options = input.querySelectorAll('option');
                                inputInfo.options = Array.from(options).map(opt => opt.innerText.trim()).filter(text => text && text !== 'Seçiniz');
                            }
                            
                            // For other inputs, get placeholder or value
                            else if (input.placeholder) {
                                inputInfo.options.push(input.placeholder);
                            } else if (input.value) {
                                inputInfo.options.push(input.value);
                            }
                            
                            formInfo.filterOptions.push(inputInfo);
                        });
                        
                        return formInfo;
                    }, form);
                    
                    if (formData.filterOptions.length > 0) {
                        filters.push({
                            mainCategory: categoryName,
                            subCategory: subCategoryName,
                            depth: depth,
                            filterName: formData.filterName,
                            filterType: 'Form',
                            filterOptions: JSON.stringify(formData.filterOptions),
                            url: url,
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                } catch (error) {
                    console.log(`Error processing form: ${error.message}`);
                }
            }
        }
        
        // Look for filter groups (checkboxes, radio buttons)
        const filterGroupSelectors = [
            '.filter-group',
            '.checkbox-group',
            '.radio-group',
            '.option-group',
            '[class*="filter"] [class*="group"]'
        ];
        
        for (const selector of filterGroupSelectors) {
            const groups = await page.$$(selector);
            
            for (const group of groups) {
                try {
                    const groupData = await page.evaluate((groupElement) => {
                        const titleElement = groupElement.querySelector('h1, h2, h3, h4, .title, .heading, .label') || 
                                           groupElement.previousElementSibling?.querySelector('h1, h2, h3, h4, .title, .heading, .label');
                        
                        const checkboxes = groupElement.querySelectorAll('input[type="checkbox"]');
                        const radios = groupElement.querySelectorAll('input[type="radio"]');
                        
                        const options = [];
                        
                        checkboxes.forEach(cb => {
                            const label = cb.closest('label') || document.querySelector(`label[for="${cb.id}"]`);
                            if (label) {
                                options.push(label.innerText.trim());
                            }
                        });
                        
                        radios.forEach(radio => {
                            const label = radio.closest('label') || document.querySelector(`label[for="${radio.id}"]`);
                            if (label) {
                                options.push(label.innerText.trim());
                            }
                        });
                        
                        return {
                            name: titleElement?.innerText || 'Unknown Filter Group',
                            type: checkboxes.length > 0 ? 'Checkbox' : 'Radio',
                            options: options
                        };
                    }, group);
                    
                    if (groupData.options.length > 0) {
                        filters.push({
                            mainCategory: categoryName,
                            subCategory: subCategoryName,
                            depth: depth,
                            filterName: groupData.name,
                            filterType: groupData.type,
                            filterOptions: JSON.stringify(groupData.options),
                            url: url,
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                } catch (error) {
                    console.log(`Error processing filter group: ${error.message}`);
                }
            }
        }
        
        console.log(`✅ Found ${filters.length} filters`);
        return filters;
        
    } catch (error) {
        console.log(`❌ Error extracting filters: ${error.message}`);
        return [];
    }
}

// Get main categories from homepage
async function getMainCategories(page) {
    try {
        console.log('🔍 Getting main categories from homepage...');
        
        const categories = await page.evaluate(() => {
            const categoryLinks = [];
            
            // Look for main category links
            const selectors = [
                'a[href*="/kategori/"]',
                'a[href*="/emlak/"]',
                'a[href*="/vasita/"]',
                'a[href*="/is-makineleri/"]',
                'a[href*="/hayvanlar/"]',
                'a[href*="/alisveris/"]',
                'a[href*="/ikinci-el-ve-sifir-alisveris/"]',
                'a[href*="/yedek-parca-aksesuar-donanim-tuning/"]',
                'a[href*="/is-ilanlari/"]',
                'a[href*="/hizmet-ilanlari/"]',
                'a[href*="/ozel-ders-ve-kurs-ilanlari/"]',
                'a[href*="/yardimci-arayanlar/"]',
                'a[href*="/yepyeni-urunler/"]'
            ];
            
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.innerText.trim();
                    if (text && text.length > 0 && text.length < 100) { // Reasonable text length
                        categoryLinks.push({
                            name: text,
                            url: el.href,
                            selector: selector
                        });
                    }
                });
            });
            
            return categoryLinks;
        });
        
        console.log(`Found ${categories.length} main categories`);
        return categories;
        
    } catch (error) {
        console.log(`❌ Error getting main categories: ${error.message}`);
        return [];
    }
}

// Process category recursively
async function processCategory(page, category, depth = 0, parentName = '') {
    if (depth > CONFIG.maxDepth) {
        console.log(`Max depth reached for ${category.name}`);
        return [];
    }
    
    const categoryName = parentName ? `${parentName} > ${category.name}` : category.name;
    console.log(`\n📂 Processing: ${categoryName} (Depth: ${depth})`);
    
    try {
        // Navigate to category
        await page.goto(category.url, { waitUntil: 'networkidle2' });
        await wait(randomDelay());
        
        // Extract filters from current page
        const filters = await extractFiltersFromPage(page, parentName || category.name, category.name, depth, page.url());
        
        // Look for subcategories
        const subcategories = await page.evaluate(() => {
            const subs = [];
            
            // Look for subcategory links
            const subSelectors = [
                'a[href*="/kategori/"]',
                'a[href*="/emlak/"]',
                'a[href*="/vasita/"]',
                '.subcategory a',
                '.category-list a',
                '[class*="sub"] a',
                '[class*="child"] a'
            ];
            
            subSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = el.innerText.trim();
                    if (text && text.length > 0 && text.length < 100) {
                        subs.push({
                            name: text,
                            url: el.href
                        });
                    }
                });
            });
            
            return subs;
        });
        
        console.log(`Found ${subcategories.length} subcategories`);
        
        // Process subcategories recursively
        for (const subcategory of subcategories) {
            const subFilters = await processCategory(page, subcategory, depth + 1, categoryName);
            filters.push(...subFilters);
        }
        
        return filters;
        
    } catch (error) {
        console.log(`❌ Error processing category ${categoryName}: ${error.message}`);
        return [];
    }
}

// Main function
async function main() {
    let browser;
    
    try {
        console.log('🏠 Starting Sahibinden Homepage Category & Filter Scraper...');
        
        // Load progress
        const progress = loadProgress();
        console.log(`Progress loaded: ${progress.completedCategories.length} categories completed`);
        
        // Connect to browser
        console.log('Connecting to browser...');
        browser = await puppeteer.connect({ 
            browserWSEndpoint: CONFIG.websocketUrl,
            defaultViewport: null 
        });
        
        const page = await browser.newPage();
        
        // Navigate to homepage
        console.log('Navigating to homepage...');
        await page.goto('https://www.sahibinden.com', { waitUntil: 'networkidle2' });
        await wait(randomDelay());
        
        // Get main categories
        const mainCategories = await getMainCategories(page);
        console.log(`\n🎯 Found ${mainCategories.length} main categories to process`);
        
        // Process each main category
        let allFilters = [];
        let processedCount = 0;
        
        for (const category of mainCategories) {
            // Skip if already completed
            if (progress.completedCategories.includes(category.name)) {
                console.log(`Skipping completed category: ${category.name}`);
                continue;
            }
            
            console.log(`\n🔄 Processing main category: ${category.name}`);
            
            try {
                const filters = await processCategory(page, category);
                
                if (filters.length > 0) {
                    allFilters.push(...filters);
                    progress.totalFilters += filters.length;
                    console.log(`✅ Found ${filters.length} filters for ${category.name}`);
                }
                
                // Mark as completed
                progress.completedCategories.push(category.name);
                processedCount++;
                
                // Save to Excel every 10 categories to avoid memory issues
                if (processedCount % 10 === 0 && allFilters.length > 0) {
                    saveToExcel(allFilters);
                    allFilters = []; // Clear array after saving
                    console.log(`💾 Saved batch to Excel, continuing...`);
                }
                
                saveProgress(progress);
                
            } catch (error) {
                console.log(`❌ Error processing ${category.name}: ${error.message}`);
            }
            
            // Random delay between categories
            await wait(randomDelay());
        }
        
        // Save any remaining filters
        if (allFilters.length > 0) {
            saveToExcel(allFilters);
            console.log(`💾 Saved final batch to Excel`);
        }
        
        console.log('\n🎉 Scraping completed!');
        console.log(`Total filters extracted: ${progress.totalFilters}`);
        console.log(`Categories processed: ${progress.completedCategories.length}`);
        
        // Create summary report if Excel file exists
        if (fs.existsSync(CONFIG.excelFile)) {
            createSummaryReport();
        }
        
    } catch (error) {
        console.log('❌ Main error:', error.message);
        console.log(error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Create summary report
function createSummaryReport() {
    try {
        const progress = loadProgress();
        const workbook = XLSX.readFile(CONFIG.excelFile);
        const allFilters = XLSX.utils.sheet_to_json(workbook.Sheets['Filters']);
        
        // Group by main category
        const categoryStats = {};
        allFilters.forEach(filter => {
            const mainCat = filter['Main Category'];
            if (!categoryStats[mainCat]) {
                categoryStats[mainCat] = 0;
            }
            categoryStats[mainCat]++;
        });
        
        // Create summary data
        const summaryData = Object.entries(categoryStats).map(([category, count]) => ({
            'Category': category,
            'Filter Count': count
        }));
        
        // Add total row
        summaryData.push({
            'Category': 'TOTAL',
            'Filter Count': allFilters.length
        });
        
        // Create summary worksheet
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        workbook.Sheets['Summary'] = summaryWorksheet;
        
        // Write updated workbook
        XLSX.writeFile(workbook, CONFIG.excelFile);
        
        console.log('\n📊 SUMMARY REPORT CREATED');
        console.log(`Total Categories: ${Object.keys(categoryStats).length}`);
        console.log(`Total Filters: ${allFilters.length}`);
        console.log(`Average Filters per Category: ${Math.round(allFilters.length / Object.keys(categoryStats).length)}`);
        
    } catch (error) {
        console.log('Failed to create summary report:', error.message);
    }
}

// Run the scraper
main().catch(console.error);