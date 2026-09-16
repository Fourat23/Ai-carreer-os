// V77.1 · CP4 — RECONSTRUIRE UNE SESSION À PARTIR DU SEUL EXPORT. Module PUR.
//
// C'est la mesure de l'outcome primaire gelé au CP1 :
//
//   > Une session est RECONSTRUCTIBLE si, à partir du SEUL export de session,
//   > une personne qui n'a pas assisté à la session peut établir la liste
//   > ordonnée des étapes, leur concept, leur moyen de constat, leur niveau de
//   > preuve, leur résultat et leur instant serveur — SANS AUCUNE INFÉRENCE.
//
// Ce module est donc écrit comme cette personne : il ne reçoit que l'archive et
// la fixture du protocole. Il n'a accès ni au serveur, ni aux journaux, ni au
// souvenir de ce qui s'est passé.
//
// ── LA RÈGLE QUI GOUVERNE CE FICHIER ────────────────────────────────────────
//
// **Quand il ne sait pas, il le DIT.** Il n'interpole pas, ne devine pas, ne
// choisit pas « le plus probable ». Chaque incertitude devient une ligne de
// `manques`, et une seule ligne suffit à rendre la session non reconstructible.
// Un reconstructeur indulgent mesurerait sa propre indulgence.

/** Ce qui peut manquer. Vocabulaire FERMÉ : un manque libre serait inclassable. */
export const GENRES_DE_MANQUE = Object.freeze([
  'ETAPE_ABSENTE',        // l'étape n'a laissé aucun fait
  'CHAMP_ABSENT',         // le fait existe mais un champ requis manque
  'AMBIGUITE',            // plusieurs faits pourraient être cette étape
  'ORDRE_INDETERMINE',    // deux faits portent le même instant
  'IDENTITE_ABSENTE',     // la session ou la version de protocole n'est pas dans l'archive
  'CONCEPT_MULTIPLE',     // le fait porte plusieurs concepts : on ne sait pas lequel
]);

/** Les codes de donnée manquante gelés au CP1 (§9). */
export const CODES_DE_DONNEE_MANQUANTE = Object.freeze(['NOT_OBSERVED', 'DECLINED', 'DELAY_OUT_OF_WINDOW']);

const tab = (v) => (Array.isArray(v) ? v : []);

/** Le parcours actif de l'archive, ou `null` si l'archive n'en porte pas. */
export function parcoursDeLArchive(archive) {
  const p = archive?.sauvegardeRestaurable?.progress;
  if (!p || typeof p !== 'object') return null;
  const id = p.activeTrackId;
  const t = p.tracks?.[id];
  return t && typeof t === 'object' ? t : null;
}

/** Les faits d'un genre, tels quels. Jamais complétés, jamais triés en silence. */
function faits(parcours, genre) {
  return tab(parcours?.[genre]);
}

/**
 * Les concepts que ce fait désigne. Rend `[]` quand le fait n'en porte aucun —
 * ce qui est une information, pas une absence à combler.
 */
function conceptsDuFait(f) {
  if (typeof f?.conceptId === 'string' && f.conceptId) return [f.conceptId];
  return tab(f?.conceptIds).filter((c) => typeof c === 'string' && c);
}

/**
 * L'instant d'un fait, selon son genre. Les preuves portent `createdAt`, les
 * tentatives portent `at` : le nom diffère, l'information est la même. Une
 * seule fonction le sait, et elle rend `null` plutôt que de choisir au hasard.
 */
export function instantDuFait(genre, f) {
  if (genre === 'evidence') return f?.createdAt ?? null;
  return f?.at ?? null;
}

/** La clé métier d'un fait : l'objet sur lequel il porte. */
export function cleDuFait(genre, f) {
  if (genre === 'evidence') return f?.sourceId ?? null;
  if (genre === 'transferAttempts') return f?.challengeId ?? null;
  if (genre === 'recallAttempts') return f?.conceptId ?? null;
  return f?.exerciseId ?? null;
}

function manque(genre, etape, quoi) {
  return { genre, etape, quoi };
}

/**
 * Reconstruit la session.
 *
 * @param {object} archive  le corps rendu par `/api/progress/export-all`
 * @param {object} fixture  `data/pilot/v78-pilot-1.json`
 * @returns {{etapes:object[], manques:object[], reconstructible:boolean, identite:object}}
 */
