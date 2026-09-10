export function guard(action, policy) {
  const allowed = new Set(policy.allowed || []);
  const gated = new Set(policy.needsApproval || []);
  if (!allowed.has(action)) return 'block';
  if (gated.has(action)) return 'needs-approval';
  return 'allow';
}
