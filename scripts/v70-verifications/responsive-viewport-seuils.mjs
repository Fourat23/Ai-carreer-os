/**
 * V70 — vérification exécutée des chiffres publiés dans curriculum/lessons/responsive-design.md
 *
 *   1. Ce que fait réellement l'absence de <meta name="viewport"> sur un mobile.
 *   2. La recherche automatique du seuil : à quelle largeur la mise en page « craque ».
 *
 * Exécution : node scripts/v70-verifications/responsive-viewport-seuils.mjs
 */
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

const CORPS = `
  <h1>Tarifs</h1>
  <p>Un paragraphe de texte courant, assez long pour qu'on puisse juger de sa lisibilité
     à l'écran et de la taille apparente des caractères une fois la page rendue.</p>
  <div class="carte"><h2>Formule Pro</h2><p>29 € par mois</p></div>`;

// ---------- 1. avec et sans la balise viewport, sur un appareil mobile ----------
console.log('=== 1. <meta viewport> — appareil émulé 390 × 844, dpr 3 ===');
for (const [nom, balise] of [
  ['SANS la balise', ''],
  ['AVEC la balise', '<meta name="viewport" content="width=device-width, initial-scale=1">'],
]) {
  const ctx = await nav.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const p = await ctx.newPage();
  await p.setContent(
    `<!doctype html><html><head><meta charset="utf-8">${balise}
     <style>body{margin:0;font:16px sans-serif} .carte{border:1px solid #999;padding:16px}</style>
     </head><body>${CORPS}</body></html>`,
  );
  const r = await p.evaluate(() => ({
    largeurDeRendu: document.documentElement.clientWidth,
    largeurEcran: window.innerWidth,
    tailleTexteCSS: getComputedStyle(document.querySelector('p')).fontSize,
    // taille apparente : la page est-elle dézoomée pour tenir sur l'écran ?
    facteurEchelle:
      Math.round((window.innerWidth / document.documentElement.clientWidth) * 1000) / 1000,
  }));
  console.log(nom.padEnd(16), JSON.stringify(r));
  await ctx.close();
}

// ---------- 2. trouver le seuil par balayage ----------
console.log('\n=== 2. recherche du seuil : première largeur sans débordement ===');
const PAGE = `<style>
  *,*::before,*::after { box-sizing: border-box }
  body { margin: 0; font: 16px sans-serif }
  .grille { display: flex; gap: 24px; padding: 24px }
  .principal { flex: 1 1 auto; min-width: 0 }
  .cote { flex: 0 0 280px }            /* colonne latérale de largeur fixe */
  table { border-collapse: collapse; width: 100% }
  td, th { border: 1px solid #ccc; padding: 8px; white-space: nowrap }
</style>
<div class="grille">
  <main class="principal">
    <h1>Consommation par service</h1>
    <table>
      <tr><th>Service</th><th>Région</th><th>Instances</th><th>Coût mensuel</th><th>Variation</th></tr>
      <tr><td>api-passerelle</td><td>eu-ouest-1</td><td>12</td><td>428,90 €</td><td>+3,2 %</td></tr>
    </table>
  </main>
  <aside class="cote"><h2>Filtres</h2><p>Période, service, région.</p></aside>
</div>`;

const p2 = await nav.newPage();
let premierSansDebordement = null;
const releve = [];
for (let w = 320; w <= 1440; w += 20) {
  await p2.setViewportSize({ width: w, height: 800 });
  await p2.setContent(PAGE);
  const d = await p2.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  releve.push([w, d]);
  if (d === 0 && premierSansDebordement === null) premierSansDebordement = w;
}
console.log('première largeur sans débordement :', premierSansDebordement, 'px');
console.log(
  'échantillon :',
  releve
    .filter(([w]) => [320, 480, 640, 700, 720, 740, 760, 800, 1024].includes(w))
    .map(([w, d]) => `${w}→${d}`)
    .join('  '),
);

await nav.close();
