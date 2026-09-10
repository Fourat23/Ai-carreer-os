import math

def split(X, y, test_frac):
    n = len(X)
    n_test = math.floor(n * test_frac)
    n_train = n - n_test
    return [n_train, n_test]
