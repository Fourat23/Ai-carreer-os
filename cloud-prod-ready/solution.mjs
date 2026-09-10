export function prodReady(diagnostics) {
  return !diagnostics.some(d => d.severity === "blocking" || d.severity === "risk");
}
