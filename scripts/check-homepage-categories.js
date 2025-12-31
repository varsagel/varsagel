const puppeteer = require('puppeteer-core');

const CONFIG = {
    websocketUrl: 'ws://127.0.0.1:9222/devtools/browser/e5a58dc4-a859-47e1-a315-4e5741325fd9'
};

async function checkHomepageCategories() {
    let browser;
    
    try {
        console.log('Connecting to browser...');
        browser = await puppeteer.connect({
            browserWSEndpoint: CONFIG.websocketUrl,
            defaultViewport: null
        });
        
        const page = await browser.newPage();
        
        console.log('Navigating to homepage...');
        await page.goto('https://www.sahibinden.com', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for page to load and take a screenshot to see the structure
        await page.waitForTimeout(5000);
        
        // Take screenshot for debugging
        await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
        
        console.log('Extracting all categories...');
        const categories = await page.evaluate(() => {
            // Try multiple selectors to find categories
            const selectors = [
                '.category-item a',
                '.category-list-item a', 
                '[data-category] a',
                'a[href*="kategori"]',
                'a[href*="/category/"]',
                '.navigation a',
                'nav a',
                '.sidebar a',
                '.menu a',
                '.dropdown-menu a'
            ];
            
            const categoryElements = [];
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    if (!categoryElements.includes(el)) {
                        categoryElements.push(el);
                    }
                });
            });
            
            return Array.from(categoryElements).map(element => ({
                name: element.textContent.trim(),
                href: element.href,
                visible: element.offsetParent !== null,
                tagName: element.tagName,
                className: element.className
            })).filter(cat => cat.name && cat.name.length > 0 && cat.name.length < 100);
        });
        
        console.log(`Found ${categories.length} total categories on homepage:`);
        categories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat.name} - ${cat.href} ${cat.visible ? '(visible)' : '(hidden)'}`);
        });
        
        // Check for subcategories
        console.log('\nChecking for subcategories in main categories...');
        for (let i = 0; i < Math.min(3, categories.length); i++) {
            const category = categories[i];
            if (category.href && category.href.includes('sahibinden.com')) {
                try {
                    await page.goto(category.href, { waitUntil: 'networkidle2', timeout: 10000 });
                    await page.waitForTimeout(2000);
                    
                    const subcategories = await page.evaluate(() => {
                        const subElements = document.querySelectorAll('.sub-category-list a, .category-submenu a, .category-item a');
                        return Array.from(subElements).map(el => ({
                            name: el.textContent.trim(),
                            href: el.href
                        })).filter(sub => sub.name && sub.name.length > 0);
                    });
                    
                    console.log(`\n${category.name} has ${subcategories.length} subcategories:`);
                    subcategories.slice(0, 5).forEach((sub, idx) => {
                        console.log(`  ${idx + 1}. ${sub.name}`);
                    });
                    if (subcategories.length > 5) {
                        console.log(`  ... and ${subcategories.length - 5} more`);
                    }
                } catch (error) {
                    console.log(`Could not check ${category.name}: ${error.message}`);
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

checkHomepageCategories();