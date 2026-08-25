// V60.1 · CAREER WORKSTATION — extraction de données, STRICTEMENT en lecture.
//
// Aucune écriture. Aucune seconde source de vérité. Tout est dérivé de
// `data/program.json`, de `data/day-exercises.json` et du corpus Markdown.
//
// Rappel du constat V60, revérifié au CP0 : `data/progress.json` ET
// `data/progress.example.json` contiennent ZÉRO journée enregistrée. Il
// n'existe aucune progression dans ce produit. Les prototypes ne dessinent
// donc aucun remplissage de progression : ils déclarent l'absence.
import { getProgram, getDayHtml } from '@/lib/program';
import { annotateDayHtml } from '@/lib/section-family';
import { decodeEntities } from '@/lib/doc-sections';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack } from '@/lib/catalogue';

export type CwDay = {
  day: number; week: number; month: number; title: string;
  skill: string; skillName: string; difficulty: number; hours: number;
  isReview: boolean; project: number | null; deliverable: string | null;
};

export type CwMonth = {
  month: number; title: string; summary: string;
  project: { id: number; name: string } | null;
  days: CwDay[]; hours: number; weeks: number[];
  skills: { id: string; name: string; days: number }[];
  reviewDays: number; peakDifficulty: number;
};

/** Snapshot immuable consommé par les trois surfaces. */
export function cwData() {
  const program = getProgram();
  const progress = readProgress();
  const catalogue = getCatalogue();
  const track = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];

  const skillName = new Map<string, string>((program.skills ?? []).map((s) => [s.id, s.name] as const));

  const days: CwDay[] = (program.days ?? []).map((d) => ({
    day: d.day, week: d.week, month: d.month, title: d.title,
    skill: d.skill, skillName: d.skillName || skillName.get(d.skill) || '',
    difficulty: d.difficulty, hours: d.hours, isReview: d.isReview,
    project: d.project ?? null, deliverable: d.deliverable ?? null,
  }));

  const months: CwMonth[] = (program.months ?? []).map((m) => {
    const md = days.filter((d) => d.month === m.month);
    const freq = new Map<string, number>();
    for (const d of md) if (d.skill) freq.set(d.skill, (freq.get(d.skill) ?? 0) + 1);
    return {
      month: m.month, title: m.title, summary: m.summary, project: m.project ?? null,
      days: md,
      hours: Math.round(md.reduce((s, d) => s + d.hours, 0)),
      weeks: [...new Set(md.map((d) => d.week))].sort((a, b) => a - b),
      skills: [...freq.entries()].sort((a, b) => b[1] - a[1])
        .map(([id, n]) => ({ id, name: skillName.get(id) ?? id, days: n })),
      reviewDays: md.filter((d) => d.isReview).length,
      peakDifficulty: md.reduce((mx, d) => Math.max(mx, d.difficulty), 0),
    };
  });

  const recorded = Object.keys(progress.days ?? {}).length;

  return {
    days, months,
    weeks: program.weeks ?? [],
    skills: program.skills ?? [],
    totalDays: days.length,
    trackTitle: String(track?.title ?? track?.id ?? ''),
    hours: Math.round(days.reduce((s, d) => s + d.hours, 0)),
    reviewDays: days.filter((d) => d.isReview).length,
    projects: months.filter((m) => m.project).length,
    progress: {
      available: recorded > 0,
      recordedDays: recorded,
      /** Journée de reprise RÉELLE. Sans aucun enregistrement, c'est 1. */
      resumeDay: 1,
    },
  };
}

export type CwSection = {
  id: string; family: string | null; label: string; body: string;
  /**
   * Rang de la section dans la journée, 1..n. UN SEUL numéro par section, pour
   * TOUT l'écran. Défaut relevé au CP7 : le rail numérotait globalement
   * (« 04 Pratique autonome ») pendant que les colonnes renumérotaient
   * localement (« 01 Pratique autonome ») — la même section portait deux
   * numéros différents à 900 px d'écart sur la même image.
   */
  n: number;
  /** Longueur réelle du corps, en caractères de texte. Sert à équilibrer. */
  weight: number;
  /** Corps réduit au texte. Sert à détecter les doublons verbatim. */
  text: string;
};

/**
 * Les familles pédagogiques du corpus qui relèvent de l'ACTION plutôt que de
 * la lecture. Cette répartition n'invente rien : elle lit `data-family`, que
 * `annotateDayHtml` pose déjà à partir des intitulés réels des sections.
 */
export const ACTION_FAMILIES = new Set(['practice', 'apply', 'verify', 'prepare']);

