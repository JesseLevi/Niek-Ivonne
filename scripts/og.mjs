// Maakt de OG-beelden (WhatsApp-preview) per taal: public/og/og-<taal>.png, 1200 × 630.
// Rendert /og/<taal>/ uit een build met Playwright (Chromium).
//
// Gebruik: npm run build && npm run og

import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const LOCALES = ['en', 'es', 'nl'];
const PORT = 4329;

// require() vindt ook een globaal geïnstalleerde Playwright (NODE_PATH); import() niet.
const { chromium } = createRequire(import.meta.url)('playwright');
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
try {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(`http://localhost:${PORT}/og/en/`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  mkdirSync('public/og', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: 'light' });
  for (const lang of LOCALES) {
    await page.goto(`http://localhost:${PORT}/og/${lang}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `public/og/og-${lang}.png` });
    console.log(`public/og/og-${lang}.png`);
  }
  await browser.close();
} finally {
  server.kill();
}
