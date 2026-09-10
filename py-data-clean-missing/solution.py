def clean(values):
    valid = [v for v in values if v is not None]
    return [len(valid), sum(valid)]
