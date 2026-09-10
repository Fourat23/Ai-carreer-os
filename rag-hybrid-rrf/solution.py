def rrf(lex, sem, k=60):
    scores = {}
    for ranking in (lex, sem):
        for rank, doc in enumerate(ranking, start=1):
            scores[doc] = scores.get(doc, 0.0) + 1.0 / (k + rank)
    return sorted(scores, key=lambda d: (-scores[d], d))
