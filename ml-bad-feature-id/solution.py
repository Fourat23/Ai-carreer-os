import pandas as pd

def drop_columns(rows):
    df = pd.DataFrame(rows)
    n = len(df)
    out = []
    for c in df.columns:
        nu = df[c].nunique(dropna=False)
        if nu <= 1 or nu == n:
            out.append(c)
    return sorted(out)
