def count_params(sizes):
    total = 0
    for a, b in zip(sizes, sizes[1:]):
        total += a * b + b
    return total
