import pandas as pd

def clean(rows):
    df = pd.DataFrame(rows)
    before = len(df)
    df2 = df.dropna()
    return [before, len(df2)]
