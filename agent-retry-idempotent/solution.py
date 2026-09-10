def decide(idempotent, attempts, max_attempts):
    if idempotent and attempts < max_attempts:
        return 'retry'
    return 'abort'
