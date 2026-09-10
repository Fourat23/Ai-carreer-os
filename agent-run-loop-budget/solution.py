def run(actions, budget):
    steps = 0
    for a in actions:
        if steps >= budget:
            return [steps, 'budget']
        steps += 1
        if a == 'final':
            return [steps, 'done']
    return [steps, 'budget'] if steps >= budget else [steps, 'done']
