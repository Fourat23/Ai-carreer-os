export function leftJoin(users, orders) {
  const out = [];
  for (const u of users) {
    const matches = orders.filter((o) => o.userId === u.id);
    if (matches.length === 0) out.push({ name: u.name, total: null });
    else for (const o of matches) out.push({ name: u.name, total: o.total });
  }
  return out;
}
