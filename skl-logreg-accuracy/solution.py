from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

def fit_eval(X_train, y_train, X_test, y_test):
    m = LogisticRegression()
    m.fit(X_train, y_train)
    pred = m.predict(X_test)
    return f'{accuracy_score(y_test, pred):.2f}'
