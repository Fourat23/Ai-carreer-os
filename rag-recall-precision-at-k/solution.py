def metrics_at_k(retrieved, relevant, k):
    topk = retrieved[:k]
    rel = set(relevant)
    hit = sum(1 for d in topk if d in rel)
    r = hit / len(rel) if rel else 0.0
    p = hit / k if k else 0.0
    return f'r={r:.2f} p={p:.2f}'
