export function locateFailure(ctx) {
  if (!ctx.goldInTopK) return 'retrieval';
  if (!ctx.answerGrounded) return 'generation';
  return 'ok';
}
