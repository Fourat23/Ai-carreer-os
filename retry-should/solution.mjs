export function shouldRetry(ctx) {
  return !!ctx.idempotent && ctx.attempt < ctx.max;
}
