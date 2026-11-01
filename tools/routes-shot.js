// Usage: node routes-shot.js <baseUrl> <outDir> [route ...]
const { chromium } = require('playwright');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:3100';
const out = process.argv[3] || './shots';
const routes = process.argv.slice(4).length ? process.argv.slice(4) : ['/', '/about', '/services/web', '/services/ai', '/services/faith', '/projects', '/projects/ai-042', '/insights', '/insights/meeting-notes-in-9-minutes', '/does-not-exist'];
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const problems = [];
  for (const [w, tag] of [[1440, 'd'], [390, 'm']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(String(e)));
    p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    for (const r of routes) {
      errors.length = 0;
      const res = await p.goto(base + r, { waitUntil: 'networkidle' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(300);
      const info = await p.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0, 40)),
        brokenImgs: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src),
        title: document.title,
      }));
      const name = `${tag}${r.replace(/\//g, '_') || '_'}`;
      await p.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      const line = `${tag} ${r} status=${res.status()} overflowX=${info.overflow} h1=${JSON.stringify(info.h1)} title="${info.title}" broken=${info.brokenImgs.length} errors=${errors.length}`;
      console.log(line);
      if (res.status() !== 200 || info.overflow > 0 || info.h1.length !== 1 || info.brokenImgs.length || errors.length) problems.push(line + (errors.length ? ' :: ' + errors.slice(0, 3).join(' | ') : ''));
    }
    await ctx.close();
  }
  await b.close();
  console.log('\nPROBLEMS:\n' + (problems.join('\n') || 'none'));
})();
