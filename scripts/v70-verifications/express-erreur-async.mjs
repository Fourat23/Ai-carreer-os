/**
 * V70 — vérification exécutée des affirmations publiées dans
 * curriculum/lessons/express-backend.md et curriculum/lessons/error-handling.md
 * (corrections : le sort d'une erreur asynchrone dans la chaîne de guichets).
 *
 * Quatre routes, jouées sur Express 4 puis Express 5 :
 *   /sync      — throw synchrone dans le gestionnaire
 *   /async     — rejet d'une promesse dans un gestionnaire async, SANS try/catch
 *   /async-ok  — le même, avec try/catch + next(err)
 *   /apres     — une réponse déjà envoyée, puis next(err)
 *
 * Express est installé HORS du projet :
 *   mkdir -p /tmp/ex4 && cd /tmp/ex4 && npm i express@4.21.2
 *   mkdir -p /tmp/ex5 && cd /tmp/ex5 && npm i express@5.1.0
 *   EX4=/tmp/ex4/node_modules/express EX5=/tmp/ex5/node_modules/express \
 *     node scripts/v70-verifications/express-erreur-async.mjs
 */
import { existsSync } from 'node:fs';

// Sur Node 22, un rejet de promesse non géré termine le processus par défaut.
// C'est justement l'un des résultats à mesurer : on l'intercepte pour pouvoir
// le RAPPORTER au lieu de mourir, et on note qu'il s'est produit.
const rejetsNonGeres = [];
process.on('unhandledRejection', (e) => {
  rejetsNonGeres.push(e && e.message ? e.message : String(e));
});

const S = '/tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad';
const CHEMINS = {
  4: process.env.EX4 || `${S}/ex4/node_modules/express/index.js`,
  5: process.env.EX5 || `${S}/ex5/node_modules/express/index.js`,
};

async function jouer(version) {
  const chemin = CHEMINS[version];
  if (!existsSync(chemin)) return { version, erreur: 'express introuvable — voir l\'en-tête' };
  const { default: express } = await import(chemin);

  const app = express();
  app.get('/sync', () => { throw new Error('panne synchrone'); });
  app.get('/async', async () => { await new Promise((r) => setTimeout(r, 5)); throw new Error('panne async'); });
  app.get('/async-ok', async (req, res, next) => {
    try { await new Promise((r) => setTimeout(r, 5)); throw new Error('panne async'); }
    catch (e) { next(e); }
  });
  app.get('/apres', (req, res, next) => { res.json({ ok: true }); next(new Error('trop tard')); });

  const guichetAtteint = [];
  const dejaEnvoyee = [];
  app.use((err, req, res, next) => {
    guichetAtteint.push(req.path);
    // Le réflexe qui manque presque toujours : si la réponse est déjà partie,
    // on ne peut plus rien écrire. On délègue à Express, qui coupera la
    // connexion, au lieu de lever ERR_HTTP_HEADERS_SENT dans le guichet.
    if (res.headersSent) { dejaEnvoyee.push(req.path); return next(err); }
    res.status(500).json({ erreur: 'Erreur interne' });   // aucun détail au client
  });

  const serveur = app.listen(0);
  await new Promise((r) => serveur.on('listening', r));
  const base = `http://127.0.0.1:${serveur.address().port}`;

  const res = {};
  for (const route of ['/sync', '/async', '/async-ok', '/apres']) {
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), 1500);   // 1,5 s = « ne répond pas »
    try {
      const r = await fetch(base + route, { signal: ctrl.signal });
      res[route] = `${r.status} ${JSON.stringify(await r.json())}`;
    } catch {
      res[route] = 'AUCUNE RÉPONSE (requête suspendue, abandon après 1,5 s)';
    }
    clearTimeout(minuteur);
  }
  res.guichetAtteintPour = guichetAtteint;
  res.rejetsNonGeres = rejetsNonGeres.splice(0);
  res.reponseDejaEnvoyee = dejaEnvoyee;
  serveur.close();
  return { version, ...res };
}

for (const v of [4, 5]) {
  const r = await jouer(v);
  console.log(`=== Express ${r.version} ===`);
  for (const [k, val] of Object.entries(r)) if (k !== 'version') console.log(' ', k.padEnd(20), val);
  console.log();
}
