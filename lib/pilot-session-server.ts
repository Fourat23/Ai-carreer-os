// V77.1 · CP4 — L'IDENTITÉ D'UNE SESSION DE PILOTE.
//
// Le produit n'a pas de sessions : il a un fichier de progression. Le CP0 l'a
// mesuré (`R7`). Plutôt que d'inventer un objet « session » dans le moteur —
// ce qui aurait touché les 9 faits, la sérialisation et les quatre listes
// blanches — le pilote déclare son identité par l'ENVIRONNEMENT, et seule
// l'ARCHIVE la porte.
//
// Conséquence, à dire et non à cacher : **les faits eux-mêmes ne sont pas
// estampillés**. Un fait produit hors de la fenêtre de session est
// indiscernable d'un fait produit pendant. La parade est procédurale — un
// fichier de progression NEUF par participant (condition `N5` du CP1) — et non
// logicielle. C'est un choix, pas un oubli.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type IdentiteDeSession = {
  sessionId: string;
  protocolVersion: string;
  scopeId: string;
  /** Rappel explicite : l'identité vaut pour l'ARCHIVE, pas pour chaque fait. */
  portee: 'archive';
} | null;

/** La variable qui déclare une session. Absente = export ordinaire. */
export const VARIABLE_DE_SESSION = 'AICOS_PILOT_SESSION_ID';

export function identiteDeSession(): IdentiteDeSession {
  const sessionId = process.env[VARIABLE_DE_SESSION];
  if (!sessionId) return null;
  // La version et le scope viennent de la FIXTURE GELÉE, jamais de
  // l'environnement : un facilitateur ne doit pas pouvoir déclarer avoir suivi
  // un protocole qu'il n'a pas suivi.
  const fixture = JSON.parse(
    readFileSync(join(process.cwd(), 'data/pilot/v78-pilot-1.json'), 'utf8'),
  ) as { protocolVersion: string; scopeId: string };
  return {
    sessionId,
    protocolVersion: fixture.protocolVersion,
    scopeId: fixture.scopeId,
    portee: 'archive',
  };
}
