import math

def forward(w, x, b):
    z = sum(wi * xi for wi, xi in zip(w, x)) + b
    y = 1 / (1 + math.exp(-z))
    return f'{y:.3f}'
