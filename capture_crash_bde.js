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
  
  // Wait for React to mount
  await page.waitForTimeout(2000);
  
  // Click Executive Portal tab (we added this recently)
  console.log('Clicking Executive Portal tab...');
  try {
    await page.click('text="Executive Portal"', { timeout: 2000 });
  } catch(e) {
    console.log('No Executive Portal tab found, proceeding...');
  }
  
  console.log('Filling login form...');
  await page.fill('input[type="email"]', 'admin@aitel.com'); // We will use admin, wait, if admin logs in, it goes to /admin.
  await page.fill('input[type="password"]', 'admin123');
  
  console.log('Clicking login...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for navigation...');
  await page.waitForTimeout(3000);
  
  // Force navigate to /bde to see if it crashes!
  console.log('Force navigating to /bde...');
  await page.goto('http://localhost:5173/bde');
  await page.waitForTimeout(3000);

  console.log('--- CAPTURED ERRORS ---');
  if (errors.length === 0) {
    console.log('No errors captured. Page URL:', page.url());
  } else {
    console.log(errors.join('\n'));
  }
  
  await browser.close();
})();
