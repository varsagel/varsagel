const puppeteer = require('puppeteer');

(async () => {
    console.log('🕵️ Page Diagnostic Tool Starting...');
    
    try {
        const browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        
        const pages = await browser.pages();
        const page = pages.find(p => p.url().includes('sahibinden.com')) || pages[0];
        
        console.log(`📄 Analyzing URL: ${page.url()}`);
        
        // Get Page Title
        const title = await page.title();
        console.log(`📑 Title: ${title}`);

        // Analyze Links
        const analysis = await page.evaluate(() => {
            const results = {};
            
            // 1. Check common container classes
            const containers = [
                'ul.categoryList',
                '.cl-filter-list',
                '.category-list',
                '.categories-board',
                '.search-filter',
                'div.categories-left-menu'
            ];

            results.containers = containers.map(c => ({
                selector: c,
                found: document.querySelector(c) ? 'YES' : 'NO',
                childCount: document.querySelectorAll(`${c} li`).length
            }));

            // 2. Find ANY link that looks like a brand (e.g. BMW, Audi)
            const allLinks = Array.from(document.querySelectorAll('a'));
            const potentialBrands = allLinks.filter(a => {
                const text = a.innerText.trim();
                return ['BMW', 'Audi', 'Mercedes-Benz', 'Ford', 'Fiat', 'Renault'].includes(text);
            }).map(a => ({
                text: a.innerText,
                href: a.href,
                classes: a.className,
                parentClasses: a.parentElement.className,
                grandParentClasses: a.parentElement.parentElement.className,
                selectorPath: getPath(a)
            }));

            results.potentialBrands = potentialBrands;
            
            // Helper to get selector path
            function getPath(el) {
                if (!el) return '';
                let stack = [];
                while (el.parentNode != null) {
                    let sibCount = 0;
                    let sibIndex = 0;
                    for (let i = 0; i < el.parentNode.childNodes.length; i++) {
                        let sib = el.parentNode.childNodes[i];
                        if (sib.nodeName == el.nodeName) {
                            if (sib === el) sibIndex = sibCount;
                            sibCount++;
                        }
                    }
                    if (el.hasAttribute('id') && el.id != '') {
                        stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
                    } else if (sibCount > 1) {
                        stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
                    } else {
                        stack.unshift(el.nodeName.toLowerCase());
                    }
                    el = el.parentNode;
                }
                return stack.slice(1).join(' > ');
            }

            return results;
        });

        console.log('\n🏗️  STRUCTURE ANALYSIS:');
        console.table(analysis.containers);

        console.log('\n🎯 POTENTIAL BRAND LINKS FOUND:');
        if (analysis.potentialBrands.length > 0) {
            analysis.potentialBrands.forEach(b => {
                console.log(`\nText: "${b.text}"`);
                console.log(`Selector Path: ${b.selectorPath}`);
                console.log(`Classes: ${b.classes}`);
                console.log(`Parent Classes: ${b.parentClasses}`);
                console.log(`GrandParent Classes: ${b.grandParentClasses}`);
            });
        } else {
            console.log('❌ Could not find standard brand names (BMW, Audi, etc). Are you on the "Otomobil" page?');
        }

        browser.disconnect();

    } catch (e) {
        console.error('Error:', e.message);
    }
})();
