import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setContent('<input id="m" type="email" required><input id="c" type="number" min="1" max="10">');
const cas = ['alice@exemple.fr','a@b','alice@@exemple.fr','alice @exemple.fr','alice@exemple','ALICE@EXEMPLE.FR',
  'alice+promo@exemple.fr','"a b"@exemple.fr','alice@127.0.0.1','alice@exemple..fr','  alice@exemple.fr  '];
console.log('type="email" — ce que le navigateur accepte :');
for (const v of cas) {
  const r = await p.evaluate((val) => { const e = document.getElementById('m'); e.value = val; return { ok: e.checkValidity(), lu: e.value }; }, v);
  console.log(`  ${r.ok ? 'ACCEPTE' : 'refuse '}  ${JSON.stringify(v)}${r.lu !== v ? '   (valeur lue : ' + JSON.stringify(r.lu) + ')' : ''}`);
}
console.log('\ntype="number" min=1 max=10 :');
for (const v of ['5','0','11','abc','3.5','1e3']) {
  const r = await p.evaluate((val) => { const e = document.getElementById('c'); e.value = val; return { ok: e.checkValidity(), lu: e.value, num: e.valueAsNumber }; }, v);
  console.log(`  ${r.ok ? 'ACCEPTE' : 'refuse '}  saisi ${JSON.stringify(v)} | value lue = ${JSON.stringify(r.lu)} | valueAsNumber = ${r.num}`);
}
await b.close();
