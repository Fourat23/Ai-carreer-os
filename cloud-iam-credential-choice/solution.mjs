export function credentialType(ctx) {
  if (ctx.insideCloud) return "managed-identity"; if (ctx.humanInteractive) return "sso"; if (ctx.thirdParty) return "temporary-role"; return "access-key";
}
