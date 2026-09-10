export function adapt(legacy) {
  return { name: legacy.full_name, age: legacy.yrs };
}
