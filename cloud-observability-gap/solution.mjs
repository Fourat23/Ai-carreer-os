export function missingSignals(obs) {
  return ["logs", "metrics", "alerts"].filter(k => !obs[k]);
}
