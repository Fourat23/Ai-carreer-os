def grounded(claims, context):
    if not claims:
        return '0.00'
    ok = 0
    for c in claims:
        txt = context.get(c['chunk_id'])
        if txt is not None and c['claim'] in txt:
            ok += 1
    return f'{ok/len(claims):.2f}'
