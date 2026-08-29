import numpy as np
# Reseau minimal ecrit a la main : y = w*x + b, descente de gradient.
# On reproduit l'effet d'un zero_grad() oublie SANS PyTorch (indisponible ici),
# en accumulant explicitement les gradients au lieu de les remettre a zero.
rng = np.random.default_rng(3)
X = rng.normal(size=200); Y = 3.0*X + 1.0 + rng.normal(scale=0.1, size=200)

def entrainer(remise_a_zero, lr=0.05, epochs=15, batch=20):
    w, b = 0.0, 0.0
    gw = gb = 0.0
    hist = []
    for ep in range(epochs):
        for i in range(0, len(X), batch):
            xb, yb = X[i:i+batch], Y[i:i+batch]
            if remise_a_zero:
                gw = gb = 0.0                       # <- zero_grad()
            pred = w*xb + b
            err = pred - yb
            gw += 2*np.mean(err*xb)                 # gradients ACCUMULES
            gb += 2*np.mean(err)
            w -= lr*gw; b -= lr*gb
        hist.append(float(np.mean((w*X + b - Y)**2)))
    return w, b, hist

for nom, rz in [("AVEC remise a zero (correct)", True), ("SANS remise a zero (le bug)", False)]:
    w, b, h = entrainer(rz)
    print(f"{nom}")
    print(f"   w = {w:.3f} (attendu 3.0) | b = {b:.3f} (attendu 1.0)")
    print(f"   perte : depart {h[0]:.4f} -> fin {h[-1]:.4f}")
    print(f"   trajectoire : {' '.join(f'{v:.2f}' if abs(v)<1e4 else f'{v:.1e}' for v in h[:8])}\n")