export function reconstruireLaSession(archive, fixture) {
  const manques = [];
  const parcours = parcoursDeLArchive(archive);

  // ── 1. L'IDENTITÉ — qui, sous quel protocole ──
  const identite = {
    sessionId: archive?.session?.sessionId ?? null,
    protocolVersion: archive?.session?.protocolVersion ?? null,
    scopeId: archive?.session?.scopeId ?? null,
    exportedAt: archive?.exportedAt ?? null,
  };
  if (!identite.sessionId) manques.push(manque('IDENTITE_ABSENTE', null, 'aucun identifiant de session dans l’archive'));
  if (!identite.protocolVersion) manques.push(manque('IDENTITE_ABSENTE', null, 'aucune version de protocole dans l’archive'));
  else if (fixture?.protocolVersion && identite.protocolVersion !== fixture.protocolVersion) {
    manques.push(manque('IDENTITE_ABSENTE', null, `version « ${identite.protocolVersion} » ≠ « ${fixture.protocolVersion} »`));
  }
  if (!identite.exportedAt) manques.push(manque('CHAMP_ABSENT', null, 'l’archive ne dit pas quand elle a été produite'));

  if (!parcours) {
    manques.push(manque('ETAPE_ABSENTE', null, 'l’archive ne contient aucun parcours'));
    return { etapes: [], manques, reconstructible: false, identite };
  }

  // ── 2. LES ÉTAPES, une par une, dans l'ordre déclaré par la fixture ──
  const etapes = [];
  const utilises = new Set();

  for (const decl of tab(fixture?.steps)) {
    if (decl.fait == null) {
      // Une étape qui ne laisse rien est PRÉVUE telle quelle : ce n'est pas un
      // manque, c'est une limite déclarée. Elle apparaît dans la trace pour
      // que le lecteur sache qu'elle a été prévue et qu'elle est muette.
      etapes.push({
        id: decl.id, n: decl.n, concept: decl.concept, fait: null,
        at: null, resultat: 'NON_OBSERVABLE', provenance: null, sourceRef: decl.surface,
        raison: 'étape sans fait par contrat',
      });
      continue;
    }

    // La CLÉ d'abord : une étape porte sur un objet nommé par la fixture
    // (`http-rate-limit-decide`, `throttling-everywhere`, un concept). Sans
    // elle, deux exercices différents se ressembleraient.
    const candidats = faits(parcours, decl.fait)
      .filter((f) => (decl.cle == null ? true : cleDuFait(decl.fait, f) === decl.cle))
      .filter((f) => (decl.grain === 'concept' && decl.concept
        ? conceptsDuFait(f).includes(decl.concept)
        : true))
      .filter((f) => !utilises.has(f));

    // ── COMBIEN DE FAITS CETTE ÉTAPE CONSOMME-T-ELLE ? ──
    //
    // Le PRETEST joue DEUX amorces de rappel ; le rappel immédiat une seule.
    // Rien dans un fait de rappel ne dit à quelle étape il appartient : seule
    // sa place dans le temps le dit, et lire cette place exige de savoir
    // combien de faits chaque étape consomme. La fixture le déclare AVANT la
    // session (`occurrences`), donc ce n'est pas une devinette.
    //
    // La limite, elle, est réelle et doit être dite : si un participant joue
    // une amorce de plus que prévu, l'alignement se décale et la
    // reconstruction devient fausse sans le savoir. La parade est la liste de
    // contrôle du facilitateur, pas le logiciel.
    const attendues = Number.isInteger(decl.occurrences) && decl.occurrences > 0 ? decl.occurrences : 1;

    if (candidats.length === 0) {
      manques.push(manque('ETAPE_ABSENTE', decl.id, `aucun fait « ${decl.fait} » pour « ${decl.concept ?? '—'} »`));
      etapes.push({ id: decl.id, n: decl.n, concept: decl.concept, fait: decl.fait, at: null, resultat: 'NOT_OBSERVED' });
      continue;
    }
    if (candidats.length < attendues) {
      manques.push(manque('ETAPE_ABSENTE', decl.id,
        `${candidats.length} fait(s) « ${decl.fait} » disponibles, ${attendues} attendu(s) par la fixture`));
    }

    // Le plus ancien non encore utilisé : l'ordre du protocole est gelé, donc
    // deux étapes du même genre se lisent dans l'ordre des instants.
    const tries = [...candidats].sort((a, b) => String(instantDuFait(decl.fait, a)).localeCompare(String(instantDuFait(decl.fait, b))));
    const f = tries[0];
    // L'étape consomme SES faits : sans quoi le suivant hériterait d'une amorce
    // qui ne lui appartient pas, et l'ordre paraîtrait cassé alors qu'il ne
    // l'est pas. Mesuré au CP4 : le rappel immédiat héritait de la seconde
    // amorce du PRETEST, et le rapport annonçait un instant « antérieur ».
    for (const c of tries.slice(0, attendues)) utilises.add(c);
    const instant = instantDuFait(decl.fait, f);

    if (tries.length > 1 && String(instant) === String(instantDuFait(decl.fait, tries[1]))) {
      manques.push(manque('ORDRE_INDETERMINE', decl.id, `deux faits « ${decl.fait} » portent l’instant ${instant}`));
    }

    if (instant == null) manques.push(manque('CHAMP_ABSENT', decl.id, 'aucun instant : on ne sait pas quand'));
    if (!f.provenance || typeof f.provenance.producer !== 'string') {
      manques.push(manque('CHAMP_ABSENT', decl.id, 'provenance.producer absent : on ne sait pas qui a constaté'));
    }

    // ── LES CONCEPTS ATTENDUS SONT DÉCLARÉS, PAS DEVINÉS ──
    //
    // Un défi de transfert relie PAR CONSTRUCTION un concept source et un
    // contexte d'arrivée : son fait porte les deux. Ce n'est pas une ambiguïté,
    // c'est une relation — à condition qu'elle ait été déclarée AVANT. La
    // fixture le fait (`conceptsAttendus`), et tout écart devient un manque.
    const concepts = conceptsDuFait(f);
    const attendus = tab(decl.conceptsAttendus);
    if (attendus.length) {
      const a = [...attendus].sort().join('|');
      const b = [...concepts].sort().join('|');
      if (a !== b) {
        manques.push(manque('CONCEPT_MULTIPLE', decl.id,
          `le fait porte ${JSON.stringify(concepts)}, la fixture attendait ${JSON.stringify(attendus)}`));
      }
    } else if (decl.origineDuConcept === 'fixture') {
      // Le fait ne porte AUCUN concept, et la fixture le déclare ainsi. Ce
      // n'est pas un manque : c'est une dérivation, nommée comme telle.
      if (concepts.length) {
        manques.push(manque('CONCEPT_MULTIPLE', decl.id,
          `la fixture annonce un concept dérivé, mais le fait en porte ${concepts.length}`));
      }
    } else if (decl.concept && concepts.length > 1) {
      manques.push(manque('CONCEPT_MULTIPLE', decl.id, `le fait porte ${concepts.length} concepts : ${concepts.join(', ')}`));
    }

    etapes.push({
      id: decl.id,
      n: decl.n,
      concept: decl.concept ?? (concepts.length === 1 ? concepts[0] : null),
      fait: decl.fait,
      at: instant,
      resultat: resultatDuFait(decl.fait, f),
      provenance: f.provenance ?? null,
      sourceRef: f.sourceRef ?? decl.surface,
      cle: cleDuFait(decl.fait, f),
      concepts,
      // D'où vient le concept de cette étape : du FAIT, ou de la FIXTURE ?
      // Un lecteur doit pouvoir compter les étapes qui dépendent du protocole
      // gelé plutôt que de la trace.
      origineDuConcept: decl.origineDuConcept ?? 'fait',
      occurrences: attendues,
    });
  }

  // ── 3. L'ORDRE RÉEL, confronté à l'ordre gelé ──
  const horodatees = etapes.filter((e) => e.at);
  for (let i = 1; i < horodatees.length; i += 1) {
    if (String(horodatees[i].at) < String(horodatees[i - 1].at)) {
      manques.push(manque('ORDRE_INDETERMINE', horodatees[i].id,
        `instant ${horodatees[i].at} antérieur à l’étape précédente (${horodatees[i - 1].at})`));
    }
  }

  // ── 4. CE QUI EST LU DANS LA TRACE, ET CE QUI VIENT DU PROTOCOLE ──
  const derivees = etapes.filter((e) => e.origineDuConcept === 'fixture').map((e) => e.id);

  return {
    etapes,
    manques,
    reconstructible: manques.length === 0,
    identite,
    conceptsDerivesDeLaFixture: derivees,
  };
}

