def classify(key):
    k = key.lower()
    for m in ('password', 'token', 'key', 'secret', 'credential'):
        if m in k:
            return 'secret'
    return 'config'
