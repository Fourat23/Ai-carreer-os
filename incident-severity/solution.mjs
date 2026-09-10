export function severity(ctx) {
  if (ctx.allUsers) return 'SEV1';
  if (ctx.userFacing) return 'SEV2';
  return 'SEV3';
}
