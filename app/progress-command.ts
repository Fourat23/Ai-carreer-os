// Client unique des commandes de progression (ADR-064).
//
// AVANT V64, chaque composant faisait son propre `fetch` : trois vérifiaient
// `res.ok`, un ne le vérifiait pas du tout — un échec réseau se présentait
// alors comme un clic sans effet visible. Ici, un échec est TOUJOURS une
// valeur de retour explicite que l'appelant doit afficher.
//
// Ce module ne connaît qu'un seul verbe : envoyer une commande nommée.

export type CommandOk = { ok: true; effects: string[] };
export type CommandErr = { ok: false; code: string; error: string };
export type CommandResult = CommandOk | CommandErr;

export async function sendCommand(
  command: Record<string, unknown>,
  opts: { keepalive?: boolean } = {},
): Promise<CommandResult> {
  let res: Response;
  try {
    res = await fetch('/api/progress', {
      method: 'POST',
      keepalive: opts.keepalive === true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
  } catch {
    return { ok: false, code: 'NETWORK', error: 'Enregistrement impossible — réessaie.' };
  }
  const body = (await res.json().catch(() => null)) as CommandResult | null;
  if (!res.ok || !body || body.ok !== true) {
    return {
      ok: false,
      code: body && 'code' in body ? body.code : 'HTTP_' + res.status,
      error: (body && 'error' in body && body.error) || 'Enregistrement refusé par le serveur.',
    };
  }
  return body;
}

/** Signale aux surfaces montées que la progression a changé. */
export function announceProgressChanged(): void {
  window.dispatchEvent(new CustomEvent('progress-changed'));
}
