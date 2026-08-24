// V54.2.1 — Preuve navigateur de l'ORDRE CHRONOLOGIQUE du calendrier, parcours
// par parcours.
//
// Pourquoi un balayage de tous les parcours : le défaut d'ordre n'apparaît PAS
// dans l'état gelé par défaut (AI Engineer — Fondations = les 365 jours, déjà
// triés). Il n'apparaît que sur un parcours dont les jours sont un SOUS-ENSEMBLE
// non contigu (Data/ML, Systems & Cloud, AppSec, Cloud/DevOps). Un harnais qui
// ne teste que l'état par défaut ne peut donc pas voir le bug — c'est exactement
// ce qui s'est passé en V54.2.
//
// Le script bascule de parcours via l'API réelle du produit (POST /api/track,
// action utilisateur légitime), mesure, puis REMET le parcours actif d'origine.
// Cette remise n'est pas un moyen de « faire passer » un test : les assertions
// portent sur le rendu observé pendant la bascule, et data/progress.json est
// ramené à la baseline gelée à la fin (il s'agit d'une bascule volontaire, pas
// d'une mutation provoquée par une simple navigation).
//
// Usage : node scripts/v5421-calendar-order.mjs [baseUrl] [--json]
import { chromium } from 'playwright-core';
import { writeFileSync, mkdirSync } from 'node:fs';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.argv.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:3221';
const WIDTHS = [375, 1024, 1440, 1920];
// `--shot <label>` produit une capture par parcours à 1440 (preuve visuelle).
const SHOT = (() => {
  const i = process.argv.indexOf('--shot');
  if (i < 0) return null;
  const dir = `docs/audits/visual/v5421-tracks-${process.argv[i + 1] ?? 'after'}`;
  mkdirSync(dir, { recursive: true });
  return dir;
})();
const BASELINE = {
  schemaVersion: 3,
  activeTrackId: 'ai-engineer-foundations-v1',
  tracks: {
    'ai-engineer-foundations-v1': {
      version: '1',
      enrolledAt: '2026-08-03T23:05:41.225Z',
      lastOpenedAt: '2026-08-03T23:05:41.225Z',
      startDate: null, days: {}, skills: {}, weeklyReviews: {}, monthlyReviews: {},
    },
  },
};

// Sonde : DOM order + reading order aux trois niveaux (mois / semaines / jours).
function probeOrder() {
  // Compat AVANT : le rendu antérieur ne porte pas les attributs data-calendar-*.
  // On les reconstruit depuis le DOM historique pour mesurer la MÊME chose des
  // deux côtés de la comparaison.
  if (!document.querySelector('[data-calendar-month]') && document.querySelector('.month-block')) {
    const n = (s) => (String(s).match(/\d+/) ?? [''])[0];
    for (const mb of document.querySelectorAll('.month-block')) {
      mb.setAttribute('data-calendar-month', n(mb.querySelector('.month-no')?.textContent ?? ''));
      for (const wb of mb.querySelectorAll('.cal-week')) {
        wb.setAttribute('data-calendar-week', n(wb.querySelector('.week-label')?.textContent ?? ''));
        for (const dc of wb.querySelectorAll('.day-cell')) dc.setAttribute('data-calendar-day', n(dc.textContent ?? ''));
      }
    }
  }
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left }; };
  const readingOrder = (els, attr) => {
    const items = els.map((el) => ({ key: Number(el.getAttribute(attr)), ...rectOf(el) }));
    const rows = [];
    for (const it of items.slice().sort((a, b) => a.top - b.top || a.left - b.left)) {
      const row = rows.find((r) => Math.min(r.bottom, it.bottom) - Math.max(r.top, it.top) > 0.5 * Math.min(r.bottom - r.top, it.bottom - it.top));
      if (row) { row.items.push(it); row.top = Math.min(row.top, it.top); row.bottom = Math.max(row.bottom, it.bottom); }
      else rows.push({ top: it.top, bottom: it.bottom, items: [it] });
    }
    return rows.flatMap((r) => r.items.sort((a, b) => a.left - b.left).map((i) => i.key));
  };
  const asc = (a) => a.every((v, i) => i === 0 || v > a[i - 1]);
  const monthEls = [...document.querySelectorAll('[data-calendar-month]')];
  const monthDom = monthEls.map((e) => Number(e.getAttribute('data-calendar-month')));
  const monthRead = readingOrder(monthEls, 'data-calendar-month');
  const weekEls = [...document.querySelectorAll('[data-calendar-week]')];
  const weekDom = weekEls.map((e) => Number(e.getAttribute('data-calendar-week')));
  const dayEls = [...document.querySelectorAll('[data-calendar-day]')];
  const dayDom = dayEls.map((e) => Number(e.getAttribute('data-calendar-day')));
  const weekReadPerMonth = monthEls.map((m) => readingOrder([...m.querySelectorAll('[data-calendar-week]')], 'data-calendar-week'));
  const dayReadPerWeek = weekEls.map((w) => readingOrder([...w.querySelectorAll('[data-calendar-day]')], 'data-calendar-day'));
  return {
    months: monthDom.length, days: dayDom.length,
    monthDom, monthRead,
    monthDomOk: asc(monthDom), monthReadOk: asc(monthRead),
    weekDomOk: asc(weekDom), weekReadOk: weekReadPerMonth.every(asc) && asc(weekReadPerMonth.flat()),
    dayDomOk: asc(dayDom), dayReadOk: dayReadPerWeek.every(asc) && asc(dayReadPerWeek.flat()),
    // Premier désordre observé, pour un diagnostic lisible (pas juste « KO »).
    firstDayBreak: (() => { const f = dayReadPerWeek.flat(); for (let i = 1; i < f.length; i++) if (f[i] <= f[i - 1]) return f.slice(Math.max(0, i - 3), i + 4); return null; })(),
  };
}

