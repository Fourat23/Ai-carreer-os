// V67 · CP13 — VALIDATION APPRENANT EN NAVIGATEUR RÉEL.
//
// Le brief demande huit natures de journée à cinq largeurs. On ne vérifie pas
// « c'est joli » — on vérifie ce qui empêcherait d'APPRENDRE :
//   1. la page rend le contenu attendu (les sections de la journée arrivent) ;
//   2. les deux grandeurs temporelles du CP11 sont visibles et distinctes ;
//   3. les leçons de fond sont des LIENS cliquables, pas du texte ;
//   4. aucun débordement horizontal (le corps ne scrolle jamais latéralement) ;
//   5. aucune violation d'accessibilité sérieuse ou critique (axe-core).
//
// playwright-core est en CommonJS : import par défaut obligatoire.

import pw from '../node_modules/playwright-core/index.js';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const { chromium } = pw;
const BASE = process.env.V67_BASE ?? 'http://127.0.0.1:3506';
const LARGEURS = [375, 768, 1024, 1440, 1920];

// Huit natures de journée, choisies pour couvrir ce que le brief énumère.
const JOURNEES = [
  { nature: 'fondations', day: 3 },
  { nature: 'code', day: 46 },
  { nature: 'theorie', day: 15 },
  { nature: 'data-ml', day: 155 },
  { nature: 'cloud-infra', day: 320 },
  { nature: 'securite', day: 261 },
  { nature: 'revue', day: 7 },
  { nature: 'projet', day: 91 },
];

const AXE = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

const run = async () => {
  const navigateur = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const resultats = [];
  mkdirSync('docs/design/v67/after', { recursive: true });

  for (const { nature, day } of JOURNEES) {
    for (const largeur of LARGEURS) {
      const ctx = await navigateur.newContext({ viewport: { width: largeur, height: 900 } });
      const page = await ctx.newPage();
      const erreurs = [];
      page.on('pageerror', (e) => erreurs.push(String(e.message)));
      await page.goto(`${BASE}/day/${day}`, { waitUntil: 'networkidle' });

      const m = await page.evaluate(() => {
        const txt = document.body.innerText;
        return {
          titre: document.title,
          // Les deux grandeurs du CP11 doivent être présentes ET distinctes.
          engagement: /Engagement/i.test(txt),
          lecture: /Dont lecture/i.test(txt),
          // Les leçons de fond doivent être de vrais liens.
          liensLecons: [...document.querySelectorAll('a[href^="/doc/lessons/"]')].length,
          // Un chemin de fichier resté en texte brut serait une régression CP11.
          cheminBrut: /curriculum\/projects\/project-/.test(txt),
          // Débordement horizontal : le seul défaut de mise en page qui empêche
          // réellement de lire sur mobile.
          debordement: document.documentElement.scrollWidth > window.innerWidth + 1,
          mots: txt.split(/\s+/).filter(Boolean).length,
        };
      });

      await page.addScriptTag({ content: AXE });
      const axe = await page.evaluate(async () => {
        // @ts-ignore — axe est injecté juste au-dessus.
        const r = await window.axe.run(document, { resultTypes: ['violations'] });
        return r.violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length }));
      });

      if (largeur === 1440) {
        await page.screenshot({ path: `docs/design/v67/after/day-${day}-${nature}.png`, fullPage: false });
      }
      resultats.push({ nature, day, largeur, ...m, axe, erreursJs: erreurs });
      await ctx.close();
    }
  }
  await navigateur.close();

  // ── Rapport ──
  const ko = (x) => !x.engagement || !x.lecture || x.debordement || x.cheminBrut
    || x.axe.length > 0 || x.erreursJs.length > 0 || x.liensLecons === 0;
  const echecs = resultats.filter(ko);
  console.log(`${resultats.length} vérifications (${JOURNEES.length} natures × ${LARGEURS.length} largeurs)`);
  console.log(`  engagement + lecture visibles : ${resultats.filter((x) => x.engagement && x.lecture).length}/${resultats.length}`);
  console.log(`  leçons de fond cliquables     : ${resultats.filter((x) => x.liensLecons > 0).length}/${resultats.length}`);
  console.log(`  chemin de fichier en clair    : ${resultats.filter((x) => x.cheminBrut).length}`);
  console.log(`  débordement horizontal        : ${resultats.filter((x) => x.debordement).length}`);
  console.log(`  violations a11y sérieuses     : ${resultats.reduce((s, x) => s + x.axe.length, 0)}`);
  console.log(`  erreurs JavaScript            : ${resultats.reduce((s, x) => s + x.erreursJs.length, 0)}`);
  console.log(`\n${echecs.length} vérification(s) en échec`);
  for (const e of echecs.slice(0, 20)) {
    console.log(`  j.${e.day} ${e.nature} @${e.largeur} :`,
      [!e.engagement && 'engagement absent', !e.lecture && 'lecture absente',
        e.debordement && 'débordement', e.cheminBrut && 'chemin brut',
        e.liensLecons === 0 && 'aucun lien de leçon',
        ...e.axe.map((a) => `${a.id}(${a.impact}, ${a.n})`),
        ...e.erreursJs.map((m) => 'JS: ' + m)].filter(Boolean).join(' · '));
  }
  writeFileSync('docs/design/v67/after/resultats.json', JSON.stringify(resultats, null, 1));
  process.exit(echecs.length ? 1 : 0);
};

run().catch((e) => { console.error(e); process.exit(2); });
