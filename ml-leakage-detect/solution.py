def find_leakage(steps):
    split_i = steps.index('split') if 'split' in steps else len(steps)
    for i, s in enumerate(steps):
        if s == 'fit_scaler_all' and i < split_i:
            return i
    return -1
