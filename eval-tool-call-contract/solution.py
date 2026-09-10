def check(call, contract):
    if call.get('name') != contract.get('name'):
        return ['invalid:name']
    args = call.get('args', {})
    missing = [f'missing:{a}' for a in contract.get('required', []) if a not in args]
    missing.sort()
    return missing
