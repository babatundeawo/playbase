// Checks WCAG contrast for the colour tokens between "contrast:start/end" in src/styles/tokens.css.
// Usage: node scripts/contrast.mjs            (prints a table, exits 1 on a failure)
//        node scripts/contrast.mjs --hex      (prints hex values for both themes)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(path.join(root, 'src/styles/tokens.css'), 'utf8');
const block = css.slice(css.indexOf('contrast:start'), css.indexOf('contrast:end'));

const parseOklch = (s) => {
  const m = s.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};
const tokens = { light: {}, dark: {} };
for (const line of block.split('\n')) {
  const m = line.match(/--([\w-]+):\s*(.+);/);
  if (!m) continue;
  const ld = m[2].match(/light-dark\((oklch\([^)]*\)),\s*(oklch\([^)]*\))\)/);
  if (ld) {
    tokens.light[m[1]] = parseOklch(ld[1]);
    tokens.dark[m[1]] = parseOklch(ld[2]);
  } else {
    const c = parseOklch(m[2]);
    if (c) tokens.light[m[1]] = tokens.dark[m[1]] = c;
  }
}

// OKLCH -> OKLab -> linear sRGB
const toLab = ([L, C, h]) => [L, C * Math.cos((h * Math.PI) / 180), C * Math.sin((h * Math.PI) / 180)];
const labToLin = ([L, a, b]) => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
};
const clamp = (x) => Math.min(1, Math.max(0, x));
const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const lum = (lin) => {
  const [r, g, b] = lin.map(clamp);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
  return (hi + 0.05) / (lo + 0.05);
};
const hex = (lin) => '#' + lin.map((x) => Math.round(gamma(clamp(x)) * 255).toString(16).padStart(2, '0')).join('');
const mix = (lab1, lab2, p) => lab1.map((v, i) => v * p + lab2[i] * (1 - p)); // color-mix(in oklab, c1 p%, c2)

if (process.argv.includes('--hex')) {
  for (const theme of ['dark', 'light']) {
    console.log(`/* ${theme} */`);
    for (const [k, v] of Object.entries(tokens[theme])) console.log(`  --${k}: ${hex(labToLin(toLab(v)))};`);
    const T = tokens[theme];
    const t = (fill, p) => hex(labToLin(mix(toLab(T[fill]), toLab(T.surface), p)));
    console.log(`  --tint-accent: ${t('accent-fill', 0.16)};\n  --tint-ok: ${t('ok-fill', 0.16)};\n  --tint-bad: ${t('bad-fill', 0.16)};\n  --tint-gold: ${t('gold', 0.14)};`);
  }
  process.exit(0);
}

let failed = 0;
for (const theme of ['light', 'dark']) {
  const T = tokens[theme];
  const c = (name) => labToLin(toLab(T[name]));
  const tint = (fill, base = 'surface', p = 0.16) => labToLin(mix(toLab(T[fill]), toLab(T[base]), p));
  const gold14 = labToLin(mix(toLab(T.gold), toLab(T.surface), 0.14));
  const pairs = [
    // [label, foreground, background, minimum]
    ['text on page', c('text'), c('bg'), 7],
    ['text on card', c('text'), c('surface'), 7],
    ['text on raised card', c('text'), c('surface-2'), 7],
    ['muted text on page', c('text-2'), c('bg'), 4.5],
    ['muted text on card', c('text-2'), c('surface'), 4.5],
    ['muted text on raised card', c('text-2'), c('surface-2'), 4.5],
    ['gold text on page', c('gold-text'), c('bg'), 4.5],
    ['gold text on card', c('gold-text'), c('surface'), 4.5],
    ['gold text on raised card', c('gold-text'), c('surface-2'), 4.5],
    ['gold text on gold tint', c('gold-text'), gold14, 4.5],
    ['button text on gold', c('on-gold'), c('gold'), 7],
    ['accent text on card', c('accent'), c('surface'), 4.5],
    ['accent text on accent tint', c('accent'), tint('accent-fill'), 4.5],
    ['text on accent tint', c('text'), tint('accent-fill'), 7],
    ['text on accent fill', c('on-accent-fill'), c('accent-fill'), 4.5],
    ['ok text on card', c('ok'), c('surface'), 4.5],
    ['ok text on ok tint', c('ok'), tint('ok-fill'), 4.5],
    ['text on ok fill', c('on-ok-fill'), c('ok-fill'), 4.5],
    ['bad text on card', c('bad'), c('surface'), 4.5],
    ['bad text on bad tint', c('bad'), tint('bad-fill'), 4.5],
    ['text on bad fill', c('on-bad-fill'), c('bad-fill'), 4.5],
    ['input border on card (UI 3:1)', c('line-strong'), c('surface'), 3],
    ['input border on page (UI 3:1)', c('line-strong'), c('bg'), 3],
    ['gold button edge (gold text colour) on page (UI 3:1)', c('gold-text'), c('bg'), 3],
    ['focus ring on page (UI 3:1)', labToLin(toLab(T.focus ?? T['gold-text'])), c('bg'), 3],
    ['focus ring on card (UI 3:1)', labToLin(toLab(T.focus ?? T['gold-text'])), c('surface'), 3],
  ];
  console.log(`\n${theme.toUpperCase()} THEME`);
  for (const [label, fg, bg, min] of pairs) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (needs ${min}:1)  ${label}`);
  }
}
if (failed) {
  console.error(`\n${failed} contrast check(s) failed.`);
  process.exit(1);
}
console.log('\nAll contrast checks passed.');
