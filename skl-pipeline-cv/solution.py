from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

def cv_mean(X, y):
    pipe = Pipeline([('scaler', StandardScaler()), ('model', LogisticRegression())])
    scores = cross_val_score(pipe, X, y, cv=3)
    return f'{scores.mean():.2f}'
