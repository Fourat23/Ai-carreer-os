// Chargement du programme (data/program.json) et lecture des fichiers Markdown du curriculum.
// Côté serveur uniquement (utilise fs). Les pages Server Components l'importent directement.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import { rewriteHtmlLinks } from './internal-links';
import { buildLinkIndex, autolinkGlossary } from './glossary-autolink.mjs';
import { getGlossary } from './glossary';
import type { Program, ProgramDay, ProgramWeek, ProgramMonth } from './types';

const ROOT = process.cwd();
const CUR = join(ROOT, 'curriculum');

let cached: Program | null = null;

export function getProgram(): Program {
  if (cached) return cached;
  const raw = readFileSync(join(ROOT, 'data', 'program.json'), 'utf8');
  cached = JSON.parse(raw) as Program;
  return cached;
}

export function getDay(day: number): ProgramDay | undefined {
  return getProgram().days.find((d) => d.day === day);
}

export function getWeek(week: number): ProgramWeek | undefined {
  return getProgram().weeks.find((w) => w.week === week);
}

export function getMonth(month: number): ProgramMonth | undefined {
  return getProgram().months.find((m) => m.month === month);
}

const pad3 = (n: number) => String(n).padStart(3, '0');
const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * V66 · CP13 — un tableau large défile horizontalement sur mobile, et ce
 * défilement doit être atteignable AU CLAVIER.
 *
 * Trouvé par le walkthrough navigateur à 375 px : axe signalait
 * `scrollable-region-focusable` en « serious » sur le tableau comparatif
 * ajouté dans `embeddings`. Une zone qui défile sans être focalisable est
 * simplement inaccessible à qui n'utilise pas de souris — le contenu est là,
 * hors d'atteinte.
 *
 * On enveloppe donc chaque tableau dans une région focalisable et nommée.
 */
function scrollableTables(html: string): string {
  return html.replace(
    /<table>/g,
    '<div class="doc-table-scroll" tabindex="0" role="region" aria-label="Tableau, défilement horizontal"><table>',
  ).replace(/<\/table>/g, '</table></div>');
}

// V66 · CP13 — index de liaison du glossaire, construit une fois par processus.
// 711 entrées, ~1 600 formes atteignables (terme, forme longue, alias).
let linkIndex: ReturnType<typeof buildLinkIndex> | null = null;
function glossaryLinkIndex() {
  if (!linkIndex) linkIndex = buildLinkIndex(getGlossary());
  return linkIndex;
}

// Rend un fichier Markdown du curriculum en HTML. Retourne null si absent.
//
// `autolink` : lie la PREMIÈRE occurrence de chaque terme du glossaire vers sa
// définition. Mesuré au CP0 : le corpus définit 711 termes et n'en rendait
// AUCUN atteignable depuis une leçon (0 lien `/glossary` sur 128 fichiers). Le
// vocabulaire existait, jamais à l'endroit où l'apprenant bute dessus.
// Volontairement absent des pages de RÉFÉRENCE (semaine, mois) : on lie là où
// on apprend, pas là où on planifie.
function renderMarkdown(relativePath: string, autolink = false): string | null {
  const path = join(CUR, relativePath);
  if (!existsSync(path)) return null;
  const md = readFileSync(path, 'utf8');
  // Retire un éventuel marqueur <!-- keep --> en tête (ne pas l'afficher).
  const cleaned = md.replace(/^<!-- keep -->\n?/, '');
  const html = marked.parse(cleaned, { async: false }) as string;
  // Normalise les liens internes Markdown (../week-35.md, …) vers les routes réelles (/week/35).
  const linked = scrollableTables(rewriteHtmlLinks(html));
  return autolink ? autolinkGlossary(linked, glossaryLinkIndex()) : linked;
}

export function getDayHtml(day: number): string | null {
  return renderMarkdown(join('days', `day-${pad3(day)}.md`), true);
}
export function getSolutionHtml(day: number): string | null {
  return renderMarkdown(join('solutions', `day-${pad3(day)}-solution.md`));
}
export function getWeekHtml(week: number): string | null {
  return renderMarkdown(`week-${pad2(week)}.md`);
}
export function getMonthHtml(month: number): string | null {
  return renderMarkdown(`month-${pad2(month)}.md`);
}
export function getProjectHtml(id: string): string | null {
  return renderMarkdown(join('projects', `project-${id}.md`));
}
export function getDocHtml(relativePath: string): string | null {
  // Les LEÇONS et les documents de méthodologie sont des surfaces
  // d'apprentissage : on y lie le glossaire. Les rubriques, modèles et
  // ressources sont des documents de référence — on n'y lie pas.
  const apprentissage = /^(lessons|methodology)[\\/]/.test(relativePath);
  return renderMarkdown(relativePath, apprentissage);
}

// Extrait la checklist de validation d'un jour (les cases "- [ ] ..." de la section critères).
export function getDayChecklist(day: number): string[] {
  const path = join(CUR, 'days', `day-${pad3(day)}.md`);
  if (!existsSync(path)) return [];
  const md = readFileSync(path, 'utf8');
  const lines = md.split('\n');
  const items: string[] = [];
  let inCriteria = false;
  for (const line of lines) {
    if (line.startsWith('## ')) inCriteria = line.includes('Critères de validation');
    else if (inCriteria) {
      const m = line.match(/^- \[ \] (.+)$/);
      if (m) items.push(m[1].trim());
    }
  }
  return items;
}
