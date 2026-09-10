from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

def compare(X, y):
    base = DummyClassifier(strategy='most_frequent').fit(X, y)
    b = accuracy_score(y, base.predict(X))
    m = accuracy_score(y, LogisticRegression().fit(X, y).predict(X))
    if m <= b:
        return 'no-lift'
    return f'lift=+{m-b:.2f}'
