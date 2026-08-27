// V58 · CP4 — COQUILLE DE POSTE DE TRAVAIL (détail technique).
//
// Constat du CP0, identique sur les cinq routes de détail technique
// (`/pipelines/[id]`, `/security/[id]`, `/kubernetes/[id]`, `/cloud-lab/[id]`,
// `/cloud-foundations/[id]`) : un `.page-head` puis un flux à deux colonnes
// SANS aucune section. 2 à 3 fonds, **zéro ombre**. Le panneau de diagnostic —
// la sortie la plus importante de la page — n'avait ni cadre ni élévation, et
// deux à trois actions se disputaient la même priorité.
//
// La grammaire métier existe déjà DANS LE CONTENU ; le travail est de la
// rendre perceptible dans la structure :
//
//   CONTEXTE       — de quel scénario il s'agit, d'où l'on vient
//   ÉTAT SYSTÈME   — ce que la machine dit AVANT toute action
//   DIAGNOSTIC     — le verdict, avec la priorité visuelle qui lui revient
//   OPÉRATION      — l'atelier : artefact éditable, actions, validation
//   PROLONGEMENTS  — les journées du curriculum reliées
//
// Aucun motif propriétaire : aucun des cinq n'exprime « analyse d'un artefact
// technique ». L'échelle de sévérité est un compteur étiqueté — un composant
// standard — et non un sixième motif.
//
// Aucune donnée fabriquée : `severity` provient de `analysis.summary.bySeverity`,
// contrat réellement partagé par les trois moteurs d'analyse purs.
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ContextLine } from './ContextLine';
import { SurfaceHead, type SurfaceFact } from './SurfaceHead';

export type SeverityCounts = Partial<Record<'blocking' | 'risk' | 'warning' | 'observation', number>>;

const SEV = [
  { k: 'blocking', label: 'Bloquant', cls: 'blk' },
  { k: 'risk', label: 'Risque', cls: 'rsk' },
  { k: 'warning', label: 'Avertissement', cls: 'wrn' },
  { k: 'observation', label: 'Observation', cls: 'obs' },
] as const;

export function WorkbenchShell({
  backHref, backLabel, eyebrowExtra, title, lead, facts = [],
  systemState, severity, severityNote, children, days = [], related = [], limits,
}: {
  backHref: string;
  backLabel: string;
  eyebrowExtra?: ReactNode;
  title: string;
  lead?: ReactNode;
  facts?: SurfaceFact[];
  /** Ce que la machine dit avant toute action (runtime, disponibilité, mode). */
  systemState?: { k: string; v: ReactNode; tone?: 'ok' | 'warn' | 'neutral' }[];
  /** Comptes RÉELS par sévérité, issus du moteur d'analyse. */
  severity?: SeverityCounts | null;
  severityNote?: ReactNode;
  /** Ce que le laboratoire ne fait pas — information de sécurité, pas un ornement. */
  limits?: string[];
  children: ReactNode;
  days?: number[];
  related?: { href: string; label: string }[];
}) {
  const total = severity
    ? SEV.reduce((n, s) => n + (severity[s.k] ?? 0), 0)
    : null;

  return (
    <div className="wbs">
      {/* V62 · CP11 — La ligne de contexte descend dans la coquille de poste
          de travail : cinq routes de détail technique la reçoivent d'un coup,
          avec les FAITS que chaque page calcule déjà — rien n'est ajouté au
          modèle, seul le registre commun l'est. La provenance (« ← retour »)
          reste dans la bande d'identité : c'est elle qui porte la navigation,
          la ligne de contexte porte l'état. */}
      {(() => {
        // `SurfaceFact` accepte `false | null` pour les faits conditionnels :
        // on ne garde que les faits réellement présents.
        const real = facts.filter((f): f is { k: string; v: ReactNode } => Boolean(f));
        return real.length > 0 ? (
          <ContextLine
            label={`État — ${title}`}
            facts={real.map((f, i) => ({ k: f.k, v: f.v, here: i === 0 }))}
          />
        ) : null;
      })()}
      <SurfaceHead
        kind="workbench"
        eyebrow={<><Link href={backHref}>← {backLabel}</Link>{eyebrowExtra ? <> <span className="sep">/</span> {eyebrowExtra}</> : null}</>}
        title={title}
        lead={lead}
        facts={facts}
      />

      {/* ── ÉTAT SYSTÈME + DIAGNOSTIC ──────────────────────────────────────
          Les deux sont côte à côte parce qu'on les lit ensemble : ce que la
          machine peut faire, et ce qu'elle a trouvé. Le diagnostic occupe la
          part dominante — c'est la sortie de la page, pas une note de bas de
          page (défaut mesuré au CP0). */}
      {(systemState?.length || severity) && (
        <section className="wbs-state" aria-label="État du système et diagnostic">
          {systemState && systemState.length > 0 && (
            <div className="wbs-sys">
              <h2 className="wbs-h">État du système</h2>
              <dl className="wbs-sys-list">
                {systemState.map((s) => (
                  <div key={s.k} className={`wbs-sys-i t-${s.tone ?? 'neutral'}`}>
                    <dt>{s.k}</dt><dd>{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {severity && (
            <div className="wbs-diag">
              <div className="wbs-diag-head">
                <h2 className="wbs-h">Diagnostic</h2>
                <span className="wbs-h-note">
                  {total === 0
                    ? 'aucune règle déclenchée'
                    : `${total} constat${total! > 1 ? 's' : ''} · analyse locale déterministe`}
                </span>
              </div>
              <ol className="wbs-sev">
                {SEV.map((s) => {
                  const n = severity[s.k] ?? 0;
                  return (
                    <li key={s.k} className={`wbs-sev-i s-${s.cls}${n > 0 ? ' has' : ''}`}>
                      <span className="wbs-sev-n">{n}</span>
                      <span className="wbs-sev-k">{s.label}</span>
                    </li>
                  );
                })}
              </ol>
              {severityNote && <p className="wbs-diag-note">{severityNote}</p>}
            </div>
          )}
        </section>
      )}

      {limits && limits.length > 0 && (
        <section className="wbs-limits" aria-label="Limites de la simulation">
          <h2 className="wbs-h">Ce que cette analyse ne fait pas</h2>
          <ul className="wbs-limit-list">{limits.map((l) => <li key={l}>{l}</li>)}</ul>
        </section>
      )}

      {/* ── OPÉRATION : l'atelier lui-même ─────────────────────────────── */}
      <section className="wbs-work" aria-label="Artefact, opérations et validation">
        {children}
      </section>

      {(days.length > 0 || related.length > 0) && (
        <nav className="wbs-related" aria-label="Pour aller plus loin">
          <span className="wbs-related-k">Pour aller plus loin</span>
          {days.slice(0, 4).map((d) => (
            <Link key={d} href={`/day/${d}`}>Jour {d}</Link>
          ))}
          {related.map((r) => <Link key={r.href} href={r.href}>{r.label}</Link>)}
        </nav>
      )}
    </div>
  );
}
