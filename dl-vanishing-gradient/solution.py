def vanishing(local_grads, threshold):
    prod = 1.0
    for i, g in enumerate(local_grads):
        prod *= g
        if prod < threshold:
            return i
    return -1
