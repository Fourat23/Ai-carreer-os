def harness_report(rows, baseline_em, tol):
    n = len(rows)
    ok = sum(1 for r in rows if r['pred'].strip() == r['gold'].strip())
    em = ok / n if n else 0.0
    fails = {}
    for r in rows:
        if r['pred'].strip() != r['gold'].strip():
            fails[r['category']] = fails.get(r['category'], 0) + 1
    ordered = sorted(fails.items(), key=lambda kv: (-kv[1], kv[0]))
    return {
        'exact_match': f'{em:.3f}',
        'gate': 'regression' if baseline_em - em > tol else 'pass',
        'top_failures': [f'{c}:{n}' for c, n in ordered],
    }
