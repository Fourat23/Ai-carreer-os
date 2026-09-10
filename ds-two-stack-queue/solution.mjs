export function queueOps(ops) {
  const q = [], out = [];
  for (const op of ops) {
    if (op[0] === 'enqueue') q.push(op[1]);
    else if (op[0] === 'dequeue') out.push(q.shift());
    else if (op[0] === 'peek') out.push(q[0]);
  }
  return out;
}
