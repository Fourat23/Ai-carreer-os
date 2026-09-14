// V76 — AUDIT D'INTERFACE DANS UN VRAI NAVIGATEUR.
//
// ── POURQUOI UN NAVIGATEUR ET PAS UNE LECTURE DE SOURCE ─────────────────
//
// Le CP0 a mesuré la CHAÎNE par HTTP. Il n'a rien dit de l'EXPÉRIENCE : une
// route qui répond 200 peut rendre une page inutilisable, et le brief l'interdit
// explicitement comme preuve (`G8`).
//
// Ce script ouvre les pages dans Chromium, aux largeurs réelles, et mesure ce
// qu'un apprenant verrait : hauteur utile de l'éditeur, débordement horizontal,
// panneaux atteignables, cibles tactiles, ordre de tabulation, régions vivantes,
// erreurs de console.
//
// Il sert au CP2 (état des lieux) et au CP13 (vérification après changements) —
// c'est le même instrument, pour que la comparaison AVANT/APRÈS ait un sens.
import { chromium } from 'playwright';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3302';
/** Chromium pré-installé de l'environnement ; aucun téléchargement. */
const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome']
  .find((p) => existsSync(p)) ?? undefined;

export const LARGEURS = [1440, 1280, 1024, 768, 430, 390, 375];

export const PAGES = [
  { nom: 'workbench', url: '/lab/a11y-accessible-name' },
  { nom: 'workbench-web', url: '/lab/web-card' },
  { nom: 'liste-lab', url: '/lab' },
  { nom: 'transfert', url: '/transfer/archi-scale-shift' },
  { nom: 'journee', url: '/day/1' },
];

