def dedup_latest(events):
    best = {}
    for e in events:
        cur = best.get(e['id'])
        if cur is None or e['ts'] >= cur[0]:
            best[e['id']] = (e['ts'], e['val'])
    out = [[k, v[1]] for k, v in best.items()]
    out.sort(key=lambda x: x[0])
    return out
