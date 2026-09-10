def stability(lr, c):
    r = 1 - lr * c
    if abs(r) > 1:
        return 'diverge'
    if r < 0:
        return 'oscille'
    return 'converge'
