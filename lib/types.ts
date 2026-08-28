// Types partagés de l'application AI Career OS.

export type SkillId = string;

export interface Skill {
  id: SkillId;
  name: string;
}

export interface ProgramDay {
  day: number;
  week: number;
  month: number;
  title: string;
  skill: SkillId;
  skillName: string;
  difficulty: number;
  /** Engagement quotidien demandé par le programme — 4,5 h pour les 365 journées. */
  hours: number;
  /**
   * Temps de LECTURE calculé depuis le contenu réel de la journée (150 mots/min,
   * 20 lignes de code/min). À distinguer de `hours` : l'un est un engagement,
   * l'autre une mesure. V67 · CP11.
   */
  readingMinutes: number;
  isReview: boolean;
  detailed: boolean;
  deliverable: string | null;
  project: number | null;
}

export interface ProgramWeek {
  week: number;
  theme: string;
  month: number;
  skills: SkillId[];
}

export interface ProgramMonth {
  month: number;
  title: string;
  summary: string;
  project: { id: number; name: string } | null;
  expectedScores: Record<string, number>;
}

export interface PracticeRef {
  kind: 'exercise' | 'lab' | 'mission' | 'playbook';
  id: string;
}

export interface Lesson {
  slug: string;
  title: string;
  cat?: string;
  level?: number; // 1 = débutant, 2 = intermédiaire, 3 = avancé
  min?: number;   // durée estimée (lecture + exercices), en minutes
  skills?: string[];
  practiceRefs?: PracticeRef[]; // V27 : graphe leçon → pratique (artefacts existants)
}

export interface Program {
  generatedAt: string;
  skills: Skill[];
  months: ProgramMonth[];
  weeks: ProgramWeek[];
  days: ProgramDay[];
  lessons?: Lesson[];
}

export type DayStatus = 'not-started' | 'in-progress' | 'done' | 'to-review';

// ── Learning Engine (V64, ADR-064) ─────────────────────────────────────────
// La session est la SOURCE DE VÉRITÉ du travail d'une journée ; `status`
// ci-dessous n'en est qu'une PROJECTION, maintenue pour les read-models
// existants et écrite uniquement par le moteur.

export type SessionState = 'not_started' | 'active' | 'paused' | 'completed';
export type StepState = 'pending' | 'in_progress' | 'done';
export type SubmissionKind = 'text' | 'exercise' | 'assessment';
export type ValidationStatus = 'passed' | 'failed' | 'pending' | 'manual';
export type ValidationKind = 'exercise-tests' | 'assessment-grade' | 'self';

export interface LearningStep {
  state: StepState;
  updatedAt: string | null;
}

export interface LearningSession {
  state: SessionState;
  startedAt: string | null;
  lastActiveAt: string | null;
  completedAt: string | null;
  reopenCount: number;
  steps: Record<string, LearningStep>;
}

export interface Validation {
  status: ValidationStatus;
  kind: ValidationKind;
  checkedAt: string | null;
  detail: string;
  score: { passed: number; total: number } | null;
}

export interface Submission {
  id: string;
  stepId: string;
  kind: SubmissionKind;
  /** TEXTE brut de l'apprenant. Jamais rendu en HTML (ADR-064 §9). */
  content: string;
  submittedAt: string;
  validation: Validation | null;
}

export interface DayProgress {
  status: DayStatus;
  /** V64 : présente après normalisation ; dérivée du statut si absente sur disque. */
  session?: LearningSession;
  /** V64 : ajoutées, jamais écrasées. */
  submissions?: Submission[];
  selfScore: number | null; // 0-5 (legacy V5)
  answer: string;           // réponse globale (legacy V5)
  notes: string;
  checklist: Record<string, boolean>; // legacy V5
  updatedAt: string;
  // ── Active Learning (V6) — champs optionnels, rétro-compatibles ──
  startedAt?: string | null;
  completedAt?: string | null;
  answers?: Record<string, string>; // réponses par section/activité
  selfAssessment?: {
    level: number | null;
    confidence: 'low' | 'medium' | 'high' | null;
    criteria: Record<string, boolean>;
    comment: string;
  } | null;
  comprehension?: 'understood' | 'partial' | 'review' | null;
  attempts?: {
    count: number;
    lastAt: string | null;
    history: { at: string | null; outcome: string; summary: string }[];
  };
  correctionState?: 'locked' | 'available' | 'viewed' | 'acknowledged';
  review?: {
    dueAt: string | null;
    interval: number;
    repetitions: number;
    ease: number;
    lastReviewedAt: string | null;
    reason: string;
  } | null;
  evidence?: {
    id: string;
    type: 'exercise' | 'repo' | 'project' | 'screenshot' | 'note' | 'demo' | 'other';
    title: string;
    description: string;
    url: string;
    skills: string[];
    createdAt: string;
  }[];
}

export interface Progress {
  startDate: string | null; // ISO date où l'utilisateur a commencé le jour 1
  days: Record<string, DayProgress>;
  /**
   * V65 · AUTO-ÉVALUATION DÉCLARÉE (0-5). Ce n'est PAS un état de compétence :
   * elle n'entre pas dans la projection. L'état vient des preuves, et d'elles
   * seules (contrat §6).
   */
  skills: Record<SkillId, number>;
  weeklyReviews: Record<string, { done: boolean; note: string; score: number | null }>;
  monthlyReviews: Record<string, { done: boolean; note: string; score: number | null }>;
  /** V65 · REGISTRE CANONIQUE DE PREUVES — l'unique source de la compétence. */
  evidence?: import('./evidence').Evidence[];
  /**
   * V66 · TENTATIVES DE RAPPEL — l'unique source de l'état de rétention.
   * Une liste de FAITS datés ; aucun état de rétention n'est stocké ici, ni
   * ailleurs. Voir `lib/retention.mjs`.
   */
  recallAttempts?: import('./retention').RecallAttempt[];
  /** V18 · état des missions d'ingénierie (additif, optionnel). */
  missions?: Record<string, unknown>;
}

export const EMPTY_DAY_PROGRESS: DayProgress = {
  status: 'not-started',
  selfScore: null,
  answer: '',
  notes: '',
  checklist: {},
  updatedAt: '',
};
