def bow(text):
    d = {}
    for w in text.lower().split():
        d[w] = d.get(w, 0) + 1
    return d
