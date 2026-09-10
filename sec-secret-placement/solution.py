def placement(item):
    if not item.get('sensitive'):
        return 'config'
    return 'vault' if item.get('env') == 'prod' else 'env'