const browser = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage'] });
const results = [];
let failures = 0;
try {
  // Parcours réellement disponibles (mêmes données que le produit).
  const { buildCatalogue, isTrackAvailable } = await import('../lib/catalogue.mjs');
  const { readFileSync } = await import('node:fs');
  const program = JSON.parse(readFileSync('data/program.json', 'utf8'));
  const ids = buildCatalogue(program).tracks.filter(isTrackAvailable).map((t) => t.id);

  for (const id of ids) {
    // Bascule via l'API réelle du produit (même chemin que le bouton « Basculer »).
    const res = await fetch(`${BASE}/api/track`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ trackId: id }),
    });
    if (!res.ok) { console.log(`[skip] ${id} — activation HTTP ${res.status}`); continue; }
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${BASE}/calendar`, { waitUntil: 'networkidle', timeout: 45000 });
      const m = await page.evaluate(probeOrder);
      // Preuve visuelle par parcours (le défaut n'était visible que hors du
      // parcours par défaut : une capture unique ne pouvait pas le montrer).
      if (width === 1440 && SHOT) {
        await page.screenshot({ path: `${SHOT}/calendar-${id}@1440.png`, fullPage: true });
      }
      const ok = m.monthDomOk && m.monthReadOk && m.weekDomOk && m.weekReadOk && m.dayDomOk && m.dayReadOk;
      if (!ok) failures++;
      results.push({ track: id, width, ...m, ok });
      console.log(
        `${id.padEnd(30)} @${String(width).padEnd(5)} ${m.days} j · ${m.months} mois · `
        + `mois DOM ${m.monthDomOk ? 'OK' : 'KO'} lu ${m.monthReadOk ? 'OK' : 'KO'} · `
        + `sem DOM ${m.weekDomOk ? 'OK' : 'KO'} lu ${m.weekReadOk ? 'OK' : 'KO'} · `
        + `jours DOM ${m.dayDomOk ? 'OK' : 'KO'} lu ${m.dayReadOk ? 'OK' : 'KO'} ${ok ? '' : '  ← ÉCHEC'}`
        + (m.firstDayBreak ? `\n    rupture jours : ${m.firstDayBreak.join(' ')}` : '')
        + (!m.monthReadOk ? `\n    ordre de lecture mois : ${m.monthRead.join(' ')}` : ''),
      );
    }
    await page.close();
  }
} finally {
  await browser.close();
  // Retour à la baseline gelée (la bascule de parcours était volontaire).
  writeFileSync('data/progress.json', JSON.stringify(BASELINE, null, 2));
}

if (process.argv.includes('--json')) writeFileSync('docs/audits/visual/v5421-calendar-order.json', JSON.stringify(results, null, 2));
console.log(`\n${results.length - failures}/${results.length} états conformes.`);
process.exit(failures ? 1 : 0);
