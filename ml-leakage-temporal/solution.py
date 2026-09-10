import pandas as pd

def suspect_leaks(rows, target):
    df = pd.DataFrame(rows)
    num = df.select_dtypes('number')
    if target not in num:
        return []
    out = []
    for c in num.columns:
        if c == target:
            continue
        corr = num[c].corr(num[target])
        if corr == corr and abs(corr) >= 0.999:
            out.append(c)
    return sorted(out)
