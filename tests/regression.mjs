// Runs the same browser checks against the frozen broken page and the final page.
// The clock and time zone are simulated, and the webhook is mocked: nothing leaves the browser.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BEFORE = resolve(ROOT, 'before/index.html');
const AFTER = resolve(ROOT, 'site/index.html');
const CHROME = process.env.CHROME_PATH || '/usr/bin/chromium';
const WEBHOOK = 'https://hook.eu1.make.com/YOUR_WEBHOOK_ID';

// Toronto is UTC-5 on all of these dates.
const FRIDAY_MORNING = '2026-11-20T10:00:00-05:00';
const SATURDAY_5PM = '2026-11-21T17:00:00-05:00';
const WEEKDAY_630PM = '2026-11-18T18:30:00-05:00';

async function open(browser, file, { at = FRIDAY_MORNING, width = 1280, webhook = 'ok' } = {}) {
  const context = await browser.newContext({
    timezoneId: 'America/Toronto',
    viewport: { width, height: 800 },
  });
  const page = await context.newPage();
  const sent = [];
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.route(WEBHOOK, async (route) => {
    sent.push(Object.fromEntries(new URLSearchParams(route.request().postData() || '')));
    await route.fulfill({
      status: webhook === 'ok' ? 200 : 503,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: webhook === 'ok' }),
    });
  });
  await page.clock.setFixedTime(new Date(at));
  await page.goto(pathToFileURL(file).href);
  return { page, context, sent, consoleErrors };
}

async function book(page, { name = 'Test Customer', date }) {
  await page.fill('#name', name);
  if (await page.locator('#phone').count()) {
    await page.fill('#phone', '416-555-0142');
    await page.fill('#email', 'customer@example.com');
    await page.fill('#issue', 'My back tire is flat');
  }
  await page.fill('#date', date);
  await page.click('#booking-form button[type="submit"]');
  await page.waitForTimeout(150);
}

const confirmed = (page) => page.locator('#confirmation').isVisible();

async function priceWith(page, promo) {
  // The public calculator was removed on purpose, so it can no longer misprice anything.
  if (!(await page.locator('#total').count())) return null;
  await page.locator('.svc[value="90"]').check();
  await page.locator('#student').check();
  await page.fill('#promo', promo);
  return page.locator('#total').textContent();
}

const REPORTED = [
  ['Monday can be booked', {}, async ({ page }) => {
    await book(page, { date: '2026-11-23' });
    return confirmed(page);
  }],
  ['Sunday is refused', {}, async ({ page }) => {
    await book(page, { date: '2026-11-22' });
    return !(await confirmed(page));
  }],
  ['Saturday 5pm shows Closed', { at: SATURDAY_5PM }, async ({ page }) =>
    (await page.locator('#status').textContent()) === 'Closed now'],
  ['Weekday 6:30pm shows Closed', { at: WEEKDAY_630PM }, async ({ page }) =>
    (await page.locator('#status').textContent()) === 'Closed now'],
  ['Menu returns after resizing', { width: 600 }, async ({ page }) => {
    await page.click('#burger');
    await page.click('#burger');
    await page.setViewportSize({ width: 1200, height: 800 });
    return page.locator('#nav').isVisible();
  }],
  ['All FAQ answers open', {}, async ({ page }) => {
    const questions = page.locator('.faq-q');
    for (let i = 0; i < 3; i += 1) await questions.nth(i).click();
    const answers = page.locator('.faq-a');
    for (let i = 0; i < 3; i += 1) if (!(await answers.nth(i).isVisible())) return false;
    return true;
  }],
  ['Discounts do not stack', {}, async ({ page }) => {
    const total = await priceWith(page, 'WINTER10');
    return total === null || total === '$76.50';
  }],
  ['Lowercase promo is not ignored', {}, async ({ page }) => {
    if (!(await page.locator('#total').count())) return true;
    await page.locator('.svc[value="90"]').check();
    await page.fill('#promo', 'winter10');
    return (await page.locator('#total').textContent()) === '$81.00';
  }],
];

