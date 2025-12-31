const puppeteer = require('puppeteer');

async function testConnection() {
    try {
        console.log('Testing browser connection...');
        
        // Test different debug URLs
        const debugUrls = [
            'ws://127.0.0.1:9222/devtools/browser',
            'http://127.0.0.1:9222/json/version',
            'ws://localhost:9222/devtools/browser'
        ];
        
        for (const url of debugUrls) {
            try {
                console.log(`Trying: ${url}`);
                const browser = await puppeteer.connect({ 
                    browserWSEndpoint: url,
                    defaultViewport: null 
                });
                
                console.log(`✅ Connected to browser at ${url}`);
                
                // Get browser info
                const version = await browser.version();
                console.log('Browser version:', version);
                
                // Get all pages
                const pages = await browser.pages();
                console.log(`Found ${pages.length} pages:`);
                pages.forEach((page, index) => {
                    console.log(`  ${index + 1}. ${page.url()}`);
                });
                
                await browser.disconnect();
                return;
                
            } catch (error) {
                console.log(`❌ Failed to connect to ${url}:`, error.message);
            }
        }
        
        // Try HTTP endpoint to get debug info
        console.log('\nTrying HTTP debug endpoint...');
        const http = require('http');
        
        const options = {
            hostname: '127.0.0.1',
            port: 9222,
            path: '/json/version',
            method: 'GET'
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('Debug endpoint response:', data);
            });
        });
        
        req.on('error', (error) => {
            console.log('HTTP request failed:', error.message);
        });
        
        req.end();
        
    } catch (error) {
        console.log('❌ Script error:', error.message);
        console.log(error.stack);
    }
}

testConnection();