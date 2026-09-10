def scan(text):
    patterns = {
        'ignore-instructions': ['ignore les instructions', 'ignore previous', 'oublie tout'],
        'role-override': ['tu es maintenant', 'you are now', 'agis comme'],
        'system-exfil': ['system prompt', 'révèle tes instructions', 'reveal your prompt'],
    }
    low = text.lower()
    hits = [name for name, needles in patterns.items() if any(n in low for n in needles)]
    return sorted(hits)
