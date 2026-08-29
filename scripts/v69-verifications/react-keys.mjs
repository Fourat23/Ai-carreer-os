import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
const etat = async (id) => p.$$eval(`#${id} li`, (ls) => ls.map((l) =>
  `${l.querySelector('.case').checked ? '[x]' : '[ ]'} ${l.querySelector('.titre').textContent}`));

for (const id of ['index', 'stable']) {
  await p.goto('file:///tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/rk/page.html');
  await p.waitForSelector('#index li');
  console.log(`\n===== key = ${id === 'index' ? 'INDEX' : 'ID STABLE'} =====`);
  console.log('depart                 :', (await etat(id)).join(' | '));
  await p.click(`#${id} li:nth-child(1) .case`);           // coche "pain"
  console.log('on coche "pain"        :', (await etat(id)).join(' | '));
  await p.click(`#${id} li:nth-child(1) .sup`);            // supprime "pain"
  console.log('on supprime "pain"     :', (await etat(id)).join(' | '));
}
await b.close();
