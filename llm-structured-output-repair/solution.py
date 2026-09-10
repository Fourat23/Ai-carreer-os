def repair(out, schema):
    result = dict(out)
    for field, spec in schema.items():
        if field in result:
            continue
        if spec.get('required'):
            raise ValueError('champ requis manquant: ' + field)
        result[field] = spec.get('default')
    return result
