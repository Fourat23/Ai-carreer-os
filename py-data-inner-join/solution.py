def inner_join(a, b):
    idx = {r['id']: r['nom'] for r in b}
    out = []
    for r in a:
        if r['id'] in idx:
            out.append([r['id'], r['nom'], idx[r['id']]])
    out.sort(key=lambda x: x[0])
    return out
