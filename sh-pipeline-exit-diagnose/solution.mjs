export function pipelineOutcome(exitCodes, pipefail) {
  const firstFail = exitCodes.findIndex((c) => c !== 0);
  let code;
  if (pipefail) {
    let last = 0;
    for (const c of exitCodes) if (c !== 0) last = c;
    code = last;
  } else {
    code = exitCodes[exitCodes.length - 1];
  }
  return [code, firstFail];
}
