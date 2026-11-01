// usage: node render.mjs <out.mp4> <fps> <width> <height> [startSec endSec] [--audio]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const args = process.argv.slice(2);
const [out='out/preview.mp4', fps='15', w='960', h='540'] = args;
const s0 = Number(args[4] ?? 0), s1 = Number(args[5] ?? 85), withAudio = args.includes('--audio');
const FPS = Number(fps);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
page.on('pageerror', e => console.error('PAGE', e.message));
await page.goto(pathToFileURL('film.html').href + `?t=0&w=${w}&h=${h}`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const t0 = Date.now();
const vOut = withAudio ? out.replace(/\.mp4$/, '_v.mp4') : out;
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', vOut], { stdio: ['pipe', 'inherit', 'inherit'] });
const N = Math.round((s1 - s0) * FPS);
for (let i = 0; i < N; i++) {
  const b64 = await page.evaluate(t => { window.renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', 0.94).split(',')[1]; }, s0 + i / FPS);
  if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 150 === 0) console.log(`frame ${i}/${N} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r));
if (withAudio) {
  const wav = await page.evaluate(() => window.buildAudio());
  writeFileSync('out/score.wav', Buffer.from(wav, 'base64'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', vOut, '-ss', String(s0), '-t', String(s1 - s0), '-i', 'out/score.wav', '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', r));
}
await browser.close();
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
