export function validateExtraction(obj) {
  if (typeof obj.amount !== 'number' || !Number.isFinite(obj.amount) || obj.amount <= 0) return 'invalid:amount';
  if (!['EUR', 'USD', 'GBP'].includes(obj.currency)) return 'invalid:currency';
  return 'valid';
}
