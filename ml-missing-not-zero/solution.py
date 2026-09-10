import pandas as pd

def means(values):
    s = pd.Series(values, dtype='float')
    zero = s.fillna(0).mean()
    skip = s.mean()
    return f'zero={zero:.2f} skip={skip:.2f}'
