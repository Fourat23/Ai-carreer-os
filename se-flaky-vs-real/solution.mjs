export function classifyTest(history) {
  if (history.every((r) => r === 'pass')) return 'healthy';
  if (history.every((r) => r === 'fail')) return 'broken';
  const firstFail = history.indexOf('fail');
  const monotone = history.slice(0, firstFail).every((r) => r === 'pass') && history.slice(firstFail).every((r) => r === 'fail');
  return monotone ? 'regression' : 'flaky';
}
