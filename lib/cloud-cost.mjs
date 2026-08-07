// Estimateur de coût mensuel — PUR, DÉTERMINISTE et FACTICE (ADR/HSD/TSD-025).
// AUCUN prix cloud réel : le barème vient d'un price-book local versionné
// (data/cloud/price-book.json, valeurs FAKE-*). Le résultat est explicitement
// étiqueté « simulé / pédagogique / non officiel ». Sert à RAISONNER le coût
// (right-sizing, gaspillage), jamais à budgétiser un vrai déploiement.

const DISCLAIMER = 'Estimation PÉDAGOGIQUE et FACTICE (barème local fictif). Ce n\'est PAS un prix cloud réel ni un devis officiel.';

/** Barème par défaut (factice) si aucun price-book fourni. Unités arbitraires. */
const DEFAULT_UNIT_COST = {
  vm: 40, container: 25, serverless: 5, backend: 30, api: 30, worker: 20,
  'relational-db': 60, 'nosql-db': 45, 'managed-db': 60,
  'object-storage': 5, 'file-storage': 10, 'block-storage': 8,
  'load-balancer': 18, cache: 15, cdn: 12, nat: 32, gateway: 20,
  monitoring: 10, backup: 6, queue: 8, dns: 1,
};

/** Normalise un price-book (objet {kind:cost} ou tableau [{kind,cost}]) en Map. PUR. */
function toCostMap(priceBook) {
  const map = new Map(Object.entries(DEFAULT_UNIT_COST));
  if (Array.isArray(priceBook)) {
    for (const e of priceBook) if (e && typeof e.kind === 'string' && Number.isFinite(e.cost)) map.set(e.kind, e.cost);
  } else if (priceBook && typeof priceBook === 'object') {
    const entries = Array.isArray(priceBook.entries) ? priceBook.entries : null;
    if (entries) { for (const e of entries) if (e && typeof e.kind === 'string' && Number.isFinite(e.cost)) map.set(e.kind, e.cost); }
    else for (const [k, v] of Object.entries(priceBook)) if (Number.isFinite(v)) map.set(k, v);
  }
  return map;
}

/**
 * Estime le coût mensuel (factice, déterministe) d'une architecture. PUR.
 * Chaque ressource : unités (costHints.monthlyUnits ou 1) × coût unitaire du kind.
 * @returns {{ total, currency, byResource, simulated: true, disclaimer }}
 */
export function estimateMonthlyCost(arch = {}, priceBook = []) {
  const costMap = toCostMap(priceBook);
  const unitsByRes = new Map();
  for (const c of arch.costHints ?? []) {
    if (c && typeof c.resourceId === 'string' && Number.isFinite(c.monthlyUnits)) unitsByRes.set(c.resourceId, c.monthlyUnits);
  }
  const byResource = [];
  let total = 0;
  for (const r of arch.resources ?? []) {
    if (!r || typeof r.id !== 'string') continue;
    const unitCost = costMap.get(r.kind) ?? 0;
    const units = unitsByRes.has(r.id) ? unitsByRes.get(r.id) : 1;
    const cost = Math.round(unitCost * units * 100) / 100;
    total += cost;
    byResource.push({ resourceId: r.id, kind: r.kind, units, unitCost, cost });
  }
  byResource.sort((a, b) => b.cost - a.cost || a.resourceId.localeCompare(b.resourceId));
  return {
    total: Math.round(total * 100) / 100,
    currency: 'FAKE-UNITS',
    byResource,
    simulated: true,
    disclaimer: DISCLAIMER,
  };
}
