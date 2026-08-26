'use client';
// Analyseur de topologie (V22 CP4). Panneaux structurés : Composants / Connexions
// / Diagnostics, plus simulation d'incident bornée (allowlist). Tout est calculé
// côté serveur (routes déterministes) ; ce composant n'exécute rien lui-même.
// Accessible : navigation clavier, focus visible, alternative textuelle complète.
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AlertOctagon, AlertTriangle, Info, Eye, Server, Share2, Activity, RotateCcw } from 'lucide-react';

interface Node { id: string; kind: string; label: string; zone: string | null; environment: string | null; props: Record<string, unknown> }
interface Edge { id: string; from: string; to: string; kind: string; props: Record<string, unknown> }
interface Topology { id: string; title: string; nodes: Node[]; edges: Edge[]; environments: string[]; zones: { id: string; label: string }[] }
interface Diagnostic {
  code: string; severity: string; dimension: string; title: string; explanation: string;
  evidence: string[]; impact: string; recommendation: string; tradeoff: string; skills: string[]; glossary: string[];
}
interface Analysis { diagnostics: Diagnostic[]; summary: { bySeverity: Record<string, number>; dimensions: string[]; total: number } }
interface ScenarioResult {
  effects: { removed: string[]; note: string }; survived: boolean;
  before: { clientToService: boolean }; after: { clientToService: boolean }; diagnostics: Diagnostic[];
}

const SEV = {
  blocking: { label: 'Bloquant', icon: AlertOctagon, cls: 'cl-sev-blocking' },
  risk: { label: 'Risque', icon: AlertTriangle, cls: 'cl-sev-risk' },
  warning: { label: 'Avertissement', icon: Info, cls: 'cl-sev-warning' },
  observation: { label: 'Observation', icon: Eye, cls: 'cl-sev-observation' },
} as const;
type ScenSpec = { kind: string; label: string; needsNode?: boolean; needsZone?: boolean };
const SCEN: ScenSpec[] = [
  { kind: 'traffic-spike', label: 'Pic de charge' },
  { kind: 'drop-zone', label: 'Perte d’une zone', needsZone: true },
  { kind: 'drop-node', label: 'Perte d’un composant', needsNode: true },
  { kind: 'dependency-down', label: 'Dépendance indisponible', needsNode: true },
];

