import math

def estimate_tokens(text):
    return math.ceil(len(text) / 4)
