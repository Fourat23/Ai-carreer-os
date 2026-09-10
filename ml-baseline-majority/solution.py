def baseline_accuracy(y):
    if not y:
        return '0.000'
    from collections import Counter
    c = Counter(y)
    maj = c.most_common(1)[0][1]
    return f'{maj/len(y):.3f}'