export default function TopologyAnalyzer({
  id, initialTopology, initialAnalysis, dayRefs,
}: { id: string; initialTopology: Topology; initialAnalysis: Analysis; dayRefs: number[] }) {
  const topo = initialTopology;
  const [analysis] = useState<Analysis>(initialAnalysis);
  const [sevFilter, setSevFilter] = useState('');
  const [scenario, setScenario] = useState<ScenarioResult | null>(null);
  const [scenKind, setScenKind] = useState<string>('traffic-spike');
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const zoneLabel = useCallback((zid: string | null) => topo.zones.find((z) => z.id === zid)?.label ?? '—', [topo.zones]);
  const nodeLabel = useCallback((nid: string) => topo.nodes.find((n) => n.id === nid)?.label ?? nid, [topo.nodes]);

  const shownDiag = useMemo(
    () => analysis.diagnostics.filter((d) => !sevFilter || d.severity === sevFilter),
    [analysis.diagnostics, sevFilter],
  );

  const activeScen = SCEN.find((s) => s.kind === scenKind);

  const runScenario = useCallback(async () => {
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/cloud-lab/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scenario', scenario: { kind: scenKind, target: target || undefined } }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? 'Erreur.'); setScenario(null); }
      else setScenario(data.scenario);
    } catch { setErr('Réseau local indisponible.'); }
    finally { setBusy(false); }
  }, [id, scenKind, target]);

  return (
    <div className="cl-grid">
      {/* Colonne gauche : composants + connexions. */}
      <section className="cl-col" aria-label="Architecture">
        <h2 className="section-label"><Server size={14} /> Composants ({topo.nodes.length})</h2>
        {/* V61 · CP13 — `tabIndex` : ces tableaux défilent horizontalement en
            écran étroit. Sans lui, on ne peut pas atteindre leurs dernières
            colonnes au clavier (`scrollable-region-focusable`, relevé à 375 px
            par le tirage au sort). */}
        <table className="cl-table" tabIndex={0} aria-label={`Composants de l’architecture (${topo.nodes.length})`}>
          <thead><tr><th>Composant</th><th>Type</th><th>Zone</th><th>Env.</th></tr></thead>
          <tbody>
            {topo.nodes.map((n) => (
              <tr key={n.id}>
                <td>{n.label}</td>
                <td><code>{n.kind}</code></td>
                <td>{zoneLabel(n.zone)}</td>
                <td>{n.environment ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="section-label" style={{ marginTop: 'var(--sp-4)' }}><Share2 size={14} /> Connexions ({topo.edges.length})</h2>
        <table className="cl-table" tabIndex={0} aria-label={`Connexions entre composants (${topo.edges.length})`}>
          <thead><tr><th>De</th><th>Flux</th><th>Vers</th></tr></thead>
          <tbody>
            {topo.edges.map((e) => (
              <tr key={e.id}>
                <td>{nodeLabel(e.from)}</td>
                <td><code>{e.kind}</code>{e.props?.tls ? ' 🔒' : ''}</td>
                <td>{nodeLabel(e.to)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Colonne droite : diagnostics + incident. */}
      <section className="cl-col" aria-label="Diagnostics">
        <div className="cl-summary">
          {(['blocking', 'risk', 'warning', 'observation'] as const).map((s) => {
            const { label, icon: Ico, cls } = SEV[s];
            return (
              <button
                key={s} type="button"
                className={`cl-sevchip ${cls} ${sevFilter === s ? 'is-on' : ''}`}
                aria-pressed={sevFilter === s}
                onClick={() => setSevFilter(sevFilter === s ? '' : s)}
              >
                <Ico size={13} /> {analysis.summary.bySeverity[s]} {label}
              </button>
            );
          })}
        </div>

        <ul className="cl-diags">
          {shownDiag.map((d, i) => {
            const { label, icon: Ico, cls } = SEV[d.severity as keyof typeof SEV] ?? SEV.observation;
            return (
              <li key={`${d.code}-${i}`} className={`cl-diag ${cls}`}>
                <div className="cl-diag-head"><Ico size={14} /> <strong>{d.title}</strong> <span className="wb-badge">{label}</span> <span className="wb-badge">{d.dimension}</span></div>
                <p className="cl-diag-exp">{d.explanation}</p>
                <p className="cl-diag-meta"><strong>Preuve :</strong> {d.evidence.map(nodeLabel).join(', ') || '—'}</p>
                <p className="cl-diag-meta"><strong>Impact :</strong> {d.impact}</p>
                <p className="cl-diag-meta"><strong>Recommandation :</strong> {d.recommendation}</p>
                <p className="cl-diag-meta cl-tradeoff"><strong>Compromis :</strong> {d.tradeoff}</p>
              </li>
            );
          })}
          {shownDiag.length === 0 && <li className="muted">Aucun diagnostic{sevFilter ? ' pour ce niveau' : ''}. {analysis.summary.total === 0 ? 'Cette architecture ne déclenche aucune règle.' : ''}</li>}
        </ul>

        <div className="cl-incident">
          <h2 className="section-label"><Activity size={14} /> Simuler un incident</h2>
          <div className="pl-filters">
            <label className="wb-field">
              <span className="section-label">Scénario</span>
              <select value={scenKind} onChange={(e) => { setScenKind(e.target.value); setTarget(''); setScenario(null); }}>
                {SCEN.map((s) => <option key={s.kind} value={s.kind}>{s.label}</option>)}
              </select>
            </label>
            {activeScen?.needsNode && (
              <label className="wb-field">
                <span className="section-label">Composant</span>
                <select value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="">choisir…</option>
                  {topo.nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
              </label>
            )}
            {activeScen?.needsZone && (
              <label className="wb-field">
                <span className="section-label">Zone</span>
                <select value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="">choisir…</option>
                  {topo.zones.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
                </select>
              </label>
            )}
            <button type="button" className="btn" onClick={runScenario} disabled={busy || ((activeScen?.needsNode || activeScen?.needsZone) && !target)}>
              {busy ? 'Simulation…' : 'Simuler'}
            </button>
            {scenario && <button type="button" className="btn ghost" onClick={() => { setScenario(null); setErr(''); }}><RotateCcw size={13} /> Effacer</button>}
          </div>
          {err && <p className="cl-error" role="alert">{err}</p>}
          {scenario && (
            <div className={`cl-scenres ${scenario.survived ? 'is-ok' : 'is-ko'}`} role="status">
              <p><strong>{scenario.effects.note}</strong></p>
              <p>Service joignable depuis les clients : <strong>{scenario.after.clientToService ? 'oui' : 'non'}</strong>{scenario.effects.removed.length ? ` (retiré : ${scenario.effects.removed.map(nodeLabel).join(', ')})` : ''}.</p>
              {scenario.diagnostics.map((d, i) => (
                <p key={i} className="cl-diag-meta"><strong>{(SEV[d.severity as keyof typeof SEV] ?? SEV.observation).label} :</strong> {d.title} — {d.recommendation}</p>
              ))}
            </div>
          )}
        </div>

        {dayRefs.length > 0 && (
          <p className="muted" style={{ marginTop: 'var(--sp-3)' }}>
            Théorie liée : {dayRefs.map((d) => <Link key={d} href={`/day/${d}`}>jour {d}</Link>).reduce((a, b) => <>{a} · {b}</>)}
          </p>
        )}
      </section>
    </div>
  );
}
