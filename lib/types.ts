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

export interface Program {
  generatedAt: string;
  skills: Skill[];
  months: ProgramMonth[];
  weeks: ProgramWeek[];
  days: ProgramDay[];
}

export type DayStatus = 'not-started' | 'in-progress' | 'done' | 'to-review';

export interface DayProgress {
  status: DayStatus;
  selfScore: number | null; // 0-5
  answer: string;
  notes: string;
  checklist: Record<string, boolean>;
  updatedAt: string;
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
