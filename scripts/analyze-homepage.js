const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.connect({ 
        browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser',
        defaultViewport: null 
    });
    
    const page = await browser.newPage();
    
    console.log('Navigating to Sahibinden homepage...');
    await page.goto('https://www.sahibinden.com/', { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);
    
    // Get all visible text content to find categories
    const pageContent = await page.evaluate(() => {
        const allText = document.body.innerText;
        const lines = allText.split('\n').filter(line => line.trim().length > 0);
        
        // Look for category patterns
        const categoryPatterns = [
            /Emlak.*\d+/,
            /Vasıta.*\d+/,
            /İş.*\d+/,
            /Hayvan.*\d+/,
            /Alışveriş.*\d+/,
            /İkinci.*\d+/,
            /Yedek.*\d+/
        ];
        
        const categories = [];
        lines.forEach(line => {
            categoryPatterns.forEach(pattern => {
                if (pattern.test(line.trim())) {
                    categories.push(line.trim());
                }
            });
        });
        
        return {
            categories: [...new Set(categories)], // Remove duplicates
            totalLines: lines.length,
            sampleLines: lines.slice(0, 20)
        };
    });
    
    console.log('Found categories in page text:');
    pageContent.categories.forEach(cat => console.log(`- ${cat}`));
    
    console.log('\nSample page lines:');
    pageContent.sampleLines.forEach(line => console.log(`- ${line}`));
    
    // Look for specific category menu elements
    const menuElements = await page.evaluate(() => {
        const elements = [];
        
        // Find elements containing category text
        const categoryTexts = ['Emlak', 'Vasıta', 'İş', 'Hayvan', 'Alışveriş'];
        
        categoryTexts.forEach(text => {
            const xpath = `//*[contains(text(), '${text}')]`;
            const results = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            
            for (let i = 0; i < results.snapshotLength; i++) {
                const element = results.snapshotItem(i);
                if (element && element.tagName) {
                    elements.push({
                        tag: element.tagName,
                        className: element.className,
                        text: element.innerText || element.textContent,
                        href: element.href || '',
                        parentTag: element.parentElement ? element.parentElement.tagName : '',
                        parentClass: element.parentElement ? element.parentElement.className : ''
                    });
                }
            }
        });
        
        return elements;
    });
    
    console.log('\nFound category elements:');
    menuElements.forEach(el => {
        console.log(`- ${el.tag}.${el.className} | Text: "${el.text.substring(0, 50)}..." | Parent: ${el.parentTag}.${el.parentClass}`);
    });
    
    // Take screenshot
    await page.screenshot({ path: 'homepage-analysis.png', fullPage: true });
    console.log('\nScreenshot saved as homepage-analysis.png');
    
    await browser.close();
})();