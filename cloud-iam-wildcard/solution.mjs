export function hasWildcard(policy) {
  return (policy.actions || []).includes("*") || (policy.resources || []).includes("*");
}
