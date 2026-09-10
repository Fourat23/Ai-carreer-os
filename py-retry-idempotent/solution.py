def process_events(events):
    total = 0
    seen = set()
    for e in events:
        key = e.get("id")
        if key is not None and key in seen:
            continue
        if key is not None:
            seen.add(key)
        total += e["amount"]
    return total
