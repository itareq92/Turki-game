// usage: node stills.mjs f1 f2 ... -> out/still_<f>.png (960x540, debug counter)
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const frames = process.argv.slice(2).map(Number);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 960, height: 540 } });
p.on('pageerror', e => console.error('PAGE', e.message));
await p.goto(pathToFileURL('film.html').href + '?t=0&w=960&h=540&debug=1', { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
for (const f of frames) { await p.evaluate(t => window.renderAt(t), f / 30); await p.locator('canvas').screenshot({ path: `out/still_${f}.png` }); }
await b.close();
