export type PeriodDay = {
  day: number;
  title: string;
  week: number;
  month: number;
  skill: string;
  skillName: string;
  difficulty: number;
  hours: number;
  isReview: boolean;
  deliverable: string | null;
  project: string | null;
  status: string;
};

export type PeriodWeek = {
  week: number;
  days: number;
  hours: number;
  done: number;
  first: number;
  last: number;
  skills: string[];
};

export type PeriodSkill = {
  name: string;
  id: string;
  days: number;
  hours: number;
  done: number;
};

export type PeriodModel = {
  unit: 'month' | 'week';
  n: number;
  days: PeriodDay[];
  weeks: PeriodWeek[];
  skills: PeriodSkill[];
  nature: { review: number; project: number; deliverable: number; study: number };
  difficulty: { lvl: number; days: number }[];
  count: number;
  hours: number;
  first: number;
  last: number;
  done: number;
  started: number;
  toReview: number;
  todo: number;
  percent: number;
  projects: { project: number | string; days: number[] }[];
  deliverables: number;
  next: PeriodDay | null;
};

export function periodModel(
  program: unknown,
  progress: unknown,
  unit: 'month' | 'week',
  n: number,
): PeriodModel | null;

export function periodBounds(program: unknown, unit: 'month' | 'week'): { min: number; max: number };
