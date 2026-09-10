def best_threshold(scores, labels, thresholds, cost_fp, cost_fn):
    best_t, best_c = None, None
    for t in thresholds:
        fp = sum(1 for s, y in zip(scores, labels) if s >= t and y == 0)
        fn = sum(1 for s, y in zip(scores, labels) if s < t and y == 1)
        c = fp * cost_fp + fn * cost_fn
        if best_c is None or c < best_c:
            best_c, best_t = c, t
    return f'{best_t:.2f}'
