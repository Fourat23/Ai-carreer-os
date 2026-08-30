/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/resilience-patterns.md (exemple guidé).
 *
 *   1. Temps d'attente maximal vu par l'utilisateur : délai d'attente 2 s,
 *      3 tentatives, recul exponentiel. Calcul ET mesure (horloge accélérée).
 *   2. Une dépendance totalement tombée, 200 requêtes utilisateur :
 *      combien d'appels lui parviennent, et combien de temps chacune attend,
 *      SANS puis AVEC disjoncteur ?
 *
 * Le temps est simulé (horloge virtuelle) pour que le script s'exécute en
 * quelques millisecondes : les durées publiées sont celles du modèle, pas
 * des mesures d'horloge murale. C'est déclaré ici et dans la leçon.
 *
 * Exécution : node scripts/v70-verifications/disjoncteur-et-attente.mjs
 */

// ---------- horloge virtuelle ----------
let maintenant = 0;
const attendre = (ms) => { maintenant += ms; };

// ---------- dépendance ----------
function dependance({ tombee, latenceMs }) {
  let appels = 0;
  return {
    get appels() { return appels; },
    appeler(timeoutMs) {
      appels++;
      if (tombee) { attendre(Math.min(timeoutMs, latenceMs)); throw new Error('indisponible'); }
      attendre(latenceMs);
      return 'ok';
    },
  };
}

// ---------- 1. attente maximale ----------
{
  const TIMEOUT = 2000, ESSAIS = 3, BASE = 200;
  const dep = dependance({ tombee: true, latenceMs: 10_000 });
  maintenant = 0;
  for (let i = 0; i < ESSAIS; i++) {
    try { dep.appeler(TIMEOUT); } catch {}
    if (i < ESSAIS - 1) attendre(BASE * 2 ** i);          // recul : 200 puis 400
  }
  const calcul = ESSAIS * TIMEOUT + BASE * (2 ** (ESSAIS - 1) - 1);
  console.log('=== 1. attente maximale (délai 2 s, 3 essais, recul 200 ms) ===');
  console.log('calcul  : 3 × 2000 + (200 + 400) =', calcul, 'ms');
  console.log('mesuré  :', maintenant, 'ms');
  console.log('appels reçus par la dépendance :', dep.appels, '\n');
}

// ---------- 2. avec et sans disjoncteur ----------
function disjoncteur({ seuil = 5, ouvertureMs = 30_000 } = {}) {
  let echecs = 0, ouvertJusqua = -1;
  return {
    passe(fn) {
      if (maintenant < ouvertJusqua) throw new Error('CIRCUIT_OUVERT');   // échec immédiat
      try {
        const r = fn();
        echecs = 0;
        return r;
      } catch (e) {
        if (++echecs >= seuil) { ouvertJusqua = maintenant + ouvertureMs; echecs = 0; }
        throw e;
      }
    },
  };
}

function campagne({ avecDisjoncteur }) {
  const dep = dependance({ tombee: true, latenceMs: 10_000 });
  const dj = disjoncteur();
  const TIMEOUT = 2000, ESSAIS = 3, BASE = 200;
  maintenant = 0;
  let attenteTotale = 0, pireAttente = 0, echecsImmediats = 0;

  for (let r = 0; r < 200; r++) {
    const debut = maintenant;
    for (let i = 0; i < ESSAIS; i++) {
      try {
        if (avecDisjoncteur) dj.passe(() => dep.appeler(TIMEOUT));
        else dep.appeler(TIMEOUT);
        break;
      } catch (e) {
        if (e.message === 'CIRCUIT_OUVERT') { echecsImmediats++; break; }
        if (i < ESSAIS - 1) attendre(BASE * 2 ** i);
      }
    }
    const duree = maintenant - debut;
    attenteTotale += duree;
    pireAttente = Math.max(pireAttente, duree);
    attendre(50);                                  // 20 requêtes par seconde
  }
  return {
    appelsRecusParLaDependance: dep.appels,
    attenteMoyenneMs: Math.round(attenteTotale / 200),
    pireAttenteMs: pireAttente,
    echecsImmediats,
  };
}

console.log('=== 2. dépendance totalement tombée, 200 requêtes utilisateur ===');
console.log('sans disjoncteur :', JSON.stringify(campagne({ avecDisjoncteur: false })));
console.log('avec disjoncteur :', JSON.stringify(campagne({ avecDisjoncteur: true })));
