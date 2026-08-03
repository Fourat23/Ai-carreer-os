'use client';
// Analyseur de scénario de sécurité (V24 CP3). Panneaux : Artefacts / Diagnostics /
// Remédiation (comparaison vulnérable↔corrigé) + simulation d'incident + « Que
// faire dans ce cas ? ». Tout est calculé côté serveur (routes déterministes) ;
// ce composant n'exécute rien. Accessible : clavier, focus, alternative textuelle.
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { AlertOctagon, AlertTriangle, Info, Eye, FileWarning, Activity, RotateCcw, ShieldCheck, LifeBuoy } from 'lucide-react';

interface Artifact { id: string; kind: string; path: string | null; content: unknown }
interface Scenario { id: string; artifacts: Artifact[] }
interface Diagnostic {
  code: string; severity: string; domain: string; resource: string; path: string;
  message: string; explanation: string; risk: string; recommendation: string;
  confidence: string; real: boolean; simulated: boolean; cwe: string | null; glossary: string[];
}
interface Analysis { diagnostics: Diagnostic[]; summary: { bySeverity: Record<string, number>; byDomain: Record<string, number>; dimensions: string[]; total: number; limits: string[] } }
interface Incident { incident: string; severity: string; phases: { phase: string; action: string }[]; order: string[]; decision: string | null }
type Playbook = Record<string, unknown> | null;

const SEV = {
  blocking: { label: 'Bloquant', icon: AlertOctagon, cls: 'sec-sev-blocking' },
  risk: { label: 'Risque', icon: AlertTriangle, cls: 'sec-sev-risk' },
  warning: { label: 'Avertissement', icon: Info, cls: 'sec-sev-warning' },
  observation: { label: 'Observation', icon: Eye, cls: 'sec-sev-observation' },
} as const;
const PHASE_LABEL: Record<string, string> = {
  detection: 'Détection', qualification: 'Qualification', containment: 'Confinement',
  eradication: 'Éradication', recovery: 'Récupération', 'post-mortem': 'Post-mortem',
};

function pretty(content: unknown) {
  if (typeof content === 'string') return content;
  try { return JSON.stringify(content, null, 2); } catch { return String(content); }
}

