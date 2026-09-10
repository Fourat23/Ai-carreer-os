export function choose({ mutating, retriable, naturallyIdempotent }) {
  return (mutating && retriable && !naturallyIdempotent) ? 'idempotency-key' : 'not-needed';
}
