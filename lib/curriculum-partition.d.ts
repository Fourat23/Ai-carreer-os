export type CurriculumPartition = {
  total: number;
  inTrack: number;
  before: number;
  interleaved: number;
  after: number;
  firstTrackDay: number | null;
  lastTrackDay: number | null;
  beforeDays: number[];
  interleavedDays: number[];
  afterDays: number[];
  monthsCovered: number[];
  monthsTotal: number;
  sum: number;
  ok: boolean;
};

export function curriculumPartition(
  program: { days: { day: number; month: number }[] },
  trackDayNums: number[],
): CurriculumPartition;

export function partitionLabels(p: CurriculumPartition): {
  scope: string;
  coverage: string;
  outside: string | null;
};
