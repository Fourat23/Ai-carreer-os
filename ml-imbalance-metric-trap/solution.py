from sklearn.metrics import accuracy_score, recall_score, f1_score

def evaluate(y_true, y_pred):
    a = accuracy_score(y_true, y_pred)
    r = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
    f = f1_score(y_true, y_pred, average='macro', zero_division=0)
    return f'acc={a:.2f} rec1={r:.2f} f1m={f:.2f}'