const FOUND_IN_TESTING = [
  ['Holiday is refused', {}, async ({ page }) => {
    await book(page, { date: '2026-12-25' });
    return !(await confirmed(page));
  }],
  ['Saturday offers only open hours', {}, async ({ page }) => {
    await page.fill('#date', '2026-11-28');
    return parseInt(await page.locator('#time').inputValue(), 10) >= 10;
  }],
  ['HTML in the name does not run', {}, async ({ page }) => {
    await book(page, { name: '<img src=x onerror="window.__xss=1">', date: '2026-11-24' });
    await page.waitForTimeout(150);
    return !(await page.evaluate(() => window.__xss)) && !(await page.locator('#confirmation img').count());
  }],
  ['Long name cannot break layout', {}, async ({ page }) => {
    await book(page, { name: 'x'.repeat(400), date: '2026-11-24' });
    return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  }],
];

const FINAL_ONLY = [
  ['Form sends the expected fields', {}, async ({ page, sent }) => {
    await book(page, { date: '2026-11-24' });
    const body = sent[0] || {};
    return sent.length === 1 && body.phone === '416-555-0142' && body.email === 'customer@example.com'
      && body.issue === 'My back tire is flat' && /^2026-11-24 at \d+:00$/.test(body.preferred_day)
      && !('price' in body);
  }],
  ['Failed send keeps the answers', { webhook: 'fail' }, async ({ page }) => {
    await book(page, { date: '2026-11-24' });
    return !(await confirmed(page))
      && (await page.locator('#booking-error').textContent()).includes("couldn't confirm")
      && (await page.inputValue('#name')) === 'Test Customer';
  }],
  ['Honeypot submission sends nothing', {}, async ({ page, sent }) => {
    await page.evaluate(() => { document.getElementById('hp-field').value = 'bot'; });
    await book(page, { date: '2026-11-24' });
    return sent.length === 0;
  }],
  ['CSP allows the page own code', {}, async ({ page, consoleErrors }) => {
    const styled = await page.evaluate(() => getComputedStyle(document.querySelector('header')).position);
    const badge = await page.locator('#status').textContent();
    return styled === 'sticky' && badge.endsWith(' now')
      && !consoleErrors.some((text) => text.includes('Content Security Policy'));
  }],
  ['No promo code or live webhook in source', {}, async () => {
    const source = readFileSync(AFTER, 'utf8');
    // Matches full webhook URLs, not the bare domain allowed by the security policy.
    const hooks = source.match(/https:\/\/hook\.[^/'"\s;]+\/[^'"\s;]+/g) || [];
    return !source.includes('WINTER10') && hooks.length === 1 && hooks[0] === WEBHOOK;
  }],
];

async function run(browser, file, [, options, check]) {
  const session = await open(browser, file, options);
  try {
    return await check(session);
  } catch (error) {
    return false;
  } finally {
    await session.context.close();
  }
}

const mark = (value) => (value === null ? ' n/a ' : value ? ' pass' : ' FAIL');
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
let problems = 0;
let brokenFailures = 0;
let afterPasses = 0;
let total = 0;

console.log(`${'Check'.padEnd(42)}before  after`);
for (const [title, checks, hasBefore] of [
  ['Reported by the client', REPORTED, true],
  ['Found during testing', FOUND_IN_TESTING, true],
  ['Added with the automation', FINAL_ONLY, false],
]) {
  console.log(`\n${title}`);
  for (const check of checks) {
    const before = hasBefore ? await run(browser, BEFORE, check) : null;
    const after = await run(browser, AFTER, check);
    total += 1;
    if (after) afterPasses += 1; else problems += 1;
    if (hasBefore) {
      if (before) problems += 1; else brokenFailures += 1;
    }
    console.log(`  ${check[0].padEnd(40)}${mark(before)}  ${mark(after)}`);
  }
}
await browser.close();

const comparable = REPORTED.length + FOUND_IN_TESTING.length;
console.log(`\nBroken page reproduced ${brokenFailures}/${comparable} bugs. Final page passed ${afterPasses}/${total} checks.`);
process.exit(problems ? 1 : 0);
