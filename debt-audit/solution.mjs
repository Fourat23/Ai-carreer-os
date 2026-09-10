export function prioritizeDebt(entries) {
  return [...entries]
    .sort(
      (a, b) =>
        b.interest / b.effort - a.interest / a.effort ||
        b.interest - a.interest ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    )
    .map((e) => e.id);
}
