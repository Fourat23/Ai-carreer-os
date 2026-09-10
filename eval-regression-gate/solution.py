def gate(current, baseline, tol):
    for k, base in baseline.items():
        if base - current.get(k, 0) > tol:
            return 'regression'
    return 'pass'
