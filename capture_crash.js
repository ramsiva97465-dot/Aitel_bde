import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`[Page Error] ${err.message}\n${err.stack}`);
  });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');
  
  console.log('Filling login form...');
  await page.fill('input[type="email"]', 'admin@aitel.com');
  await page.fill('input[type="password"]', 'admin123');
  
  console.log('Clicking login...');
  await page.click('button[type="submit"]');
  
  // Wait for navigation or error
  await page.waitForTimeout(3000);
  
  console.log('--- CAPTURED ERRORS ---');
  if (errors.length === 0) {
    console.log('No errors captured. Page URL:', page.url());
  } else {
    console.log(errors.join('\n'));
  }
  
  await browser.close();
})();
