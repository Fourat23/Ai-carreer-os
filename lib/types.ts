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
  hours: number;
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

export interface Lesson {
  slug: string;
  title: string;
  cat?: string;
  level?: number; // 1 = débutant, 2 = intermédiaire, 3 = avancé
  min?: number;   // durée estimée (lecture + exercices), en minutes
  skills?: string[];
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

export interface DayProgress {
  status: DayStatus;
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
  skills: Record<SkillId, number>; // score 0-5 auto-évalué
  weeklyReviews: Record<string, { done: boolean; note: string; score: number | null }>;
  monthlyReviews: Record<string, { done: boolean; note: string; score: number | null }>;
}

export const EMPTY_DAY_PROGRESS: DayProgress = {
  status: 'not-started',
  selfScore: null,
  answer: '',
  notes: '',
  checklist: {},
  updatedAt: '',
};
