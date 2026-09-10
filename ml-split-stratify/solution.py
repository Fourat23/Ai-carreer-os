def need_stratify(y, test_size):
    counts = {}
    for c in y:
        counts[c] = counts.get(c, 0) + 1
    for c, n in counts.items():
        if n * test_size < 1:
            return 'stratify'
    return 'ok'
