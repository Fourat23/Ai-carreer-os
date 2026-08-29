import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setContent(`
  <div id="faux" onclick="window.n=(window.n||0)+1" style="border:1px solid">Envoyer</div>
  <button id="vrai" onclick="window.m=(window.m||0)+1">Envoyer</button>
  <div id="d1">bloc</div><section id="s1">bloc</section><section id="s2" aria-label="Resultats">bloc</section>
  <nav id="n1"><a href="/">Accueil</a></nav><main id="m1">principal</main>
`);
const compte = async (role) => (await p.$$(`role=${role}`)).length;
console.log('Elements trouves par ROLE (ce que voit une aide technique) :');
for (const r of ['button', 'navigation', 'main', 'region', 'link'])
  console.log(`  role=${r.padEnd(11)} : ${await compte(r)}`);
console.log('  -> le <div onclick> n est pas compte comme bouton ; <section> ne devient une');
console.log('     "region" que si elle porte un nom accessible.');

console.log('\nAtteignable au clavier ?');
for (const s of ['#faux', '#vrai'])
  console.log(`  ${s.padEnd(7)} tabIndex = ${await p.$eval(s, (e) => e.tabIndex)}`);

console.log('\nReagit a Entree puis Espace ?');
await p.focus('#vrai'); await p.keyboard.press('Enter'); await p.keyboard.press('Space');
console.log('  <button> : declenchements =', await p.evaluate(() => window.m || 0), '(sur 2 touches)');
await p.evaluate(() => document.getElementById('faux').focus());
await p.keyboard.press('Enter'); await p.keyboard.press('Space');
console.log('  <div>    : declenchements =', await p.evaluate(() => window.n || 0), '(sur 2 touches)');
await p.click('#faux');
console.log('  <div>    : apres un CLIC souris        =', await p.evaluate(() => window.n || 0));
await b.close();
