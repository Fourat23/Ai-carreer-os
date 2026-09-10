export function computeChoice(ctx) {
  if (ctx.needsOsControl) return "vm"; if (ctx.spiky) return "serverless"; return "container";
}
