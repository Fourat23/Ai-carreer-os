export function isIdempotent(method) {
  return ['GET', 'HEAD', 'PUT', 'DELETE'].includes(method);
}
