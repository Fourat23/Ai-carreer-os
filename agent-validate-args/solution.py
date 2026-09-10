def validate(args, schema):
    errors = []
    for field, typ in schema.items():
        if field not in args:
            errors.append(f'manquant:{field}')
        else:
            v = args[field]
            ok = (typ == 'int' and isinstance(v, int) and not isinstance(v, bool)) or (typ == 'str' and isinstance(v, str))
            if not ok:
                errors.append(f'type:{field}')
    errors.sort()
    return errors
