def categorize(flags):
    if not flags.get('in_context'):
        return 'retrieval-miss'
    if not flags.get('correct_format'):
        return 'format-error'
    if not flags.get('factually_correct'):
        return 'hallucination'
    return 'ok'
