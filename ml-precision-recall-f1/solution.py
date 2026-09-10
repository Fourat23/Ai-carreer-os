def metrics(cm):
    tp, fp, fn, tn = cm
    p = tp / (tp + fp) if (tp + fp) else 0.0
    r = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * p * r / (p + r) if (p + r) else 0.0
    return [f'{p:.3f}', f'{r:.3f}', f'{f1:.3f}']
