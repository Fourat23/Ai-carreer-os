import numpy as np

def ece(probs, labels):
    p = np.array(probs, dtype=float)
    y = np.array(labels, dtype=float)
    n = len(p)
    edges = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0001]
    total = 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (p >= lo) & (p < hi)
        if m.sum() == 0:
            continue
        conf = p[m].mean()
        acc = y[m].mean()
        total += (m.sum() / n) * abs(conf - acc)
    return f'{total:.3f}'
