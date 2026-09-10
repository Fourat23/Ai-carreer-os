export function runStack(ops: string[]): number[] {
  const stack: number[] = [];
  for (const op of ops) {
    if (op.startsWith('push ')) stack.push(Number(op.slice(5)));
    else if (op === 'pop') stack.pop();
  }
  return stack;
}
