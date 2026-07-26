// Types pour lib/lab-feedback.mjs (séparation public/privé, anti-fuite).
import type { ValidationResult } from './exercise';
export function splitAttempt(
  attempt: { results?: ValidationResult[] },
  privateIds: Set<string> | Iterable<string>,
): { publicResults: ValidationResult[]; privateSummary: { total: number; passed: number } | null };
