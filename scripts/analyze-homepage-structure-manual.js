const puppeteer = require('puppeteer');

console.log('🔍 Sahibinden Homepage Structure Analyzer - Manual Mode');

(async () => {
    try {
        console.log('Connecting to browser...');
        const browser = await puppeteer.connect({ 
            browserWSEndpoint: 'ws://127.0.0.1:9222/devtools/browser/30b9f910-447d-4b78-a3c7-9e9c9f860435',
            defaultViewport: null 
        });
        
        console.log('Creating new page...');
        const page = await browser.newPage();
        
        console.log('📋 Instructions:');
        console.log('1. Chrome penceresinde sahibinden.com açılmış olmalı');
        console.log('2. Eğer güvenlik kontrolü varsa, lütfen manuel olarak geçin');
        console.log('3. Ana sayfa tamamen yüklendikten sonra ENTER tuşuna basın');
        
        // Wait for user confirmation
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        await new Promise(resolve => {
            rl.question('\nAna sayfa yüklendi mi? (ENTER tuşuna basın)', resolve);
        });
        rl.close();
        
        console.log('📂 Analyzing homepage structure...');
        
        // Get comprehensive page structure
        const structure = await page.evaluate(() => {
            const info = {
                title: document.title,
                url: window.location.href,
                categories: [],
                allLinks: [],
                sidebarElements: [],
                categoryPatterns: [],
                mainContent: document.body.innerText.slice(0, 1000) // First 1000 chars
            };
            
            // Look for sidebar/menu elements
            const sidebarSelectors = [
                '.category-nav',
                '.sidebar',
                '.left-nav',
                '.navigation',
                '.menu',
                '.categories',
                '.main-categories',
                '.category-list',
                '.nav-menu',
                '.left-menu',
                '.category-menu',
                '.main-menu',
                '.nav',
                '.navbar',
                '.category-links'
            ];
            
            sidebarSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    info.sidebarElements.push({
                        selector: selector,
                        count: elements.length,
                        text: Array.from(elements).map(el => el.innerText.trim()).slice(0, 2)
                    });
                }
            });
            
            // Look for all links containing category keywords
            const allLinks = document.querySelectorAll('a');
            const categoryKeywords = ['Emlak', 'Vasıta', 'İş', 'Hayvan', 'Alışveriş', 'İkinci El', 'Yedek Parça', 'İş Makineleri', 'Ustalar', 'Özel Ders', 'İş İlanları', 'Yardımcı', 'Yepyyeni'];
            
            allLinks.forEach(link => {
                const text = link.innerText.trim();
                const href = link.href;
                
                categoryKeywords.forEach(keyword => {
                    if (text.includes(keyword)) {
                        info.allLinks.push({
                            text: text,
                            href: href,
                            keyword: keyword
                        });
                    }
                });
            });
            
            // Look for all text lines
            const allText = document.body.innerText;
            const lines = allText.split('\n').filter(line => line.trim().length > 0);
            
            // Look for category patterns in text
            lines.forEach(line => {
                const trimmed = line.trim();
                
                // Pattern 1: "Emlak (1,234,567)"
                const pattern1 = trimmed.match(/^(Emlak|Vasıta|İş|Hayvan|Alışveriş|İkinci El|Yedek Parça|İş Makineleri|Ustalar|Özel Ders|İş İlanları|Yardımcı|Yepyyeni)\s*[\(\s]*(\d{1,3}(?:,\d{3})*)[\)\s]*$/);
                
                if (pattern1) {
                    info.categoryPatterns.push({
                        pattern: 'pattern1',
                        name: pattern1[1],
                        count: pattern1[2],
                        fullText: trimmed
                    });
                }
                
                // Pattern 2: "Emlak 1,234,567 ilan"
                const pattern2 = trimmed.match(/^(Emlak|Vasıta|İş|Hayvan|Alışveriş|İkinci El|Yedek Parça|İş Makineleri|Ustalar|Özel Ders|İş İlanları|Yardımcı|Yepyyeni)\s+(\d{1,3}(?:,\d{3})*)\s+ilan/);
                
                if (pattern2) {
                    info.categoryPatterns.push({
                        pattern: 'pattern2',
                        name: pattern2[1],
                        count: pattern2[2],
                        fullText: trimmed
                    });
                }
            });
            
            // Look for specific category sections
            const categorySelectors = [
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
            
            categorySelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    elements.forEach(el => {
                        info.categories.push({
                            selector: selector,
                            text: el.innerText.trim(),
                            href: el.href
                        });
                    });
                }
            });
            
            return info;
        });
        
        console.log('\n=== ANALYSIS RESULTS ===');
        console.log(`Title: ${structure.title}`);
        console.log(`URL: ${structure.url}`);
        
        console.log('\n--- Main Content Preview ---');
        console.log(structure.mainContent);
        
        console.log('\n--- Sidebar Elements ---');
        structure.sidebarElements.forEach(el => {
            console.log(`Selector: ${el.selector}, Count: ${el.count}`);
            el.text.forEach((text, i) => console.log(`  Text ${i+1}: ${text}`));
        });
        
        console.log('\n--- Category Links ---');
        structure.allLinks.slice(0, 15).forEach(link => {
            console.log(`Text: "${link.text}" | Href: ${link.href} | Keyword: ${link.keyword}`);
        });
        
        console.log(`\nFound ${structure.allLinks.length} category links total`);
        
        console.log('\n--- Category Patterns in Text ---');
        structure.categoryPatterns.forEach(pattern => {
            console.log(`Pattern: ${pattern.pattern} | Name: ${pattern.name} | Count: ${pattern.count} | Text: "${pattern.fullText}"`);
        });
        
        console.log('\n--- Direct Category Elements ---');
        structure.categories.slice(0, 15).forEach(cat => {
            console.log(`Selector: ${cat.selector} | Text: "${cat.text}" | Href: ${cat.href}`);
        });
        
        console.log(`\nFound ${structure.categories.length} direct category elements`);
        
        // Take a screenshot for visual analysis
        console.log('\n📸 Taking screenshot...');
        await page.screenshot({ path: 'sahibinden-homepage-analysis.png', fullPage: true });
        console.log('Screenshot saved as sahibinden-homepage-analysis.png');
        
        await browser.close();
        
    } catch (error) {
        console.log('❌ Script error:', error.message);
        console.log(error.stack);
    }
})();