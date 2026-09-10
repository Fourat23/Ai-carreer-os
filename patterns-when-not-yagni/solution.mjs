export function decide(ctx) {
  if (ctx.variants <= 1) return 'yagni';
  if (ctx.variants >= 3 && ctx.sharedInterface === true) return 'strategy';
  return 'inline';
}
