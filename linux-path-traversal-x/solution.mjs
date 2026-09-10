export function canReach(dirExecFlags) {
  return dirExecFlags.every(Boolean);
}
