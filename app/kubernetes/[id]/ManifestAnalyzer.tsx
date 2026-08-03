'use client';
// Analyseur de manifests (V23 CP4). Panneaux structurés : Ressources / Diagnostics
// + éditeur JSON borné (textarea, aucun CodeMirror sur cette route) + simulation
// d'incident et de rollout. Tout est calculé côté serveur (routes déterministes) ;
// ce composant n'exécute rien. Accessible : clavier, focus, alternative textuelle.
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AlertOctagon, AlertTriangle, Info, Eye, Boxes, Activity, RotateCcw, PlayCircle } from 'lucide-react';

interface Resource { apiVersion: string; kind: string; metadata: { name?: string; namespace?: string; labels?: Record<string, string> }; spec?: Record<string, unknown> }
interface ManifestSet { id: string; resources: Resource[] }
interface Diagnostic {
  code: string; severity: string; category: string; resource: string; path: string;
  message: string; explanation: string; risk: string; recommendation: string; autofixable: boolean; glossary: string[];
}
interface Analysis { diagnostics: Diagnostic[]; summary: { bySeverity: Record<string, number>; byCategory: Record<string, number>; dimensions: string[]; total: number } }
interface Availability { state: string; reason: string; canExecute: boolean; version: string | null }
interface Incident { effects: { note: string; affected?: string[] }; reachable: boolean; podStates: { owner: string; phase: string; ready: boolean }[]; diagnostics: { code: string; severity: string; title: string; recommendation: string }[] }
interface Rollout { strategy: string; replicas: number; succeeded: boolean; steps: { step: string; available: number; note: string }[]; rollback: { available: number; note: string } }

const SEV = {
  blocking: { label: 'Bloquant', icon: AlertOctagon, cls: 'kb-sev-blocking' },
  risk: { label: 'Risque', icon: AlertTriangle, cls: 'kb-sev-risk' },
  warning: { label: 'Avertissement', icon: Info, cls: 'kb-sev-warning' },
  observation: { label: 'Observation', icon: Eye, cls: 'kb-sev-observation' },
} as const;
const INCIDENTS = [
  ['crashloop', 'CrashLoopBackOff'], ['oomkilled', 'OOMKilled'], ['imagepull', 'ImagePullBackOff'],
  ['pending', 'Pending'], ['no-endpoints', 'Service sans endpoints'], ['rollout-stuck', 'Rollout bloqué'],
  ['regression', 'Régression'], ['rollback-blocked', 'Rollback impossible'], ['secret-exposed', 'Secret exposé'],
] as const;
const AVAIL_LABEL: Record<string, string> = {
  absent: 'kubectl absent — analyse locale seule', 'cli-only': 'kubectl présent, aucun cluster',
  cluster: 'cluster joignable (exécution désactivée)', denied: 'accès refusé',
};

