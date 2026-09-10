def fit_context(messages, max_tokens):
    system = [m for m in messages if m['role'] == 'system']
    used = sum(m['tokens'] for m in system)
    kept = set(m['id'] for m in system)
    for m in reversed(messages):
        if m['role'] == 'system':
            continue
        if used + m['tokens'] <= max_tokens:
            used += m['tokens']
            kept.add(m['id'])
    return [m['id'] for m in messages if m['id'] in kept]
