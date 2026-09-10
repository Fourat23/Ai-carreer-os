export function certUsable(now, notAfter, host, san) {
  return now <= notAfter && Array.isArray(san) && san.includes(host);
}
