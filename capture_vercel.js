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

  console.log('Navigating to vercel...');
  await page.goto('https://aitel-c8gq0hhfj-ramsiva97465-dots-projects.vercel.app');
  
  console.log('Clicking Executive Portal tab...');
  // The Executive Portal is the first button in the tabs
  await page.click('button:has-text("Executive Portal")');
  
  console.log('Filling login form...');
  await page.fill('input[type="email"]', 'siva@aitel.com'); // We will just put an email
  await page.fill('input[type="password"]', 'welcome123'); // Put a password
  
  console.log('Clicking login...');
  await page.click('button[type="submit"]');
  
  // Wait for navigation or error
  await page.waitForTimeout(4000);
  
  console.log('--- CAPTURED ERRORS ---');
  if (errors.length === 0) {
    console.log('No errors captured. Page URL:', page.url());
  } else {
    console.log(errors.join('\n'));
  }
  
  await browser.close();
})();
