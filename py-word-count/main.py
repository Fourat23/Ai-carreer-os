from freq import normalize
def word_count(text):
    d = {}
    for w in normalize(text):
        d[w] = d.get(w, 0) + 1
    return d
