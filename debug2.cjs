const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to /pagoda/users...');
    await page.goto('http://localhost:5173/pagoda/users', { waitUntil: 'networkidle0' });
    
    await page.screenshot({ path: 'pagoda_users.png' });
    console.log('Screenshot saved to pagoda_users.png');
    
    await browser.close();
})();
