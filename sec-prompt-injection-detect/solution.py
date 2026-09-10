def is_injection(text):
    t = text.lower()
    patterns = ['ignore les instructions', 'instruction système', 'instruction systeme', 'oublie ce qui précède', 'oublie ce qui precede']
    return any(p in t for p in patterns)
