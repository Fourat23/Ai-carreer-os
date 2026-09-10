def exact_match(rows):
    if not rows:
        return '0.000'
    ok = sum(1 for r in rows if r['pred'].strip() == r['gold'].strip())
    return f'{ok/len(rows):.3f}'
