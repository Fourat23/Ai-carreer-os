def diagnose(losses):
    if not losses:
        return 'not-learning'
    first, last = losses[0], losses[-1]
    if last > first:
        return 'diverging'
    if first > 0 and (first - last) / first < 0.01:
        return 'not-learning'
    return 'healthy'
