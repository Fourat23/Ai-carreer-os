def mse(preds, targets):
    n = len(preds)
    s = sum((p - t) ** 2 for p, t in zip(preds, targets))
    return f'{s / n:.3f}'