export default function ManifestAnalyzer({
  id, initialManifest, initialAnalysis, availability, dayRefs,
}: { id: string; initialManifest: ManifestSet; initialAnalysis: Analysis; availability: Availability; dayRefs: number[] }) {
  const [analysis, setAnalysis] = useState<Analysis>(initialAnalysis);
  const [draft, setDraft] = useState(() => JSON.stringify(initialManifest, null, 2));
  const [sevFilter, setSevFilter] = useState('');
  const [incident, setIncident] = useState<Incident | null>(null);
  const [incKind, setIncKind] = useState<string>('crashloop');
  const [rollout, setRollout] = useState<Rollout | null>(null);
  const [rolloutHealthy, setRolloutHealthy] = useState(false);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  const shownDiag = useMemo(
    () => analysis.diagnostics.filter((d) => !sevFilter || d.severity === sevFilter),
    [analysis.diagnostics, sevFilter],
  );

  const post = useCallback(async (payload: Record<string, unknown>, tag: string) => {
    setBusy(tag); setErr('');
    try {
      const res = await fetch(`/api/kubernetes/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error + (data.errors ? ` (${data.errors.slice(0, 3).join(', ')})` : '')); return null; }
      return data;
    } catch { setErr('Réseau local indisponible.'); return null; }
    finally { setBusy(''); }
  }, [id]);

  const analyze = useCallback(async () => {
    let manifest: unknown;
    try { manifest = JSON.parse(draft); } catch { setErr('JSON invalide dans l’éditeur.'); return; }
    const data = await post({ action: 'analyze', manifest }, 'analyze');
    if (data) { setAnalysis(data.analysis); setIncident(null); setRollout(null); }
  }, [draft, post]);

  const simulate = useCallback(async () => {
    const data = await post({ action: 'simulate', scenario: { kind: incKind } }, 'simulate');
    if (data) { setIncident(data.incident); setRollout(null); }
  }, [incKind, post]);

  const runRollout = useCallback(async () => {
    const data = await post({ action: 'rollout', options: { newImageHealthy: rolloutHealthy } }, 'rollout');
    if (data) { setRollout(data.rollout); setIncident(null); }
  }, [rolloutHealthy, post]);

  return (
    <div>
      <div className={`kb-avail kb-avail-${availability.state}`} role="status">
        <strong>Runtime :</strong> {AVAIL_LABEL[availability.state] ?? availability.state}. {availability.reason}.
        {' '}Aucune action ne déploie réellement (simulation déterministe).
      </div>

      <div className="cl-grid">
        {/* Colonne gauche : ressources + éditeur. */}
        <section className="cl-col" aria-label="Ressources">
          <h2 className="section-label"><Boxes size={14} /> Ressources ({initialManifest.resources.length})</h2>
          <table className="cl-table">
            <thead><tr><th>Kind</th><th>Nom</th><th>Namespace</th></tr></thead>
            <tbody>
              {initialManifest.resources.map((r, i) => (
                <tr key={i}><td><code>{r.kind}</code></td><td>{r.metadata?.name}</td><td>{r.metadata?.namespace ?? 'default'}</td></tr>
              ))}
            </tbody>
          </table>

          <h2 className="section-label" style={{ marginTop: 'var(--sp-4)' }}>Éditeur (JSON)</h2>
          <textarea
            className="kb-editor" value={draft} onChange={(e) => setDraft(e.target.value)}
            spellCheck={false} aria-label="Éditeur de manifest JSON" rows={16}
          />
          <div className="pl-filters" style={{ marginTop: 'var(--sp-2)' }}>
            <button type="button" className="btn primary" onClick={analyze} disabled={busy === 'analyze'}>
              {busy === 'analyze' ? 'Analyse…' : 'Analyser'}
            </button>
            <button type="button" className="btn ghost" onClick={() => { setDraft(JSON.stringify(initialManifest, null, 2)); setAnalysis(initialAnalysis); setErr(''); }}>
              <RotateCcw size={13} /> Réinitialiser
            </button>
          </div>
          {err && <p className="cl-error" role="alert">{err}</p>}
        </section>

        {/* Colonne droite : diagnostics + simulations. */}
        <section className="cl-col" aria-label="Diagnostics">
          <div className="cl-summary">
            {(['blocking', 'risk', 'warning', 'observation'] as const).map((s) => {
              const { label, icon: Ico, cls } = SEV[s];
              return (
                <button key={s} type="button" className={`cl-sevchip ${cls} ${sevFilter === s ? 'is-on' : ''}`}
                  aria-pressed={sevFilter === s} onClick={() => setSevFilter(sevFilter === s ? '' : s)}>
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
                  <div className="cl-diag-head"><Ico size={14} /> <strong>{d.message}</strong> <span className="wb-badge">{label}</span> <span className="wb-badge">{d.category}</span></div>
                  <p className="cl-diag-meta"><strong>Ressource :</strong> <code>{d.resource}</code> · <code>{d.path}</code></p>
                  <p className="cl-diag-exp">{d.explanation}</p>
                  <p className="cl-diag-meta"><strong>Risque :</strong> {d.risk}</p>
                  <p className="cl-diag-meta"><strong>Recommandation :</strong> {d.recommendation}{d.autofixable ? ' (corrigeable)' : ''}</p>
                </li>
              );
            })}
            {shownDiag.length === 0 && <li className="muted">Aucun diagnostic{sevFilter ? ' pour ce niveau' : ''}. {analysis.summary.total === 0 ? 'Ce manifest ne déclenche aucune règle.' : ''}</li>}
          </ul>

          <div className="cl-incident">
            <h2 className="section-label"><Activity size={14} /> Simuler un incident</h2>
            <div className="pl-filters">
              <label className="wb-field">
                <span className="section-label">Incident</span>
                <select value={incKind} onChange={(e) => setIncKind(e.target.value)}>
                  {INCIDENTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </label>
              <button type="button" className="btn" onClick={simulate} disabled={busy === 'simulate'}>{busy === 'simulate' ? 'Simulation…' : 'Simuler'}</button>
            </div>
            {incident && (
              <div className={`cl-scenres ${incident.reachable ? 'is-ok' : 'is-ko'}`} role="status">
                <p><strong>{incident.effects.note}</strong></p>
                <p>Service joignable : <strong>{incident.reachable ? 'oui' : 'non'}</strong>{incident.effects.affected?.length ? ` · affecté : ${incident.effects.affected.join(', ')}` : ''}.</p>
                {incident.diagnostics.map((d, i) => <p key={i} className="cl-diag-meta"><strong>{d.title} :</strong> {d.recommendation}</p>)}
              </div>
            )}

            <h2 className="section-label" style={{ marginTop: 'var(--sp-3)' }}><PlayCircle size={14} /> Simuler un rollout</h2>
            <div className="pl-filters">
              <label className="wb-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" checked={rolloutHealthy} onChange={(e) => setRolloutHealthy(e.target.checked)} />
                <span>nouvelle image saine</span>
              </label>
              <button type="button" className="btn" onClick={runRollout} disabled={busy === 'rollout'}>{busy === 'rollout' ? 'Rollout…' : 'Simuler le rollout'}</button>
            </div>
            {rollout && (
              <div className={`cl-scenres ${rollout.succeeded ? 'is-ok' : 'is-ko'}`} role="status">
                <p><strong>Stratégie {rollout.strategy} · {rollout.replicas} replicas · {rollout.succeeded ? 'réussi' : 'bloqué'}</strong></p>
                {rollout.steps.map((s, i) => <p key={i} className="cl-diag-meta">{s.step} — dispo {s.available} — {s.note}</p>)}
                {!rollout.succeeded && <p className="cl-diag-meta"><strong>Rollback :</strong> {rollout.rollback.note} (dispo {rollout.rollback.available}).</p>}
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
    </div>
  );
}
