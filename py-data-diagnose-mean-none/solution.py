def mean(values):
    valid = [v for v in values if v is not None]
    if not valid:
        return 0
    return int(round(sum(valid) / len(valid)))