/** Ce qu'on mesure sur une page rendue. Aucune interprétation ici : des faits. */
const MESURE = () => {
  const vis = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  const ed = document.querySelector('.cm-editor');
  /**
   * ── CE QUI EST RÉELLEMENT DANS L'ARBRE D'ACCESSIBILITÉ ─────────────────
   *
   * ANOMALIE DE SONDE V76 n° 3, corrigée ici. La première version comptait
   * comme « sans nom accessible » quatre `<input disabled aria-hidden="true"
   * tabindex="-1">` de la page journée — c'est-à-dire des cases décoratives
   * **correctement retirées** de l'arbre d'accessibilité. La sonde signalait un
   * défaut là où le produit faisait exactement ce qu'il fallait.
   *
   * Un élément `aria-hidden`, `disabled` ou sorti du parcours de tabulation
   * n'est pas annoncé : lui réclamer un nom est un faux positif.
   */
  const dansArbre = (el) => vis(el) && !el.closest('[aria-hidden="true"]')
    && !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1';
  const focusables = [...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(dansArbre);
  // Cibles tactiles trop petites : seuil usuel de 24 px (WCAG 2.2 AA).
  const petites = focusables.filter((e) => { const r = e.getBoundingClientRect(); return r.height < 24 || r.width < 24; });
  return {
    largeurDoc: document.documentElement.scrollWidth,
    fenetre: window.innerWidth,
    /** Un débordement horizontal GLOBAL est un défaut ; un conteneur qui défile ne l'est pas. */
    scrollHorizontal: document.documentElement.scrollWidth > window.innerWidth + 1,
    editeurPresent: !!ed,
    editeurVisible: vis(ed),
    hauteurEditeur: ed ? Math.round(ed.getBoundingClientRect().height) : 0,
    largeurEditeur: ed ? Math.round(ed.getBoundingClientRect().width) : 0,
    /** Part de la hauteur de fenêtre réellement donnée au travail. */
    partEditeur: ed ? Math.round((ed.getBoundingClientRect().height / window.innerHeight) * 100) : 0,
    boutonsVisibles: [...document.querySelectorAll('button')].filter(vis).length,
    boutons: [...document.querySelectorAll('button')].filter(vis).map((b) => b.textContent.trim()).filter(Boolean).slice(0, 20),
    focusables: focusables.length,
    ciblesTropPetites: petites.length,
    exemplesTropPetits: petites.slice(0, 4).map((e) => (e.textContent.trim() || e.getAttribute('aria-label') || e.tagName).slice(0, 24)),
    ariaLive: document.querySelectorAll('[aria-live]').length,
    ariaSelected: document.querySelectorAll('[aria-selected]').length,
    roles: document.querySelectorAll('[role]').length,
    /** Un champ sans nom accessible est invisible pour un lecteur d'écran. */
    sansNomAccessible: [...document.querySelectorAll('button,a[href],input,select')].filter(dansArbre)
      .filter((e) => !e.textContent.trim() && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('title')
        && !(e.id && document.querySelector(`label[for="${e.id}"]`)) && !e.closest('label')).length,
    exemplesSansNom: [...document.querySelectorAll('button,a[href],input,select')].filter(dansArbre)
      .filter((e) => !e.textContent.trim() && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('title')
        && !(e.id && document.querySelector(`label[for="${e.id}"]`)) && !e.closest('label'))
      .slice(0, 4).map((e) => e.outerHTML.slice(0, 90)),
    hauteurFenetre: window.innerHeight,
  };
};

export async function auditer({ pages = PAGES, largeurs = LARGEURS } = {}) {
  const navigateur = await chromium.launch({ executablePath: CHROME });
  const out = [];
  for (const page of pages) {
    for (const w of largeurs) {
      const ctx = await navigateur.newContext({ viewport: { width: w, height: w < 500 ? 780 : 900 } });
      const p = await ctx.newPage();
      const erreurs = []; const reseau404 = [];
      // Les requêtes RSC de préchargement sont annulées à la fermeture de la
      // page : ce sont des artefacts de la sonde, pas des erreurs du produit.
      p.on('console', (m) => { if (m.type() === 'error' && !/_rsc=/.test(m.text())) erreurs.push(m.text().slice(0, 160)); });
      p.on('pageerror', (e) => erreurs.push(`PAGEERROR ${String(e).slice(0, 160)}`));
      p.on('response', (r) => { if (r.status() >= 400 && !/_rsc=/.test(r.url())) reseau404.push(`${r.status()} ${r.url().replace(BASE, '')}`); });
      let m = null; let erreurNav = null;
      try {
        await p.goto(BASE + page.url, { waitUntil: 'networkidle', timeout: 30000 });
        m = await p.evaluate(MESURE);
      } catch (e) { erreurNav = String(e.message ?? e).slice(0, 120); }
      out.push({ page: page.nom, url: page.url, largeur: w, ...(m ?? {}), erreurs, reseau: [...new Set(reseau404)], erreurNav });
      await ctx.close();
    }
  }
  await navigateur.close();
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('ui-audit.mjs')) {
  const etiquette = process.argv[2] ?? 'cp2';
  const res = await auditer();

  console.log(`# V76 — Audit d'interface (${etiquette}) · Chromium réel\n`);
  console.log('## Débordement horizontal et éditeur\n');
  console.log('| page | largeur | débordement | éditeur | hauteur | part de la fenêtre | boutons visibles |');
  console.log('|---|---|---|---|---|---|---|');
  for (const r of res) {
    if (r.erreurNav) { console.log(`| \`${r.page}\` | ${r.largeur} | — | ❌ ${r.erreurNav} | — | — | — |`); continue; }
    console.log(`| \`${r.page}\` | ${r.largeur} | ${r.scrollHorizontal ? '❌ **oui**' : '✅ non'} | ${r.editeurPresent ? (r.editeurVisible ? '✅' : '⚠️ caché') : '—'} | ${r.hauteurEditeur || '—'} | ${r.partEditeur ? `${r.partEditeur} %` : '—'} | ${r.boutonsVisibles} |`);
  }

  console.log('\n## Accessibilité mesurée sur le rendu\n');
  console.log('| page | largeur | `aria-live` | `aria-selected` | `role` | focusables | cibles < 24 px | sans nom accessible |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const r of res) {
    if (r.erreurNav) continue;
    console.log(`| \`${r.page}\` | ${r.largeur} | ${r.ariaLive} | ${r.ariaSelected} | ${r.roles} | ${r.focusables} | ${r.ciblesTropPetites ? `⚠️ ${r.ciblesTropPetites}` : '✅ 0'} | ${r.sansNomAccessible ? `❌ ${r.sansNomAccessible}` : '✅ 0'} |`);
  }

  const avecErreurs = res.filter((r) => r.erreurs.length);
  const avec404 = res.filter((r) => r.reseau.length);
  console.log('\n## Erreurs observées\n');
  console.log(`- **erreurs de console** : ${avecErreurs.length === 0 ? '✅ aucune' : `⚠️ ${avecErreurs.length} rendu(s)`}`);
  for (const r of [...new Set(avecErreurs.flatMap((r) => r.erreurs))].slice(0, 6)) console.log(`  - \`${r}\``);
  console.log(`- **réponses ≥ 400** : ${avec404.length === 0 ? '✅ aucune' : `⚠️ ${[...new Set(avec404.flatMap((r) => r.reseau))].join(' · ')}`}`);

  const deborde = res.filter((r) => r.scrollHorizontal);
  const sansNom = res.filter((r) => r.sansNomAccessible > 0);
  console.log('\n## Verdict\n');
  console.log(`**Débordement horizontal** : ${deborde.length === 0 ? '✅ aucun, sur toutes les largeurs' : `❌ ${[...new Set(deborde.map((r) => `${r.page}@${r.largeur}`))].join(' ')}`}`);
  console.log(`**Éléments sans nom accessible** : ${sansNom.length === 0 ? '✅ aucun' : `❌ ${[...new Set(sansNom.map((r) => `${r.page}@${r.largeur}:${r.sansNomAccessible}`))].join(' ')}`}`);

  writeFileSync(join(ROOT, 'docs', 'v76', `ui-audit-${etiquette}.json`), `${JSON.stringify(res, null, 1)}\n`);
  console.log(`\nécrit : docs/v76/ui-audit-${etiquette}.json`);
}
