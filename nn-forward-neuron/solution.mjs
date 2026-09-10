export function forward(inputs, weights, bias, activation) {
  let z = bias;
  for (let i = 0; i < inputs.length; i++) z += inputs[i] * weights[i];
  return activation === 'relu' ? Math.max(0, z) : (z >= 0 ? 1 : 0);
}
