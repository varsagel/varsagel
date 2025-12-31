const puppeteer = require('puppeteer');

(async () => {
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
        
        await page.goto('https://www.sahibinden.com/', { waitUntil: 'domcontentloaded' });
        
        // Find all category menu structures
        const structures = await page.evaluate(() => {
            const results = [];
            
            // Look for left sidebar menu
            const leftSidebar = document.querySelector('.categories-left-menu, .left-menu, .sidebar, .category-menu, .category-list');
            if (leftSidebar) {
                results.push({
                    location: 'Left Sidebar',
                    selector: leftSidebar.tagName + (leftSidebar.className ? '.' + leftSidebar.className.split(' ').join('.') : ''),
                    innerHTML: leftSidebar.innerHTML.substring(0, 500),
                    categories: Array.from(leftSidebar.querySelectorAll('li')).map(li => ({
                        text: li.innerText.trim(),
                        link: li.querySelector('a') ? li.querySelector('a').href : 'no-link',
                        hasSubmenu: !!li.querySelector('ul')
                    }))
                });
            }
            
            // Look for any UL with category-like items
            const allULs = document.querySelectorAll('ul');
            allULs.forEach((ul, index) => {
                const items = Array.from(ul.querySelectorAll('li')).map(li => li.innerText.trim());
                const hasCategoryKeywords = items.some(text => 
                    text.includes('Emlak') || text.includes('Vasıta') || text.includes('İş') || 
                    text.includes('Hayvan') || text.includes('Alışveriş')
                );
                
                if (hasCategoryKeywords) {
                    results.push({
                        location: `UL #${index + 1}`,
                        selector: ul.tagName + (ul.className ? '.' + ul.className.split(' ').join('.') : ''),
                        categories: items.slice(0, 10) // First 10 items
                    });
                }
            });
            
            return results;
        }).catch(err => {
            console.log('Evaluation error:', err.message);
            return [];
        });
        
        console.log('Found category structures:');
        structures.forEach((struct, i) => {
            console.log(`\n${i + 1}. ${struct.location} - ${struct.selector}`);
            if (struct.categories) {
                console.log('Categories:', struct.categories.slice(0, 5).map(c => c.text || c).join(', '));
            }
        });
        
        // Take screenshot for visual reference
        await page.screenshot({ path: 'homepage-categories.png', fullPage: true });
        console.log('\nScreenshot saved as homepage-categories.png');
        
        await browser.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
})();