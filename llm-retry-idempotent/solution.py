def executed(attempts):
    return len({a['key'] for a in attempts})
