export function choose({ hardCoded, neededInTest, variesByEnv }) {
  return (hardCoded && (neededInTest || variesByEnv)) ? 'inject' : 'keep';
}
