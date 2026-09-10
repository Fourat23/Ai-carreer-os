export function isMultiAz(zones) {
  return new Set(zones).size >= 2;
}
