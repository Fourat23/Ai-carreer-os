def validate(rows):
    errors = []
    for i, r in enumerate(rows):
        nom = r.get('nom')
        age = r.get('age')
        if not isinstance(nom, str) or nom == '':
            errors.append(f'ligne {i}: nom')
        if not isinstance(age, int) or isinstance(age, bool) or age < 0 or age > 120:
            errors.append(f'ligne {i}: age')
    errors.sort()
    return errors
