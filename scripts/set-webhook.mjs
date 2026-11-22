// Sets the booking webhook URL and regenerates the matching CSP script hash.
// Usage: node scripts/set-webhook.mjs https://hook.eu1.make.com/abc123 [path/to/index.html]
// Do not commit a page containing a real webhook URL.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [url, target] = process.argv.slice(2);
const file = target
  ? resolve(target)
  : resolve(dirname(fileURLToPath(import.meta.url)), '../site/index.html');

let parsed;
try {
  parsed = new URL(url);
} catch {
  console.error('Usage: node scripts/set-webhook.mjs <https webhook URL> [file]');
  process.exit(1);
}
if (parsed.protocol !== 'https:' || !/^hook\.[a-z0-9.-]*make\.com$/.test(parsed.hostname)
  || !/^\/[A-Za-z0-9_-]+$/.test(parsed.pathname) || parsed.search || parsed.hash) {
  console.error('Expected a Make webhook URL such as https://hook.eu1.make.com/abc123');
  process.exit(1);
}

let html = readFileSync(file, 'utf8');
const urlLine = /const BOOKING_WEBHOOK_URL = '[^']*';/;
if (!urlLine.test(html)) {
  console.error('Could not find BOOKING_WEBHOOK_URL in the page.');
  process.exit(1);
}
html = html.replace(urlLine, `const BOOKING_WEBHOOK_URL = '${parsed.href}';`);
html = html.replace(/connect-src https:\/\/hook\.[a-z0-9.-]*make\.com/, `connect-src ${parsed.origin}`);

const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const hash = createHash('sha256').update(script, 'utf8').digest('base64');
html = html.replace(/script-src 'sha256-[^']+'/, `script-src 'sha256-${hash}'`);

writeFileSync(file, html);
console.log(`Updated ${file}. Keep this copy out of git.`);
