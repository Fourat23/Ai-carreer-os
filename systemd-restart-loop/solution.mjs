export function crashLooping(exitCodes) {
  return exitCodes.length >= 3 && exitCodes.every((c) => c !== 0);
}
