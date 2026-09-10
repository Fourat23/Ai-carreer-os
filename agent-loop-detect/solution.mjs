export function shouldStop(steps, maxSteps) {
  if (steps.length > maxSteps) return 'budget';
  for (let i = 1; i < steps.length; i++) {
    if (steps[i] === steps[i - 1]) return 'loop';
    if (i >= 3 && steps[i] === steps[i - 2] && steps[i - 1] === steps[i - 3]) return 'loop';
  }
  return 'ok';
}
