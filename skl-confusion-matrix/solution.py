from sklearn.metrics import confusion_matrix

def cm(y_true, y_pred):
    m = confusion_matrix(y_true, y_pred, labels=[0, 1])
    return [int(x) for x in m.ravel()]
