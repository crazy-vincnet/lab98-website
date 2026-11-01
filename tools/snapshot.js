// Render a route with Playwright and emit a fully self-contained HTML file for Figma's html_to_figma:
// inline CSS (with media queries resolved for the target width), images as data URIs, no scripts.
// Usage: node snapshot.js <baseUrl> <outDir> <width> <route...>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [base, outDir, widthArg, ...routes] = process.argv.slice(2);
const W = Number(widthArg);
fs.mkdirSync(outDir, { recursive: true });

const toPx = (v, unit) => (unit === 'rem' || unit === 'em' ? v * 16 : v);
// Evaluate one width condition like "(width >= 48rem)", "(min-width: 768px)", "(width < 40rem)".
function evalCond(c) {
  let m;
  if ((m = c.match(/\(\s*width\s*(>=|>|<=|<)\s*([\d.]+)(px|rem|em)\s*\)/))) {
    const v = toPx(+m[2], m[3]);
    return { '>=': W >= v, '>': W > v, '<=': W <= v, '<': W < v }[m[1]];
  }
  if ((m = c.match(/\(\s*min-width\s*:\s*([\d.]+)(px|rem|em)\s*\)/))) return W >= toPx(+m[1], m[2]);
  if ((m = c.match(/\(\s*max-width\s*:\s*([\d.]+)(px|rem|em)\s*\)/))) return W <= toPx(+m[1], m[2]);
  return null; // not a width condition
}
function resolveMedia(css) {
  return css.replace(/@media\s+([^{]+)\{/g, (all, q) => {
    if (!/width/.test(q)) return all;
    // "not all and (cond)" is how Tailwind max-* variants serialize: negate the condition.
    let negate = false;
    let qq = q.trim();
    if (/^not all and /.test(qq)) { negate = true; qq = qq.replace(/^not all and /, ''); }
    // support "a and b" conjunctions of width conditions
    const parts = qq.split(/\band\b/).map((p) => p.trim());
    const results = parts.map(evalCond);
    if (results.some((r) => r === null)) return all;
    const ok = results.every(Boolean) !== negate;
    return ok ? '@media all {' : '@media not all {';
  });
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const r of routes) {
    await page.goto(base + r, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const { html, css, imgs } = await page.evaluate(() => {
      const css = [...document.styleSheets].map((s) => { try { return [...s.cssRules].map((r) => r.cssText).join('\n'); } catch { return ''; } }).join('\n');
      const imgs = [...new Set([...document.images].map((i) => i.getAttribute('src')))];
      document.querySelectorAll('script, link[rel=stylesheet], link[rel=preload], link[rel=modulepreload], noscript').forEach((n) => n.remove());
      document.querySelectorAll('[hidden]').forEach((n) => n.remove()); // e.g. closed mobile menu
      return { html: document.documentElement.outerHTML, css, imgs };
    });
    let out = '<!doctype html>\n' + html;
    for (const src of imgs) {
      if (!src || src.startsWith('data:')) continue;
      const res = await page.request.get(new URL(src, base).href);
      const buf = await res.body();
      const type = res.headers()['content-type'] || 'image/svg+xml';
      out = out.split(`src="${src}"`).join(`src="data:${type.split(';')[0]};base64,${buf.toString('base64')}"`);
    }
    // Freeze viewport units to the target viewport so Figma's renderer (different window size) can't change them.
    const H = 900;
    const cleanCss = resolveMedia(css)
      .replace(/@font-face\s*\{[^}]*\}/g, '')
      .replace(/(-?\d*\.?\d+)vw\b/g, (_, n) => `${((+n * W) / 100).toFixed(3)}px`)
      .replace(/(-?\d*\.?\d+)(s|l|d)?vh\b/g, (_, n) => `${((+n * H) / 100).toFixed(3)}px`);
    out = out.replace('</head>', `<style>${cleanCss}\nhtml,body{width:${W}px;min-width:${W}px;overflow:visible}*,::before,::after{animation:none!important;transition:none!important}</style></head>`);
    const file = path.join(outDir, `${W}${r === '/' ? '_home' : r.replace(/\//g, '_')}.html`);
    fs.writeFileSync(file, out);
    console.log(file, (out.length / 1024).toFixed(0) + 'KB');
  }
  await b.close();
})();
