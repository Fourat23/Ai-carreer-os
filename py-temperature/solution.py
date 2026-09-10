def celsius_to_label(c):
    if c <= 0:
        return 'gel'
    if c >= 30:
        return 'chaud'
    return 'tempéré'
