def diagnose(train_acc, val_acc):
    if train_acc < 0.7:
        return 'underfit'
    if train_acc >= 0.9 and (train_acc - val_acc) >= 0.2:
        return 'overfit'
    return 'ok'
