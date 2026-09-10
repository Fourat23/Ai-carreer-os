export function monthlyCost(items) {
  return items.reduce((s, it) => s + it.units * it.unitCost, 0);
}
