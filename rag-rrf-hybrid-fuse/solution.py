def rrf(list_a, list_b):
    scores = {}
    for lst in (list_a, list_b):
        for rank, did in enumerate(lst, start=1):
            scores[did] = scores.get(did, 0.0) + 1.0 / (60 + rank)
    order = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
    return [did for did, _ in order]
