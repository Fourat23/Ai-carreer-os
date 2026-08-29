import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const variante of ['sans', 'avec']) {
  const p = await b.newPage();
  await p.goto('file:///tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/rk/race.html');
  await p.evaluate(() => { window.t0 = Date.now(); window.journal = []; });
  // l utilisateur tape "chat" lettre par lettre, 80 ms entre chaque frappe
  for (const t of ['c', 'ch', 'cha', 'chat']) {
    await p.fill(`#${variante}-in`, t);
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(900);
  const j = await p.evaluate(() => window.journal);
  console.log(`\n===== ${variante === 'sans' ? 'SANS cleanup' : 'AVEC cleanup'} =====`);
  j.forEach((l) => console.log('  ' + l));
  console.log('  >>> affiche a l ecran :', await p.textContent(`#${variante}-out`));
  await p.close();
}
await b.close();
