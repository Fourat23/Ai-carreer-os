def diagnose(case):
    inctx = case.get('answer_in_context')
    correct = case.get('answer_correct')
    if correct and not inctx:
        return 'lucky-guess'
    if not inctx:
        return 'retrieval'
    if inctx and not correct:
        return 'generation'
    return 'ok'
