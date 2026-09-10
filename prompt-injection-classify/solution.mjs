export function classifyInput(ctx) {
  const trusted = ctx.source === 'system';
  return trusted ? 'instruction' : 'data';
}
