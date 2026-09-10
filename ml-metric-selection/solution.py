def choose_metric(ctx):
    fn = ctx.get('false_negative_cost')
    fp = ctx.get('false_positive_cost')
    if fn == 'high' and fp != 'high':
        return 'recall'
    if fp == 'high' and fn != 'high':
        return 'precision'
    if ctx.get('balanced') and fn == fp:
        return 'accuracy'
    return 'f1'
