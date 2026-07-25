// Accès serveur au catalogue (mémoïsé) : construit une fois depuis le programme.
// Le catalogue est statique par programme ; les routes le consomment sans
// reconstruire à chaque requête.
import { getProgram } from './program';
import { buildCatalogue, type Catalogue } from './catalogue';

let cached: Catalogue | null = null;

export function getCatalogue(): Catalogue {
  if (!cached) cached = buildCatalogue(getProgram());
  return cached;
}
