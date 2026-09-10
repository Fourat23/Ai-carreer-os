import pandas as pd

def total_montant(rows):
    df = pd.DataFrame(rows)
    df['montant'] = pd.to_numeric(df['montant'])
    return int(df['montant'].sum())
