from sklearn.model_selection import train_test_split

def split(X, y):
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42)
    return [len(Xtr), len(Xte)]
