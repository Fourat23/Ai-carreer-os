import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setContent('<div id="z"></div>');
const test = async (nom, payload) => {
  await p.evaluate(() => { window.pwned = undefined; });
  await p.evaluate((ph) => { document.getElementById('z').innerHTML = ph; }, payload);
  await p.waitForTimeout(250);
  console.log(`  ${nom.padEnd(34)} -> execute : ${await p.evaluate(() => window.pwned === 1)}`);
};
console.log('Injection via innerHTML :');
await test('<script>...</script>', '<script>window.pwned=1</script>');
await test('<img src=x onerror=...>', '<img src=x onerror="window.pwned=1">');
await test('<svg onload=...>', '<svg onload="window.pwned=1">');
await test('<iframe srcdoc=...>', '<iframe srcdoc="&lt;script&gt;parent.pwned=1&lt;/script&gt;"></iframe>');
await b.close();
