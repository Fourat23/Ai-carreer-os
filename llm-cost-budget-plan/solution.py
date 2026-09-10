def plan(cfg):
    per = (cfg['tokens_prompt'] + cfg['k'] * cfg['tokens_chunk']) * cfg['price_in'] + cfg['tokens_out'] * cfg['price_out']
    monthly = per * cfg['rpm']
    if monthly <= cfg['budget']:
        return 'ok'
    # levier: si le contexte domine (>60% du coût d'entrée), reduce-k ; sinon si
    # un cache aiderait (cache_hit>=0.3), cache ; sinon smaller-model.
    in_cost = (cfg['tokens_prompt'] + cfg['k'] * cfg['tokens_chunk']) * cfg['price_in']
    ctx_cost = cfg['k'] * cfg['tokens_chunk'] * cfg['price_in']
    if in_cost > 0 and ctx_cost / in_cost > 0.6:
        return 'reduce-k'
    if cfg.get('cache_hit', 0) >= 0.3:
        return 'cache'
    return 'smaller-model'
