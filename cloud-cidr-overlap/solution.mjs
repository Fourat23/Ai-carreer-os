export function cidrOverlap(a, b) {
  const r = c => { const [ip, p] = c.split("/"); const n = ip.split(".").reduce((x, o) => (x * 256 + (+o)) >>> 0, 0); const pref = +p; const mask = pref === 0 ? 0 : (0xffffffff << (32 - pref)) >>> 0; const s = (n & mask) >>> 0; const size = pref === 32 ? 1 : 2 ** (32 - pref); return [s, (s + size - 1) >>> 0]; }; const [sa, ea] = r(a), [sb, eb] = r(b); return sa <= eb && sb <= ea;
}
