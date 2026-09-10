def step(w, x, y, lr):
    pred = w * x
    grad = 2 * (pred - y) * x
    w_new = w - lr * grad
    return f'{w_new:.4f}'
