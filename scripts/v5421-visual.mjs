// V54.2.1 — Harnais « VISUAL INTEGRITY ».
//
// Différence assumée avec v542-visual.mjs : ce harnais ne mesure pas seulement
// « est-ce que ça déborde ». Il vérifie que le RENDU représente correctement les
// données et leur ORDRE, et que la composition ne laisse pas de vide structurel.
//
// Trois ordres sont distingués, parce qu'ils peuvent diverger :
//   DATA ORDER   — l'ordre de la liste fournie au composant ;
//   DOM ORDER    — l'ordre des nœuds dans le document ;
//   READING ORDER— l'ordre de lecture visuel (ligne par ligne, gauche → droite),
//                  reconstruit à partir des bounding boxes réelles.
// Une mise en page multi-colonnes CSS (`column-count`) préserve le DOM ORDER et
// détruit le READING ORDER : c'est exactement le défaut corrigé par ce sprint.
//
// Usage : node scripts/v5421-visual.mjs <label> [baseUrl]
// NE RESTAURE RIEN : la navigation ne doit pas muter data/progress.json.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const LABEL = process.argv[2] ?? 'after';
const BASE = process.argv[3] ?? 'http://127.0.0.1:3221';
const WIDTHS = [375, 768, 1024, 1440, 1920];
const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/calendar', name: 'calendar' },
  { path: '/parcours', name: 'parcours' },
  { path: '/synthese', name: 'synthese' },
  { path: '/revisions', name: 'revisions' },
];
const OUT = join(process.cwd(), 'docs', 'audits', 'visual', `v5421-${LABEL}`);
mkdirSync(OUT, { recursive: true });

// ── Sonde injectée dans la page ────────────────────────────────────────────
// Reconstruit l'ordre de lecture visuel : on regroupe les boîtes par « ligne »
// (chevauchement vertical réel), puis on trie chaque ligne de gauche à droite.
function probe() {
  const de = document.documentElement;
  const overflow = Math.max(0, de.scrollWidth - de.clientWidth);
  const pageH = de.scrollHeight;

  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, left: r.left, right: r.right, h: r.height };
  };
  // Ordre de lecture : tri par lignes visuelles (regroupement par chevauchement
  // vertical > 50 % de la plus petite boîte), puis gauche → droite.
  const readingOrder = (els) => {
    const items = els.map((el, i) => ({ i, key: el.dataset.order != null ? Number(el.dataset.order) : i, ...rectOf(el) }));
    const rows = [];
    for (const it of items.slice().sort((a, b) => a.top - b.top || a.left - b.left)) {
      const row = rows.find((r) => {
        const ov = Math.min(r.bottom, it.bottom) - Math.max(r.top, it.top);
        return ov > 0.5 * Math.min(r.bottom - r.top, it.bottom - it.top);
      });
      if (row) { row.items.push(it); row.top = Math.min(row.top, it.top); row.bottom = Math.max(row.bottom, it.bottom); }
      else rows.push({ top: it.top, bottom: it.bottom, items: [it] });
    }
    const out = [];
    for (const r of rows) for (const it of r.items.sort((a, b) => a.left - b.left)) out.push(it.key);
    return out;
  };
  const nums = (sel, attr) => [...document.querySelectorAll(sel)].map((el) => Number(el.getAttribute(attr)));
  const sorted = (a) => a.every((v, i) => i === 0 || v > a[i - 1]);

  const out = { overflow, pageH, calendar: null, dashboard: null, parcours: null, cta: null };

  // ── Calendrier : DOM order + reading order, aux trois niveaux ────────────
  // Les attributs data-* sont posés par le rendu V54.2.1. En mode BEFORE ils
  // n'existent pas : on les reconstruit depuis le DOM historique pour que la
  // comparaison AVANT/APRÈS porte sur la même mesure.
  if (!document.querySelector('[data-calendar-month]') && document.querySelector('.month-block')) {
    const n = (s) => { const m = String(s).match(/\d+/); return m ? m[0] : ''; };
    for (const mb of document.querySelectorAll('.month-block')) {
      mb.setAttribute('data-calendar-month', n(mb.querySelector('.month-no')?.textContent ?? ''));
      for (const wb of mb.querySelectorAll('.cal-week')) {
        wb.setAttribute('data-calendar-week', n(wb.querySelector('.week-label')?.textContent ?? ''));
        for (const dc of wb.querySelectorAll('.day-cell')) dc.setAttribute('data-calendar-day', n(dc.textContent ?? ''));
      }
    }
  }
  const monthEls = [...document.querySelectorAll('[data-calendar-month]')];
  if (monthEls.length) {
    const monthDom = nums('[data-calendar-month]', 'data-calendar-month');
    const monthsRead = readingOrder(monthEls.map((el) => {
      el.dataset.order = el.getAttribute('data-calendar-month'); return el;
    }));
    const weekDom = nums('[data-calendar-week]', 'data-calendar-week');
    const dayDom = nums('[data-calendar-day]', 'data-calendar-day');
    // Ordre par conteneur : semaines dans chaque mois, jours dans chaque semaine.
    const weeksPerMonth = monthEls.map((m) => [...m.querySelectorAll('[data-calendar-week]')].map((w) => Number(w.getAttribute('data-calendar-week'))));
    const daysPerWeek = [...document.querySelectorAll('[data-calendar-week]')].map((w) => [...w.querySelectorAll('[data-calendar-day]')].map((d) => Number(d.getAttribute('data-calendar-day'))));
    // Lecture visuelle des semaines et des jours (dans leur conteneur).
    const weeksRead = monthEls.map((m) => {
      const els = [...m.querySelectorAll('[data-calendar-week]')];
      els.forEach((el) => { el.dataset.order = el.getAttribute('data-calendar-week'); });
      return readingOrder(els);
    });
    const daysRead = [...document.querySelectorAll('[data-calendar-week]')].map((w) => {
      const els = [...w.querySelectorAll('[data-calendar-day]')];
      els.forEach((el) => { el.dataset.order = el.getAttribute('data-calendar-day'); });
      return readingOrder(els);
    });
    out.calendar = {
      monthCount: monthDom.length, dayCount: dayDom.length,
      monthDom, monthsRead,
      monthDomOk: sorted(monthDom), monthReadOk: sorted(monthsRead),
      weekDomOk: weeksPerMonth.every(sorted) && sorted(weekDom),
      weekReadOk: weeksRead.every(sorted),
      dayDomOk: daysPerWeek.every(sorted) && sorted(dayDom),
      dayReadOk: daysRead.every(sorted),
      // Colonnes CSS : cause connue de désordre visuel sur une structure temporelle.
      cssColumns: (() => {
        const bad = [];
        for (const el of document.querySelectorAll('*')) {
          const cs = getComputedStyle(el);
          if (cs.columnCount !== 'auto' || (cs.columnWidth !== 'auto' && cs.columnWidth !== '')) bad.push(el.className || el.tagName);
        }
        return bad.slice(0, 5);
      })(),
    };
  }

  // ── Dashboard : vide structurel entre le focus et le socle ───────────────
  // V55 : le focus du Dashboard est un `.ui-hero` (hero pleine largeur).
  // Compat AVANT conservée pour que la comparaison porte sur la même mesure.
  const focus = document.querySelector('.ui-hero') ?? document.querySelector('.ui-focus');
  const socle = document.querySelector('.dash-socle');
  const main = document.querySelector('.dash-main');
  const side = document.querySelector('.dash-side');
  if (focus && socle) {
    const f = rectOf(focus), s = rectOf(socle);
    const mainBottom = main ? rectOf(main).bottom : f.bottom;
    const sideBottom = side ? rectOf(side).bottom : 0;
    out.dashboard = {
      focusBottom: Math.round(f.bottom), socleTop: Math.round(s.top),
      gapFocusToSocle: Math.round(s.top - f.bottom),
      mainBottom: Math.round(mainBottom), sideBottom: Math.round(sideBottom),
      // Vide INEXPLIQUÉ = espace sous la colonne la plus courte, imposé par
      // la colonne la plus haute (c'est le « L-shape »).
      deadSpace: Math.round(Math.max(0, s.top - Math.max(mainBottom, 0))),
      columnImbalance: Math.round(Math.abs(mainBottom - sideBottom)),
    };
  }

  // ── Parcours : distance du CTA principal à son contexte ──────────────────
  const cta = document.querySelector('.btn.cta');
  // V55 : le bloc du parcours actif est devenu un hero. Le contexte valide est
  // donc le hero s'il existe, sinon l'ancien `.track-active` (compat AVANT).
  const ctx = document.querySelector('.ui-hero') ?? document.querySelector('.track-active');
  if (cta && ctx) {
    const c = rectOf(cta), x = rectOf(ctx);
    out.cta = {
      inContext: ctx.contains(cta),
      // distance verticale du CTA au bloc du parcours actif (0 s'il est dedans)
      distance: ctx.contains(cta) ? 0 : Math.round(Math.max(0, x.top - c.bottom, c.top - x.bottom)),
    };
  }
  return out;
}

