// Assemble film.html from the game's drawing library (../index.html) + film.js
import { readFileSync, writeFileSync } from 'node:fs';
const game = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const a = game.indexOf('/* ---------------- random & colour'), b = game.indexOf('/* ---------------- audio');
if (a < 0 || b < 0) throw new Error('library markers not found');
const lib = game.slice(a, b);
const film = readFileSync(new URL('./film.js', import.meta.url), 'utf8');
const html = `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>رحلة دمعة اللبان — الفيديو</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@600;800&display=block">
<style>html,body{margin:0;background:#FFF9EE;overflow:hidden}canvas{display:block;width:100vw;height:100vh;object-fit:contain}</style></head>
<body><canvas id="c"></canvas>
<script>
'use strict';
const W=1280,H=720,SPR=2;
const _q=new URLSearchParams(location.search);document.getElementById('c').width=+(_q.get('w')||1920);document.getElementById('c').height=+(_q.get('h')||1080);
const AR=n=>String(n).replace(/\\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
${lib}
${film}
</script></body></html>`;
writeFileSync(new URL('./film.html', import.meta.url), html);
console.log('film.html', html.length, 'bytes');
