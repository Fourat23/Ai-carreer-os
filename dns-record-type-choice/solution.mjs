export function recordType(need) {
  return { ipv4: 'A', ipv6: 'AAAA', alias: 'CNAME', mail: 'MX', verify: 'TXT' }[need] ?? 'A';
}
