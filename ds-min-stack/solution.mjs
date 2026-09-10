export function minStackOps(ops) {
  const st = [], mins = [], out = [];
  for (const op of ops) {
    if (op[0] === 'push') {
      const v = op[1];
      st.push(v);
      mins.push(mins.length ? Math.min(v, mins[mins.length - 1]) : v);
    } else if (op[0] === 'pop') { out.push(st.pop()); mins.pop(); }
    else if (op[0] === 'min') { out.push(mins[mins.length - 1]); }
    else if (op[0] === 'top') { out.push(st[st.length - 1]); }
  }
  return out;
}
