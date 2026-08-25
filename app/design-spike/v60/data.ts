// V60 · SPIKE — EXTRACTION DE DONNÉES, STRICTEMENT EN LECTURE.
//
// Ce module lit les read-models existants et n'écrit nulle part. Il ne crée
// aucune seconde source de vérité : tout ce qu'il retourne est dérivé de
// `data/program.json`, de `data/day-exercises.json` et du corpus Markdown.
//
// ── CE QUE LES DONNÉES RÉELLES CONTIENNENT, ET CE QU'ELLES NE CONTIENNENT PAS
//
// Vérifié avant d'écrire une seule ligne de prototype :
//   data/progress.json          → 0 journée enregistrée, 0 compétence notée,
//                                 startDate = null
//   data/progress.example.json  → également vide
//
// Il n'existe donc AUCUNE donnée de progression dans ce produit. Le brief
// interdit d'en inventer. Les prototypes ne dessinent par conséquent aucun
// remplissage de progression : ils déclarent l'absence (`progress.available`
// vaut false) et composent l'année à partir de ce qui est réellement là —
// difficulté, charge horaire, compétence, semaine de révision, livrable,
// thème du mois, projet. C'est une contrainte, et c'est aussi un meilleur
// test : une direction qui n'est lisible qu'une fois coloriée par la
// progression n'a pas de composition propre.
import { getProgram, getDayHtml } from '@/lib/program';
import { annotateDayHtml, deriveDayPhases } from '@/lib/section-family';
import { decodeEntities } from '@/lib/doc-sections';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { getTrack, resolveTrackDayObjects } from '@/lib/catalogue';

export type SpikeDay = {
  day: number; week: number; month: number; title: string;
  skill: string; skillName: string; difficulty: number; hours: number;
  isReview: boolean; project: number | null; deliverable: string | null;
};

export type SpikeMonth = {
  month: number; title: string; summary: string;
  project: { id: number; name: string } | null;
  days: SpikeDay[]; hours: number; weeks: number[];
  /** Compétences réellement portées par les journées du mois, par fréquence. */
  skills: { id: string; name: string; days: number }[];
  reviewDays: number; peakDifficulty: number;
};

export type SpikePhase = { id: string; family: string | null; label: string };

/** Snapshot immuable consommé par les neuf prototypes. */
export function spikeData() {
  const program = getProgram();
  const progress = readProgress();
  const catalogue = getCatalogue();
  const track = getTrack(catalogue, getActiveTrackId()) ?? catalogue.tracks[0];
  const trackDays = resolveTrackDayObjects(catalogue, track, program);

  const skillName = new Map<string, string>(
    (program.skills ?? []).map((s) => [s.id, s.name] as const),
  );

  const days: SpikeDay[] = (program.days ?? []).map((d) => ({
    day: d.day, week: d.week, month: d.month, title: d.title,
    skill: d.skill, skillName: d.skillName || skillName.get(d.skill) || '',
    difficulty: d.difficulty, hours: d.hours, isReview: d.isReview,
    project: d.project ?? null, deliverable: d.deliverable ?? null,
  }));

  const months: SpikeMonth[] = (program.months ?? []).map((m) => {
    const md = days.filter((d) => d.month === m.month);
    const freq = new Map<string, number>();
    for (const d of md) if (d.skill) freq.set(d.skill, (freq.get(d.skill) ?? 0) + 1);
    return {
      month: m.month, title: m.title, summary: m.summary,
      project: m.project ?? null,
      days: md,
      hours: Math.round(md.reduce((s, d) => s + d.hours, 0)),
      weeks: [...new Set(md.map((d) => d.week))].sort((a, b) => a - b),
      skills: [...freq.entries()].sort((a, b) => b[1] - a[1])
        .map(([id, n]) => ({ id, name: skillName.get(id) ?? id, days: n })),
      reviewDays: md.filter((d) => d.isReview).length,
      peakDifficulty: md.reduce((mx, d) => Math.max(mx, d.difficulty), 0),
    };
  });

  // Progression : l'état RÉEL, y compris quand il est vide.
  const recorded = Object.keys(progress.days ?? {}).length;

  return {
    days, months,
    weeks: program.weeks ?? [],
    skills: program.skills ?? [],
    totalDays: days.length,
    trackDays: trackDays.length,
    trackName: String(track?.title ?? track?.id ?? ''),
    hours: Math.round(days.reduce((s, d) => s + d.hours, 0)),
    progress: {
      available: recorded > 0,
      recordedDays: recorded,
      startDate: (progress.startDate ?? null) as string | null,
      /** Journée de reprise réelle. Sans aucun enregistrement, c'est 1. */
      resumeDay: 1,
    },
  };
}

