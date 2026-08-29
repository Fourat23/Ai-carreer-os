import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const url = 'file:///tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/rk/dom.html';

for (const mode of ['innerHTML', 'noeuds']) {
  const p = await b.newPage();
  await p.goto(url);
  await p.evaluate((m) => { window.mode = m; window.rendre(); }, mode);
  console.log(`\n===== rendu par ${mode} =====`);
  // l utilisateur clique dans le 1er champ et tape du texte
  await p.click('#liste li:nth-child(1) .saisie');
  await p.type('#liste li:nth-child(1) .saisie', ' COMPLET');
  const avant = await p.$eval('#liste li:nth-child(1) .saisie', (e) => e.value);
  const focusAvant = await p.evaluate(() => document.activeElement.className);
  console.log('  avant rafraichissement : valeur =', JSON.stringify(avant), '| focus =', focusAvant);
  await p.click('#raf');
  const apres = await p.$eval('#liste li:nth-child(1) .saisie', (e) => e.value);
  const focusApres = await p.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className);
  console.log('  apres rafraichissement : valeur =', JSON.stringify(apres), '| focus =', focusApres);
  await p.close();
}

// XSS
const p = await b.newPage();
let alerte = null;
p.on('dialog', async (d) => { alerte = d.message; await d.dismiss(); });
await p.goto(url);
await p.evaluate(() => {
  window.taches = [{ t: '"><img src=x onerror="window.pwned=1;alert(\'vol de session\')">' }];
  window.mode = 'innerHTML'; window.rendre();
});
await p.waitForTimeout(400);
console.log('\n===== injection via innerHTML =====');
console.log('  window.pwned =', await p.evaluate(() => window.pwned));
console.log('  boite de dialogue declenchee :', JSON.stringify(alerte));
await p.evaluate(() => { window.pwned = undefined; });
await p.evaluate(() => {
  const ul = document.getElementById('liste'); ul.innerHTML = '';
  const li = document.createElement('li'); const s = document.createElement('span');
  s.textContent = window.taches[0].t; li.append(s); ul.append(li);
});
await p.waitForTimeout(300);
console.log('  avec textContent -> window.pwned =', await p.evaluate(() => window.pwned),
            '| affiche :', JSON.stringify((await p.textContent('#liste')).slice(0, 40)));
await b.close();
