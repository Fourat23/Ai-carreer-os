def detect_loop(history):
    seen = set()
    for i, action in enumerate(history):
        key = tuple(action)
        if key in seen:
            return i
        seen.add(key)
    return -1
