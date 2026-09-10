export function portAllowed(rule, port) {
  return port >= rule.from && port <= rule.to;
}
