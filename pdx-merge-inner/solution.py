import pandas as pd

def join_count(a, b):
    da, db = pd.DataFrame(a), pd.DataFrame(b)
    m = pd.merge(da, db, on='id', how='inner')
    return len(m)