export const FAMILY_LABEL: Record<string, string> = {
  objective: 'Cadrer', learn: 'Apprendre', observe: 'Observer', practice: 'Pratiquer',
  apply: 'Produire', prepare: 'Préparer', verify: 'Vérifier', retain: 'Retenir',
};

/**
 * Une journée réelle, découpée en sections de LECTURE et sections d'ACTION.
 *
 * Le découpage lit `h2-text` seul comme intitulé (le `h2` annoté contient
 * aussi un `h2-eyebrow` numéroté : les aplatir ensemble produisait
 * « 01 · 01 · Cadrer Objectif du jour », défaut relevé en V60) et décode les
 * entités (« Consigne d&#39;utilisation », même famille de bug qu'en V59).
 */
export function cwDay(dayNum: number) {
  const program = getProgram();
  const meta = (program.days ?? []).find((d) => d.day === dayNum) ?? null;
  const raw = getDayHtml(dayNum);
  const html = raw ? annotateDayHtml(raw) : '';

  const hits: { s: number; e: number; attrs: string; inner: string }[] = [];
  const re = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) hits.push({ s: m.index, e: re.lastIndex, attrs: m[1], inner: m[2] });

  const flat = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  const sections: CwSection[] = hits.map((h, i) => {
    const textSpan = /<span class="h2-text">([\s\S]*?)<\/span>/.exec(h.inner);
    const body = html.slice(h.e, i + 1 < hits.length ? hits[i + 1].s : html.length);
    const text = decodeEntities(flat(body));
    return {
      id: /id="([^"]+)"/.exec(h.attrs)?.[1] ?? `s${i}`,
      family: /data-family="([^"]+)"/.exec(h.attrs)?.[1] ?? null,
      label: decodeEntities((textSpan ? textSpan[1] : h.inner).replace(/<[^>]+>/g, ' '))
        .replace(/\s+/g, ' ').trim(),
      body, text, n: i + 1,
      weight: text.length,
    };
  });

  /**
   * La section « Livrable attendu » du corpus ne contient QUE la chaîne
   * `deliverable` du programme, mot pour mot — vérifié sur les cinq journées
   * du CP6 (18 à 70 caractères, égalité stricte). Elle était donc affichée
   * deux fois sur le même écran : une fois dans le bloc de preuve, une fois
   * comme section. Elle est ici REPLIÉE dans le bloc de preuve, qui devient
   * son emplacement unique. Rien n'est masqué : le texte reste affiché, en
   * tête de la colonne FAIRE, et le rail continue de l'atteindre par son
   * ancre.
   */
  const delivText = meta?.deliverable ? flat(String(meta.deliverable)) : null;
  const proofSection = delivText
    ? sections.find((s) => s.family === 'apply' && s.text === delivText) ?? null
    : null;

  const read = sections.filter((s) => !s.family || !ACTION_FAMILIES.has(s.family));
  const act = sections.filter(
    (s) => s.family && ACTION_FAMILIES.has(s.family) && s !== proofSection,
  );

  const week = (program.weeks ?? []).find((w) => w.week === meta?.week) ?? null;
  const month = (program.months ?? []).find((mo) => mo.month === meta?.month) ?? null;

  return { meta, sections, read, act, proofSection, week, month };
}

/**
 * Les cinq journées de test du CP6, choisies sur des CRITÈRES MESURÉS et non
 * sur une impression : la plus courte et la plus longue du corpus, plus une
 * journée par famille de contenu représentative. Le calcul est fait ici pour
 * que le choix soit reproductible et vérifiable.
 */
export function cwProbeDays() {
  const { days } = cwData();
  const withLen = days.map((d) => {
    const raw = getDayHtml(d.day) ?? '';
    return { ...d, chars: raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length };
  }).filter((d) => d.chars > 0);

  const sorted = [...withLen].sort((a, b) => a.chars - b.chars);
  const shortest = sorted[0];
  const longest = sorted[sorted.length - 1];
  const bySkill = (ids: string[]) =>
    withLen.filter((d) => ids.includes(d.skill)).sort((a, b) => b.chars - a.chars)[0] ?? null;

  const picks = [
    { role: 'la plus courte du corpus', d: shortest },
    { role: 'la plus longue du corpus', d: longest },
    { role: 'journée code', d: bySkill(['jsts', 'algo', 'ds']) },
    { role: 'journée projet / production', d: withLen.find((d) => d.project != null) ?? null },
    { role: 'journée IA / data', d: bySkill(['llm', 'rag', 'ml', 'dl', 'data', 'agents']) },
  ].filter((p): p is { role: string; d: NonNullable<typeof p.d> } => p.d != null);

  // Dédoublonne en gardant le premier rôle attribué.
  const seen = new Set<number>();
  return picks.filter((p) => (seen.has(p.d.day) ? false : (seen.add(p.d.day), true)));
}
