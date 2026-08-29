/**
 * V70 — vérification exécutée des chiffres publiés dans curriculum/lessons/css-flexbox.md
 *
 * Quatre configurations d'un même conteneur de 600 px contenant trois enfants.
 * Le script imprime les largeurs réellement calculées par Chromium.
 * Exécution : node scripts/v70-verifications/css-flexbox-repartition.mjs
 */
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const p = await nav.newPage({ viewport: { width: 1200, height: 800 } });

const CAS = {
  'A · flex: 1 sur les trois': '.e { flex: 1 }',
  'B · flex: auto sur les trois': '.e { flex: auto }',
  'C · flex: 0 0 300px sur les trois': '.e { flex: 0 0 300px }',
  'D · flex: 1 1 300px sur les trois': '.e { flex: 1 1 300px }',
  'E · flex: 1 + mot insécable': '.e { flex: 1 }',
  'F · E + min-width: 0': '.e { flex: 1; min-width: 0 }',
  'G · mot très long, flex: 1': '.e { flex: 1 }',
  'H · G + min-width: 0': '.e { flex: 1; min-width: 0 }',
  'I · H + overflow-wrap': '.e { flex: 1; min-width: 0; overflow-wrap: break-word }',
};

for (const [nom, regle] of Object.entries(CAS)) {
  const longMot = 'EF'.includes(nom[0]);
  const motTresLong = 'GHI'.includes(nom[0]);
  await p.setContent(`<style>
    *,*::before,*::after { box-sizing: border-box }
    body { margin: 0; font: 16px monospace }
    .c { display: flex; width: 600px; outline: 1px solid red }
    .e { outline: 1px solid blue }
    .e span { display: inline-block }
    ${regle}
  </style>
  <div class="c">
    <div class="e e1"><span style="width:100px">a</span></div>
    <div class="e e2">${
      motTresLong
        ? 'ProvisionnementAutomatiqueDesRessourcesEtSupervisionContinueDuParc'
        : longMot
          ? 'ProvisionnementAutomatiqueDesRessources'
          : '<span style="width:200px">b</span>'
    }</div>
    <div class="e e3"><span style="width:60px">c</span></div>
  </div>`);

  const r = await p.evaluate(() => {
    const c = document.querySelector('.c');
    const e = [...document.querySelectorAll('.e')].map(
      (x) => Math.round(x.getBoundingClientRect().width * 100) / 100,
    );
    return {
      enfants: e,
      somme: Math.round(e.reduce((a, b) => a + b, 0) * 100) / 100,
      conteneur: c.getBoundingClientRect().width,
      contenuDeborde:
        Math.round((c.scrollWidth - c.clientWidth) * 100) / 100,
    };
  });
  console.log(nom.padEnd(34), JSON.stringify(r));
}

// ---------- 2. Pratique : l'en-tête « Gestion Pro » ----------
const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='32'" +
  "%3E%3Crect width='140' height='32' fill='%23888'/%3E%3C/svg%3E";

const ENTETE = `<style>
  *,*::before,*::after { box-sizing: border-box }
  body { margin: 0; font: 14px sans-serif }
  .entete  { display: flex; align-items: center }
  .logo    { flex: 1 }
  .onglets { display: flex; gap: 8px; flex: 2 }
  .compte  { display: flex; gap: 8px; margin-left: 40px }
  .email   { flex: 1 }
</style>
<header class="entete">
  <img class="logo" src="${LOGO}" width="140" height="32" alt="Gestion Pro">
  <nav class="onglets">
    <a href="#">Tableau de bord</a>
    <a href="#">Approvisionnement et facturation</a>
    <a href="#">Rapports</a>
  </nav>
  <div class="compte">
    <span class="email">prenom.nom@entreprise-exemple.fr</span>
    <button class="deconnexion">Déconnexion</button>
  </div>
</header>`;

console.log('\n=== 3. Pratique — en-tête d\'origine, largeurs mesurées ===');
for (const largeur of [1600, 1280, 900, 768, 700, 600]) {
  const p2 = await nav.newPage({ viewport: { width: largeur, height: 400 } });
  await p2.setContent(ENTETE);
  const r = await p2.evaluate(() => {
    const px = (n) => Math.round(n * 100) / 100;
    const o = {};
    document.querySelectorAll('.entete > *, .compte > *').forEach((el) => {
      o[el.className] = px(el.getBoundingClientRect().width);
    });
    const e = document.querySelector('.email');
    const rg = document.createRange();
    rg.selectNodeContents(e);
    o.hauteurTexteEmail = px(rg.getBoundingClientRect().height);
    o.hauteurEntete = px(document.querySelector('.entete').getBoundingClientRect().height);
    o.debordementPage = px(
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    return o;
  });
  console.log(String(largeur).padStart(5), JSON.stringify(r));
  await p2.close();
}

// ---------- 4. Pratique : l'en-tête corrigé ----------
const CSS_CORRIGE = `
  *,*::before,*::after { box-sizing: border-box }
  body { margin: 0; font: 14px sans-serif }
  .entete      { display: flex; align-items: center; gap: 16px }
  .logo        { flex: none }
  .onglets     { display: flex; gap: 8px; flex: 1 1 auto; min-width: 0; overflow: hidden }
  .compte      { display: flex; align-items: center; gap: 8px; flex: none; margin-left: auto }
  .email       { flex: 0 1 auto; min-width: 0;
                 overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
  .deconnexion { flex: none; white-space: nowrap }`;

console.log('\n=== 4. Pratique — en-tête corrigé ===');
for (const largeur of [1600, 1280, 900, 768, 700, 600, 500, 375]) {
  const p3 = await nav.newPage({ viewport: { width: largeur, height: 400 } });
  await p3.setContent(
    `<style>${CSS_CORRIGE}</style>` + ENTETE.slice(ENTETE.indexOf('<header')),
  );
  const r = await p3.evaluate(() => {
    const px = (n) => Math.round(n * 100) / 100;
    const o = {};
    document.querySelectorAll('.entete > *, .compte > *').forEach((el) => {
      o[el.className] = px(el.getBoundingClientRect().width);
    });
    const e = document.querySelector('.email');
    const rg = document.createRange();
    rg.selectNodeContents(e);
    o.hauteurTexteEmail = px(rg.getBoundingClientRect().height);
    o.debordementPage = px(
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    return o;
  });
  console.log(String(largeur).padStart(5), JSON.stringify(r));
  await p3.close();
}

await nav.close();
