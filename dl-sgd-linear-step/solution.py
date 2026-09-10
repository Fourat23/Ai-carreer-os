import numpy as np

def step(x, y, w, b, lr):
    x = np.array(x, dtype=float); y = np.array(y, dtype=float)
    n = len(x)
    pred = w * x + b
    err = pred - y
    dW = (2.0 / n) * np.sum(err * x)
    db = (2.0 / n) * np.sum(err)
    w -= lr * dW; b -= lr * db
    return f'w={w:.3f} b={b:.3f}'
