def route(intent):
    table = {'meteo': 'weather', 'calcul': 'calculator', 'recherche': 'search'}
    return table.get(intent, 'reject')