/** Une journée réelle du corpus, avec ses phases dérivées du document rendu. */
export function spikeDay(dayNum: number) {
  const program = getProgram();
  const meta = (program.days ?? []).find((d) => d.day === dayNum);
  const raw = getDayHtml(dayNum);
  const html = raw ? annotateDayHtml(raw) : '';
  const phases: SpikePhase[] = html ? deriveDayPhases(html) : [];
  const week = (program.weeks ?? []).find((w) => w.week === meta?.week);
  const month = (program.months ?? []).find((m) => m.month === meta?.month);
  return { meta, html, phases, week, month };
}

/**
 * Découpe un document de journée sur ses `h2`, pour les trois directions.
 *
 * Deux défauts relevés sur les premières captures, corrigés ici une fois pour
 * les trois :
 *
 * 1. `Consigne d&#39;utilisation` s'affichait en toutes lettres dans le rail
 *    de la direction B. Retirer les balises ne décode pas les entités ; le
 *    corpus en produit. On réutilise `decodeEntities`, déjà écrit pour le
 *    produit en V59, plutôt que d'en réécrire une variante.
 *
 * 2. Le titre ressortait numéroté deux fois — « 01 · 01 · Cadrer Objectif du
 *    jour ». Le `h2` annoté contient DEUX spans : `h2-eyebrow` (« 01 · Cadrer »)
 *    et `h2-text` (« Objectif du jour »). Aplatir les balises les collait.
 *    On lit désormais `h2-text` seul comme intitulé, et la famille vient de
 *    `data-family`, sa vraie source.
 */
export function splitDay(html: string) {
  const hits: { s: number; e: number; attrs: string; inner: string }[] = [];
  const re = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) hits.push({ s: m.index, e: re.lastIndex, attrs: m[1], inner: m[2] });
  return hits.map((h, i) => {
    const textSpan = /<span class="h2-text">([\s\S]*?)<\/span>/.exec(h.inner);
    const raw = textSpan ? textSpan[1] : h.inner;
    return {
      id: /id="([^"]+)"/.exec(h.attrs)?.[1] ?? `s${i}`,
      family: /data-family="([^"]+)"/.exec(h.attrs)?.[1] ?? null,
      label: decodeEntities(raw.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(),
      body: html.slice(h.e, i + 1 < hits.length ? hits[i + 1].s : html.length),
    };
  });
}

/** Sections d'un document, découpées pour un rendu en deux colonnes. */
export function splitSections(html: string): { id: string; heading: string; body: string }[] {
  const out: { id: string; heading: string; body: string }[] = [];
  const re = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/g;
  const marks: { at: number; end: number; attrs: string; inner: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) marks.push({ at: m.index, end: re.lastIndex, attrs: m[1], inner: m[2] });
  for (let i = 0; i < marks.length; i++) {
    const idm = /id="([^"]+)"/.exec(marks[i].attrs);
    out.push({
      id: idm ? idm[1] : `s${i}`,
      heading: marks[i].inner,
      body: html.slice(marks[i].end, i + 1 < marks.length ? marks[i + 1].at : html.length),
    });
  }
  return out;
}
