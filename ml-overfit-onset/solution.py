def best_epoch(train_acc, val_acc):
    best_i, best_v = 0, val_acc[0]
    for i, v in enumerate(val_acc):
        if v > best_v:
            best_v, best_i = v, i
    return best_i
