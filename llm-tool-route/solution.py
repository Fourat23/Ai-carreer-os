def route(query, tools):
    low = query.lower()
    best, best_n = 'none', 0
    for name in sorted(tools):
        n = sum(1 for k in tools[name] if k.lower() in low)
        if n > best_n:
            best, best_n = name, n
    return best
