// V54.2 — Harnais de capture + MÉTRIQUES visuelles réelles pour les 3 surfaces de
// référence (Dashboard / Parcours / Synthèse). Va au-delà de « pas d'overflow » :
// mesure la densité, le vide vertical, la répétition de composants, la présence
// d'un CTA principal, la hauteur de page, les erreurs console.
//
// Usage : node scripts/v542-visual.mjs <label> [baseUrl]
// NE MODIFIE RIEN. Ne restaure pas progress.json : la navigation NE DOIT PAS le muter.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const LABEL = process.argv[2] ?? 'after';
const BASE = process.argv[3] ?? 'http://127.0.0.1:3220';
const WIDTHS = [375, 768, 1024, 1440, 1920];
const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/parcours', name: 'parcours' },
  { path: '/synthese', name: 'synthese' },
];
const OUT = join(process.cwd(), 'docs', 'audits', 'visual', `v542-${LABEL}`);
mkdirSync(OUT, { recursive: true });

const rows = [];
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage'],
});
try {
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const consoleErrors = [];
      page.on('pageerror', (e) => consoleErrors.push(String(e.message).slice(0, 80)));
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 80)); });
      const resp = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      const status = resp?.status() ?? 0;

      // Métriques de composition réelles (mesurées dans le DOM rendu).
      const m = await page.evaluate(() => {
        const de = document.documentElement;
        const main = document.querySelector('main.content') ?? document.body;
        const mainRect = main.getBoundingClientRect();
        const vw = de.clientWidth;
        // Éléments visibles dans le contenu principal.
        const visible = [...main.querySelectorAll('*')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        // Surface « encrée » : union approximative par échantillonnage vertical.
        const pageH = Math.max(de.scrollHeight, mainRect.height);
        const band = 24; // bandes de 24px
        const bands = Math.max(1, Math.ceil(pageH / band));
        const filled = new Array(bands).fill(false);
        for (const el of visible) {
          // seulement les feuilles porteuses de contenu (texte/média/contrôles)
          if (el.children.length > 0) continue;
          const r = el.getBoundingClientRect();
          const top = r.top + window.scrollY, bot = r.bottom + window.scrollY;
          for (let b = Math.floor(top / band); b <= Math.floor(bot / band); b++) {
            if (b >= 0 && b < bands) filled[b] = true;
          }
        }
        const filledBands = filled.filter(Boolean).length;
        // Plus longue traînée de bandes vides (= plus grande zone morte verticale).
        let longestGap = 0, cur = 0;
        for (const f of filled) { if (!f) { cur++; longestGap = Math.max(longestGap, cur); } else cur = 0; }
        // Répétition de composants : classe la plus fréquente parmi les conteneurs.
        const counts = new Map();
        for (const el of visible) {
          const c = (el.className && el.className.toString ? el.className.toString() : '').trim().split(/\s+/)[0];
          if (!c) continue;
          counts.set(c, (counts.get(c) ?? 0) + 1);
        }
        const topRepeat = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
        // CTA principal : bouton/lien avec la classe cta/primary.
        const cta = main.querySelector('.btn.cta, .btn.primary');
        const ctaRect = cta ? cta.getBoundingClientRect() : null;
        // Hiérarchie typographique : tailles distinctes utilisées.
        const sizes = new Set();
        for (const el of visible) {
          if (el.children.length > 0) continue;
          const t = (el.textContent ?? '').trim();
          if (!t) continue;
          sizes.add(Math.round(parseFloat(getComputedStyle(el).fontSize)));
        }
        return {
          scrollW: de.scrollWidth, clientW: vw,
          pageH: Math.round(pageH),
          mainW: Math.round(mainRect.width),
          fillRatio: Math.round((filledBands / bands) * 100),
          longestGapPx: longestGap * band,
          topRepeat,
          hasPrimaryCta: !!cta,
          ctaTop: ctaRect ? Math.round(ctaRect.top + window.scrollY) : null,
          fontSizes: [...sizes].sort((a, b) => b - a).slice(0, 8),
          h1: main.querySelectorAll('h1').length,
          h2: main.querySelectorAll('h2').length,
        };
      });

      await page.screenshot({ path: join(OUT, `${route.name}-${width}.png`), fullPage: true });
      rows.push({ route: route.path, name: route.name, width, status, overflow: m.scrollW - m.clientW, errs: consoleErrors.length, ...m });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

console.log(`\n── V54.2 métriques visuelles (${LABEL}) — ${BASE}`);
console.log('page        larg  http err ovf  hauteur  remplis  vide-max  CTA  tailles-typo  répétition-max');
for (const r of rows) {
  const rep = r.topRepeat[0] ? `${r.topRepeat[0][0]}×${r.topRepeat[0][1]}` : '—';
  console.log(
    `${r.name.padEnd(10)} ${String(r.width).padStart(5)} ${String(r.status).padStart(4)} ${String(r.errs).padStart(3)} ${String(r.overflow).padStart(3)} ` +
    `${String(r.pageH).padStart(7)}px ${String(r.fillRatio).padStart(6)}% ${String(r.longestGapPx).padStart(7)}px ` +
    `${(r.hasPrimaryCta ? 'oui' : 'NON').padStart(4)}  ${String(r.fontSizes.length).padStart(2)}           ${rep}`,
  );
}
const bad = rows.filter((r) => r.status !== 200);
const ovf = rows.filter((r) => r.overflow > 1);
const errs = rows.filter((r) => r.errs > 0);
console.log(`\nCaptures : ${rows.length} · dossier docs/audits/visual/v542-${LABEL}/`);
console.log(`non-200 : ${bad.length} · overflow : ${ovf.length} · pages avec erreurs console : ${errs.length}`);
for (const r of ovf) console.log(`  ✗ overflow ${r.name}@${r.width} → +${r.overflow}px`);
for (const r of errs) console.log(`  ✗ erreurs ${r.name}@${r.width}`);
process.exit(bad.length || ovf.length || errs.length ? 1 : 0);
