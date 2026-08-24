// V58 — Tirage de navigation aléatoire, DÉTERMINISTE et figé à CP1.
//
// La graine et l'algorithme sont committés AVANT toute inspection de capture,
// pour que le tirage ne puisse pas être choisi après coup. Rejouer ce script
// donne toujours la même liste ; un tirage défavorable n'est pas rejoué.
import { createHash } from 'node:crypto';

export const SEED = 'V58-1440';

// Les 36 routes publiques, triées par chemin. Les routes dynamiques sont
// représentées par une instance concrète et stable.
export const ROUTES = [
  '/', '/calendar', '/capstones', '/capstones/agent-tool-loop-incident',
  '/career', '/cloud-foundations', '/cloud-foundations/aws-ha-api',
  '/cloud-lab', '/cloud-lab/canary-no-metric', '/day/80', '/diagnostics',
  '/doc/lessons/agents-fundamentals', '/glossary', '/guide', '/kubernetes',
  '/kubernetes/api-healthy', '/lab', '/lab/fizzbuzz', '/lessons',
  '/missions', '/missions/cicd-blocked-delivery', '/month/3', '/notes',
  '/parcours', '/pipelines', '/pipelines/deploy-staging', '/projects',
  '/resources', '/reviews', '/revisions', '/security',
  '/security/leaked-secret-config', '/settings', '/skills', '/synthese',
  '/week/12',
].sort();

/** Tirage sans remise : index = hash(seed + i) % N, N décroissant. */
export function draw(n = 10, seed = SEED, routes = ROUTES) {
  const pool = [...routes];
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const h = createHash('sha1').update(`${seed}:${i}`).digest();
    const idx = h.readUInt32BE(0) % pool.length;
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`graine : ${SEED} · ${ROUTES.length} routes candidates`);
  draw().forEach((r, i) => console.log(`${String(i + 1).padStart(2)}. ${r}`));
}