const rows = [];
const browser = await chromium.launch({
  executablePath: EXEC,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--disable-dev-shm-usage'],
});
try {
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errs = [];
      page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 90)));
      page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)); });
      const resp = await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 45000 });
      const m = await page.evaluate(probe);
      await page.screenshot({ path: join(OUT, `${route.name}@${width}.png`), fullPage: true });
      rows.push({ route: route.name, width, status: resp?.status() ?? 0, errors: errs.length, ...m });
      await page.close();
    }
  }
} finally { await browser.close(); }

writeFileSync(join(OUT, 'metrics.json'), JSON.stringify(rows, null, 2));

// ── Rapport lisible ────────────────────────────────────────────────────────
console.log(`\n=== V54.2.1 VISUAL INTEGRITY (${LABEL}) — ${BASE} ===`);
for (const r of rows) {
  const bits = [`${r.route}@${r.width}`.padEnd(22), `HTTP ${r.status}`, `ovf ${r.overflow}`, `h ${r.pageH}`.padEnd(8)];
  if (r.dashboard) bits.push(`gap ${r.dashboard.gapFocusToSocle}px · mort ${r.dashboard.deadSpace}px · déséq ${r.dashboard.columnImbalance}px`);
  if (r.calendar) bits.push(`mois DOM ${r.calendar.monthDomOk ? 'OK' : 'KO'}/lu ${r.calendar.monthReadOk ? 'OK' : 'KO'} · sem ${r.calendar.weekDomOk ? 'OK' : 'KO'}/${r.calendar.weekReadOk ? 'OK' : 'KO'} · jours ${r.calendar.dayDomOk ? 'OK' : 'KO'}/${r.calendar.dayReadOk ? 'OK' : 'KO'}`);
  if (r.cta) bits.push(`CTA ${r.cta.inContext ? 'dans contexte' : `hors contexte (${r.cta.distance}px)`}`);
  if (r.errors) bits.push(`err ${r.errors}`);
  console.log(bits.join(' | '));
}
const cal = rows.find((r) => r.calendar);
if (cal?.calendar?.cssColumns?.length) console.log(`\n[alerte] colonnes CSS détectées : ${cal.calendar.cssColumns.join(' , ')}`);
console.log(`\ncaptures → ${OUT}`);
