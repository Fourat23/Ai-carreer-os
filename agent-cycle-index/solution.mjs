export function firstRepeat(steps) {
  const seen = new Set();
  for (let i = 0; i < steps.length; i++) {
    const key = steps[i].state + '|' + steps[i].action;
    if (seen.has(key)) return i;
    seen.add(key);
  }
  return -1;
}
