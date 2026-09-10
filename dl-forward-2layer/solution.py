import numpy as np

def forward(x, W1, b1, W2, b2):
    x = np.array(x, dtype=float)
    h = np.maximum(0, np.array(W1, dtype=float) @ x + np.array(b1, dtype=float))
    z = float((np.array(W2, dtype=float) @ h)[0] + float(np.array(b2, dtype=float)[0]))
    y = 1.0 / (1.0 + np.exp(-z))
    return f'{y:.3f}'
