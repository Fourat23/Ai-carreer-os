/**
 * V70 — vérification exécutée des chiffres publiés dans curriculum/lessons/css-grid.md
 *
 * Trois mesures :
 *   1. auto-fill vs auto-fit, à trois largeurs, avec 3 puis 8 cartes.
 *   2. Le nombre de colonnes réellement créé (grid-template-columns calculé).
 *   3. Le débordement d'une piste 1fr par un contenu insécable, et minmax(0, 1fr).
 *
 * Exécution : node scripts/v70-verifications/css-grid-autofill-autofit.mjs
 */
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const p = await nav.newPage({ viewport: { width: 1400, height: 900 } });

const px = (n) => Math.round(n * 100) / 100;

async function mesure(mode, nbCartes, largeur) {
  await p.setContent(`<style>
    *,*::before,*::after { box-sizing: border-box }
    body { margin: 0; font: 14px sans-serif }
    .g { display: grid; width: ${largeur}px;
         grid-template-columns: repeat(${mode}, minmax(220px, 1fr)); gap: 16px; }
    .g > * { background: #eee; padding: 8px }
  </style><div class="g">${'<article>carte</article>'.repeat(nbCartes)}</div>`);
  return p.evaluate(() => {
    const g = document.querySelector('.g');
    const pistes = getComputedStyle(g).gridTemplateColumns.split(' ').map(parseFloat);
    const cartes = [...g.children].map((c) =>
      Math.round(c.getBoundingClientRect().width * 100) / 100,
    );
    return { colonnes: pistes.length, pistes, cartes };
  });
}

console.log('=== 1. auto-fill vs auto-fit — conteneur 1000 px, gap 16, minmax(220px, 1fr) ===');
for (const n of [3, 8]) {
  for (const mode of ['auto-fill', 'auto-fit']) {
    const r = await mesure(mode, n, 1000);
    console.log(
      `${n} cartes · ${mode.padEnd(9)} → ${r.colonnes} colonnes`,
      `| pistes ${JSON.stringify(r.pistes)}`,
      `| cartes ${JSON.stringify(r.cartes)}`,
    );
  }
}

console.log('\n=== 2. le même conteneur à trois largeurs (8 cartes) ===');
for (const largeur of [1000, 700, 480]) {
  for (const mode of ['auto-fill', 'auto-fit']) {
    const r = await mesure(mode, 8, largeur);
    console.log(`${largeur} px · ${mode.padEnd(9)} → ${r.colonnes} colonnes`);
  }
}

console.log('\n=== 3. contenu insécable dans une piste 1fr ===');
for (const [nom, colonnes] of [
  ['1fr 1fr 1fr', '1fr 1fr 1fr'],
  ['minmax(0,1fr) ×3', 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)'],
]) {
  await p.setContent(`<style>
    *,*::before,*::after { box-sizing: border-box }
    body { margin: 0; font: 14px sans-serif }
    .g { display: grid; width: 600px; grid-template-columns: ${colonnes}; gap: 0 }
  </style><div class="g">
    <div>court</div>
    <div>ProvisionnementAutomatiqueDesRessourcesEtSupervisionContinueDuParc</div>
    <div>court</div>
  </div>`);
  const r = await p.evaluate(() => {
    const g = document.querySelector('.g');
    return {
      pistes: getComputedStyle(g).gridTemplateColumns,
      largeurGrille: Math.round(g.getBoundingClientRect().width * 100) / 100,
      debordement:
        Math.round(
          (document.documentElement.scrollWidth -
            document.documentElement.clientWidth) * 100,
        ) / 100,
    };
  });
  console.log(nom.padEnd(18), JSON.stringify(r));
}

await nav.close();