/** Le RÉSULTAT d'une étape, lu dans le fait. Jamais deviné. */
export function resultatDuFait(genre, f) {
  if (genre === 'recallAttempts') return typeof f.outcome === 'string' ? f.outcome : 'INCONNU';
  if (genre === 'exerciseAttempts' || genre === 'transferAttempts') {
    if (typeof f.passed !== 'number' || typeof f.total !== 'number') return 'INCONNU';
    return f.passed === f.total ? 'reussi' : `echoue ${f.passed}/${f.total}`;
  }
  if (genre === 'evidence') {
    const st = f?.validation?.status;
    return typeof st === 'string' ? st : 'INCONNU';
  }
  if (genre === 'hintViews') return typeof f.action === 'string' ? f.action : 'INCONNU';
  return 'INCONNU';
}

/**
 * Le délai entre deux étapes, en heures, **lu sur les instants de l'archive**.
 * `null` si l'une des deux manque — jamais 0, jamais estimé.
 */
export function delaiEnHeures(etapes, idA, idB) {
  const a = etapes.find((e) => e.id === idA)?.at;
  const b = etapes.find((e) => e.id === idB)?.at;
  if (!a || !b) return null;
  return (Date.parse(b) - Date.parse(a)) / 3_600_000;
}

/** Le délai tombe-t-il dans la fenêtre gelée ? Rend un code, jamais un booléen nu. */
export function verdictDuDelai(heures, fenetre) {
  if (heures == null) return 'NOT_OBSERVED';
  const [min, max] = tab(fenetre).length === 2 ? fenetre : [0, Infinity];
  return heures >= min && heures <= max ? 'DANS_LA_FENETRE' : 'DELAY_OUT_OF_WINDOW';
}
