from collections import defaultdict

def group_sum(rows):
    acc = defaultdict(int)
    for r in rows:
        acc[r['service']] += r['salaire']
    out = [[s, t] for s, t in acc.items()]
    out.sort(key=lambda x: (-x[1], x[0]))
    return out
