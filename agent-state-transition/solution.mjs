const TRANSITIONS = {
  THINK: { plan: 'SELECT_TOOL', answer: 'COMPLETE' },
  SELECT_TOOL: { selected: 'VALIDATE' },
  VALIDATE: { ok: 'EXECUTE', invalid: 'ASK_HUMAN' },
  EXECUTE: { ok: 'OBSERVE', error: 'RETRY' },
  OBSERVE: { continue: 'THINK', done: 'COMPLETE' },
  RETRY: { again: 'EXECUTE', giveup: 'FAILED' },
  ASK_HUMAN: { approved: 'EXECUTE', rejected: 'FAILED' },
};
export function nextState(state, event) {
  const row = TRANSITIONS[state];
  return (row && row[event]) || 'FAILED';
}
