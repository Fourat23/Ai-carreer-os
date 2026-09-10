def top_k_frequent(nums, k):
    counts = {}
    for n in nums:
        counts[n] = counts.get(n, 0) + 1
    ordered = sorted(counts, key=lambda v: (-counts[v], v))
    return ordered[:k]
