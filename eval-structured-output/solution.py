def validate(out, schema):
    errs = []
    for f, t in schema.items():
        if f not in out:
            errs.append(f'manquant:{f}')
        else:
            v = out[f]
            ok = (t == 'int' and isinstance(v, int) and not isinstance(v, bool)) or (t == 'str' and isinstance(v, str)) or (t == 'bool' and isinstance(v, bool))
            if not ok:
                errs.append(f'type:{f}')
    errs.sort()
    return errs
