const path = process.argv[2];
const only = process.argv[3];
const express = require(path + '/node_modules/express');
const v = require(path + '/node_modules/express/package.json').version;

function run(label, build) {
  return new Promise((resolve) => {
    const app = express();
    build(app);
    const srv = app.listen(0, async () => {
      const port = srv.address().port;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 700);
      let out;
      try {
        const r = await fetch(`http://127.0.0.1:${port}/x`, { signal: ctrl.signal });
        const body = await r.text();
        out = `${r.status} | ${body.length} octets | contient "boom": ${body.includes('boom')} | contient "at Layer": ${body.includes('at Layer')}`;
      } catch (e) { out = 'PENDU'; }
      clearTimeout(timer); srv.close();
      console.log(`  ${label}\n    -> ${out}`);
      resolve();
    });
  });
}
const cases = {
  C: ['C. gestionnaire d erreurs a 3 params', (app) => {
    app.get('/x', (req, res, next) => next(new Error('boom')));
    app.use((err, req, res) => res.status(500).json({ vu: 'jamais' }));
  }],
  C2: ['C2. le meme, mais avec 4 params', (app) => {
    app.get('/x', (req, res, next) => next(new Error('boom')));
    app.use((err, req, res, next) => res.status(500).json({ error: 'Erreur interne' }));
  }],
  D: ['D. middleware sans next()', (app) => {
    app.use((req, res, next) => {});
    app.get('/x', (req, res) => res.json({ ok: true }));
  }],
  B: ['B. async + try/catch + next(err)', (app) => {
    app.get('/x', async (req, res, next) => { try { throw new Error('boom'); } catch (e) { next(e); } });
    app.use((err, req, res, next) => res.status(500).json({ error: 'Erreur interne' }));
  }],
};
(async () => {
  console.log(`=== express ${v} (NODE_ENV=${process.env.NODE_ENV || 'non defini'}) ===`);
  for (const k of (only ? only.split(',') : Object.keys(cases))) await run(...cases[k]);
})();
