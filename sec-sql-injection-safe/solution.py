def assess(query):
    if query.get('concatenates_user_input'):
        return 'unsafe'
    return 'safe' if '?' in query.get('sql', '') else 'unsafe'
