import numpy as np

def he_std(fan_in):
    return f'{np.sqrt(2.0 / fan_in):.3f}'
