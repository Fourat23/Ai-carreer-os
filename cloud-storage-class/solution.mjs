export function storageClass(ctx) {
  if (ctx.sharedFilesystem) return "file"; if (ctx.attachedToVm) return "block"; return "object";
}
