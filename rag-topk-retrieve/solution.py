import math

def cos(a, b):
    dot = sum(a[x] * b.get(x, 0) for x in a)
    na = math.sqrt(sum(v*v for v in a.values())); nb = math.sqrt(sum(v*v for v in b.values()))
    return dot/(na*nb) if na and nb else 0.0

def topk(query, docs, k):
    scored = [(cos(query, v), did) for did, v in docs.items()]
    scored.sort(key=lambda s: (-s[0], s[1]))
    return [did for _, did in scored[:k]]
