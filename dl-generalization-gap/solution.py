def diagnose(train_loss, val_loss, high, gap):
    if train_loss >= high and val_loss >= high:
        return 'underfit'
    if val_loss - train_loss > gap:
        return 'overfit'
    return 'ok'