export default function SecurityAnalyzer({
  id, initialScenario, initialAnalysis, hasFixed, incident, playbook, dayRefs,
}: { id: string; initialScenario: Scenario; initialAnalysis: Analysis; hasFixed: boolean; incident: string | null; playbook: Playbook; dayRefs: number[] }) {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [analysis, setAnalysis] = useState<Analysis>(initialAnalysis);
  const [mode, setMode] = useState<'vuln' | 'fixed'>('vuln');
  const [sevFilter, setSevFilter] = useState('');
  const [incidentRes, setIncidentRes] = useState<Incident | null>(null);
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  const shownDiag = useMemo(
    () => analysis.diagnostics.filter((d) => !sevFilter || d.severity === sevFilter),
    [analysis.diagnostics, sevFilter],
  );

  const post = useCallback(async (payload: Record<string, unknown>, tag: string) => {
    setBusy(tag); setErr('');
    try {
      const res = await fetch(`/api/security/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? 'Erreur.'); return null; }
      return data;
    } catch { setErr('Réseau local indisponible.'); return null; }
    finally { setBusy(''); }
  }, [id]);

  const toggleRemediate = useCallback(async () => {
    if (mode === 'fixed') {
      const data = await post({ action: 'reset' }, 'toggle');
      if (data) { setScenario(data.scenario); setAnalysis(data.analysis); setMode('vuln'); setIncidentRes(null); }
    } else {
      const data = await post({ action: 'remediate' }, 'toggle');
      if (data) { setScenario(data.scenario); setAnalysis(data.analysis); setMode('fixed'); setIncidentRes(null); }
    }
  }, [mode, post]);

  const simulate = useCallback(async () => {
    const data = await post({ action: 'simulate', incident }, 'simulate');
    if (data) setIncidentRes(data.incident);
  }, [incident, post]);

  const pbArr = (k: string): string[] => (Array.isArray(playbook?.[k]) ? (playbook![k] as string[]) : []);

  return (
    <div>
      <div className={`sec-mode sec-mode-${mode}`} role="status">
        {mode === 'vuln'
          ? <><FileWarning size={15} /> État <strong>vulnérable</strong> — {analysis.summary.total} diagnostic(s). Analyse déterministe sur fixtures locales (pas un scanner réel).</>
          : <><ShieldCheck size={15} /> État <strong>corrigé</strong> — {analysis.summary.total} diagnostic(s) restant(s).</>}
      </div>

      <div className="cl-grid">
        {/* Colonne gauche : artefacts + remédiation. */}
        <section className="cl-col" aria-label="Artefacts">
          <div className="pl-filters" style={{ marginBottom: 'var(--sp-2)' }}>
            {hasFixed && (
              <button type="button" className="btn primary" onClick={toggleRemediate} disabled={busy === 'toggle'}>
                {mode === 'vuln' ? 'Voir l’état corrigé' : 'Revenir à l’état vulnérable'}
              </button>
            )}
            {incident && (
              <button type="button" className="btn" onClick={simulate} disabled={busy === 'simulate'}>
                <Activity size={13} /> {busy === 'simulate' ? 'Simulation…' : 'Simuler l’incident'}
              </button>
            )}
            {playbook && (
              <button type="button" className="btn ghost" onClick={() => setShowPlaybook((v) => !v)} aria-expanded={showPlaybook}>
                <LifeBuoy size={13} /> Que faire dans ce cas ?
              </button>
            )}
          </div>
          {err && <p className="cl-error" role="alert">{err}</p>}

          <h2 className="section-label"><FileWarning size={14} /> Artefacts ({scenario.artifacts.length})</h2>
          {scenario.artifacts.map((a) => (
            <div key={a.id} className="sec-artifact">
              <div className="sec-artifact-head"><code>{a.kind}</code> {a.path && <span className="muted">· {a.path}</span>}</div>
              <pre className="sec-code">{pretty(a.content)}</pre>
            </div>
          ))}
        </section>

        {/* Colonne droite : diagnostics + incident + playbook. */}
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
                  <div className="cl-diag-head"><Ico size={14} /> <strong>{d.message}</strong> <span className="wb-badge">{label}</span> <span className="wb-badge">{d.domain}</span> <span className="wb-badge">confiance {d.confidence}</span></div>
                  <p className="cl-diag-meta"><strong>Artefact :</strong> <code>{d.resource}</code> · <code>{d.path}</code>{d.cwe ? ` · ${d.cwe}` : ''}</p>
                  <p className="cl-diag-exp">{d.explanation}</p>
                  <p className="cl-diag-meta"><strong>Risque :</strong> {d.risk}</p>
                  <p className="cl-diag-meta"><strong>Recommandation :</strong> {d.recommendation}</p>
                </li>
              );
            })}
            {shownDiag.length === 0 && <li className="muted">{analysis.summary.total === 0 ? 'Aucun diagnostic : cet état ne déclenche aucune règle.' : 'Aucun diagnostic pour ce niveau.'}</li>}
          </ul>

          <details className="sec-limits"><summary>Limites de l’analyse (honnêtes)</summary>
            <ul>{analysis.summary.limits.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </details>

          {incidentRes && (
            <div className="sec-incident" role="status">
              <h2 className="section-label"><Activity size={14} /> Réponse à incident — {incidentRes.incident} (sévérité {incidentRes.severity})</h2>
              <ol className="sec-phases">
                {incidentRes.phases.map((p) => <li key={p.phase}><strong>{PHASE_LABEL[p.phase] ?? p.phase} :</strong> {p.action}</li>)}
              </ol>
              <p className="cl-diag-meta"><strong>Ordre :</strong> {incidentRes.order.join(' → ')}{incidentRes.decision ? ` · décision : ${incidentRes.decision}` : ''}</p>
            </div>
          )}

          {playbook && showPlaybook && (
            <div className="sec-playbook">
              <h2 className="section-label"><LifeBuoy size={14} /> Que faire dans ce cas ? — {String(playbook.situation ?? playbook.title ?? '')}</h2>
              {(['symptoms', 'firstChecks', 'doNot', 'containment', 'communication', 'correction', 'validation', 'monitoring', 'documentation', 'prevention', 'exitCriteria'] as const).map((k) => {
                const arr = pbArr(k); if (!arr.length) return null;
                const LBL: Record<string, string> = { symptoms: 'Symptômes', firstChecks: 'Premières vérifications', doNot: 'À ne pas faire', containment: 'Confinement', communication: 'Communication', correction: 'Correction', validation: 'Validation', monitoring: 'Surveillance', documentation: 'Documentation', prevention: 'Prévention', exitCriteria: 'Critères de sortie' };
                return (<div key={k} className="sec-pb-block"><strong>{LBL[k]}</strong><ul>{arr.map((x, i) => <li key={i}>{x}</li>)}</ul></div>);
              })}
            </div>
          )}

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
