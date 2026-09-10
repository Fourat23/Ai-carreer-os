export function route({ attempts, maxAttempts }) {
  return attempts >= maxAttempts ? 'dlq' : 'retry';
}
