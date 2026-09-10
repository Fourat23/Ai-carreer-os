def recall_at_k(queries):
    if not queries:
        return '0.000'
    hits = 0
    for q in queries:
        if q['relevant'] in q['retrieved'][:q['k']]:
            hits += 1
    return f'{hits/len(queries):.3f}'
