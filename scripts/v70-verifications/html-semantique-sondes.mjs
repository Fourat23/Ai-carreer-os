/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/html-semantic-structure.md (pratique et correction).
 *
 * Rend les deux versions de la page de profil — avant et après réécriture
 * sémantique — et exécute les trois sondes de la pratique :
 *   (a) nombre de repères de page, (b) plan des titres, (c) éléments
 *   atteignables au clavier.
 *
 * Exécution : node scripts/v70-verifications/html-semantique-sondes.mjs
 */
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const AVANT = `<div class="page"><div class="top"><div class="logo">Réseau Pro</div>
<div class="menu"><div class="lien" onclick="aller('/accueil')">Accueil</div>
<div class="lien" onclick="aller('/messages')">Messages</div></div></div>
<div class="contenu"><div class="gros-titre">Lina Berger</div><div class="sous">Ingénieure plateforme · Lyon</div>
<div class="bloc"><div class="titre-bloc">À propos</div><div class="texte">Douze ans…</div></div>
<div class="bloc"><div class="titre-bloc">Expériences</div>
<div class="item"><div class="titre-item">Architecte</div><div>2021 – aujourd'hui</div></div>
<div class="item"><div class="titre-item">Développeuse</div><div>2016 – 2021</div></div></div>
<div class="bouton" onclick="contacter()">Contacter</div></div><div class="bas">© 2026</div></div>`;
const APRES = `<header class="top"><div class="logo">Réseau Pro</div>
<nav class="menu" aria-label="Navigation principale"><a class="lien" href="/accueil">Accueil</a>
<a class="lien" href="/messages">Messages</a></nav></header>
<main class="contenu"><h1 class="gros-titre">Lina Berger</h1><p class="sous">Ingénieure plateforme · Lyon</p>
<section class="bloc" aria-labelledby="t-apropos"><h2 class="titre-bloc" id="t-apropos">À propos</h2><p>Douze ans…</p></section>
<section class="bloc" aria-labelledby="t-exp"><h2 class="titre-bloc" id="t-exp">Expériences</h2>
<ul><li><article class="item"><h3 class="titre-item">Architecte</h3><p><time datetime="2021">2021</time> – aujourd'hui</p></article></li>
<li><article class="item"><h3 class="titre-item">Développeuse</h3><p><time datetime="2016">2016</time> – <time datetime="2021">2021</time></p></article></li></ul></section>
<button class="bouton" type="button">Contacter</button></main><footer class="bas">© 2026</footer>`;
for (const [nom, html] of [['AVANT',AVANT],['APRES',APRES]]) {
  const p = await nav.newPage(); await p.setContent(html);
  console.log(nom, JSON.stringify(await p.evaluate(()=>({
    a: document.querySelectorAll('header, nav, main, aside, footer').length,
    b: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h=>h.tagName+' '+h.textContent),
    c: document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]').length,
  }))));
  await p.close();
}
await nav.close();
