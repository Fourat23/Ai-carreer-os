// Vocabulaire produit des compétences — ADAPTATEUR DE PRÉSENTATION PUR (V52).
// NE détient AUCUNE vérité : réutilise SKILL_STATE_LABEL (lib/skill-state.mjs) et
// associe à chaque état un TON sémantique + l'exigence d'explication. La couleur
// n'est jamais seule porteuse d'information : chaque statut a un label et un ton.
import { SKILL_STATES, SKILL_STATE_LABEL } from './skill-state.mjs';

// Tons sémantiques UI (jamais une couleur brute) : neutral·info·positive·attention·blocking.
const TONE_BY_STATE = {
  'not-started': 'neutral',
  discovered: 'info',
  practiced: 'info',
  demonstrated: 'positive',
  'to-consolidate': 'attention',
};

/**
 * Descripteur de présentation d'un état de compétence. PUR.
 * @returns {{state, label, tone, requiresExplanation:true}}
 */
export function skillStatusToken(state) {
  const s = SKILL_STATES.includes(state) ? state : 'not-started';
  return { state: s, label: SKILL_STATE_LABEL[s] ?? s, tone: TONE_BY_STATE[s] ?? 'neutral', requiresExplanation: true };
}

/** Tous les tokens de statut (pour légende/UI). PUR. */
export function allSkillStatusTokens() {
  return SKILL_STATES.map(skillStatusToken);
}

/** Ordre d'affichage recommandé : ce qui appelle une action d'abord. PUR. */
export const STATUS_DISPLAY_ORDER = ['to-consolidate', 'practiced', 'discovered', 'not-started', 'demonstrated'];

/** Rang d'affichage (plus petit = plus prioritaire à traiter). PUR. */
export function statusRank(state) {
  const i = STATUS_DISPLAY_ORDER.indexOf(state);
  return i === -1 ? STATUS_DISPLAY_ORDER.length : i;
}
