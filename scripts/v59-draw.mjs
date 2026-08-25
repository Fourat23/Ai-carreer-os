// V59 — tirage de navigation aléatoire, DÉTERMINISTE et pré-enregistré.
// Graine : V59-SIGNATURE. Contraintes de quotas appliquées APRÈS le tirage,
// par complétion déterministe, jamais par choix humain.
import { createHash } from 'node:crypto';

const SEED = 'V59-SIGNATURE';
const ROUTES = [
  '/', '/calendar', '/capstones', '/capstones/agent-tool-loop-incident', '/career',
  '/cloud-foundations', '/cloud-foundations/aws-ha-api', '/cloud-lab', '/cloud-lab/canary-no-metric',
  '/day/80', '/diagnostics', '/doc/lessons/agents-fundamentals', '/glossary', '/guide',
  '/kubernetes', '/kubernetes/api-healthy', '/lab', '/lab/fizzbuzz', '/lessons', '/missions',
  '/missions/cicd-blocked-delivery', '/month/3', '/notes', '/parcours', '/pipelines',
  '/pipelines/deploy-staging', '/projects', '/resources', '/reviews', '/revisions',
  '/security', '/security/leaked-secret-config', '/settings', '/skills', '/synthese', '/week/12',
].sort();

const FAMILY = {
  detail: ['/capstones/agent-tool-loop-incident', '/cloud-foundations/aws-ha-api', '/cloud-lab/canary-no-metric',
    '/kubernetes/api-healthy', '/missions/cicd-blocked-delivery', '/pipelines/deploy-staging',
    '/security/leaked-secret-config', '/lab/fizzbuzz', '/day/80', '/month/3', '/week/12'],
  technique: ['/cloud-foundations', '/cloud-lab', '/kubernetes', '/pipelines', '/security', '/lab'],
  learner: ['/lessons', '/missions', '/capstones', '/diagnostics', '/projects', '/reviews', '/glossary'],
  pilotage: ['/', '/parcours', '/synthese', '/calendar', '/revisions', '/skills'],
  doc: ['/doc/lessons/agents-fundamentals', '/career', '/guide', '/resources', '/notes', '/settings'],
};
const MIN = { detail: 3, technique: 2, learner: 2, pilotage: 2, doc: 1 };

const h = (s) => parseInt(createHash('sha1').update(s).digest('hex').slice(0, 12), 16);

// Tirage sans remise, 12 routes.
const pool = [...ROUTES];
const picked = [];
for (let i = 0; picked.length < 12; i++) {
  const idx = h(`${SEED}:${i}`) % pool.length;
  picked.push(pool.splice(idx, 1)[0]);
}
// Complétion déterministe des quotas : on remplace la DERNIÈRE route tirée
// d'une famille excédentaire par la première non tirée de la famille en défaut.
const famOf = (r) => Object.keys(FAMILY).find((f) => FAMILY[f].includes(r)) ?? 'doc';
for (const [fam, min] of Object.entries(MIN)) {
  while (picked.filter((r) => famOf(r) === fam).length < min) {
    const need = FAMILY[fam].find((r) => !picked.includes(r));
    if (!need) break;
    const over = Object.entries(MIN).find(([f, m]) => picked.filter((r) => famOf(r) === f).length > m);
    if (!over) break;
    const victim = [...picked].reverse().find((r) => famOf(r) === over[0]);
    picked[picked.indexOf(victim)] = need;
  }
}
console.log(JSON.stringify(picked.map((r) => ({ route: r, famille: famOf(r) })), null, 2));
