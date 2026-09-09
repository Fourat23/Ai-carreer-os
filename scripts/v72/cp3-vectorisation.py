#!/usr/bin/env python3
"""V72 — CP3. MESURE du gain de la vectorisation pandas.

POURQUOI CE SCRIPT. `pandas-data-wrangling` affirmait « le facteur 50 a 100 » sans
source ni mesure, alors que le reste de la lecon mesure tout. Le facteur reel depend
de DEUX choses que la formulation universelle effacait : contre quelle boucle on
compare, et sur combien de lignes. On mesure les deux.
"""
import time
import numpy as np
import pandas as pd


def chrono(f, n=3):
    t = []
    for _ in range(n):
        d = time.perf_counter(); f(); t.append(time.perf_counter() - d)
    return min(t)


print(f"pandas {pd.__version__} · numpy {np.__version__}")
print(f"{'lignes':>8} {'vectorise':>12} {'comprehension':>15} {'facteur':>9} {'apply axis=1':>14} {'facteur':>9}")
for n in (1_000, 10_000, 100_000, 1_000_000):
    df = pd.DataFrame({"ht": np.random.rand(n) * 100})
    tv = chrono(lambda: df["ht"] * 1.2)
    tl = chrono(lambda: [x * 1.2 for x in df["ht"]])
    ta = chrono(lambda: df.apply(lambda r: r["ht"] * 1.2, axis=1))
    print(f"{n:>8} {tv*1000:>10.2f}ms {tl*1000:>13.2f}ms {tl/tv:>8.0f}x {ta*1000:>12.1f}ms {ta/tv:>8.0f}x")

print("""
LECTURE. Le facteur n est pas une constante : il croit avec le nombre de lignes (le
cout d interpretation est paye par ligne, celui de la vectorisation une seule fois) et
il depend enormement de la boucle comparee. `apply(axis=1)` — l idiome que le debutant
ecrit spontanement — construit une Series par ligne : c est lui qui donne les facteurs
a trois chiffres, pas une boucle Python ordinaire.""")
