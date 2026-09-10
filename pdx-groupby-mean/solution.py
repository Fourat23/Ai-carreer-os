import pandas as pd

def group_mean(rows):
    df = pd.DataFrame(rows)
    g = df.groupby('service')['salaire'].mean()
    return [[s, int(round(v))] for s, v in sorted(g.items())]
