// Regenerates the before and after images used in the README.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'docs/img');
mkdirSync(OUTPUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
  headless: true,
});
for (const [name, file] of [['before', 'before/index.html'], ['after', 'site/index.html']]) {
  const context = await browser.newContext({
    timezoneId: 'America/Toronto',
    viewport: { width: 1100, height: 800 },
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date('2026-11-20T10:00:00-05:00'));
  await page.goto(pathToFileURL(resolve(ROOT, file)).href);
  await page.screenshot({ path: resolve(OUTPUT, `${name}.png`), fullPage: true });
  await context.close();
}
await browser.close();
