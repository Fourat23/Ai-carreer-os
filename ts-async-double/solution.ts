export async function doubleLater(n: number): Promise<number> {
  const value = await Promise.resolve(n * 2);
  return value;
}
