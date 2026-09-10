def diagnose(gold_retrieved, grounded):
    if not gold_retrieved:
        return 'retrieval'
    if not grounded:
        return 'generation'
    return 'ok'
