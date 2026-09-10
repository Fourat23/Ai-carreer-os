def chunk(text, size, overlap):
    words = text.split()
    step = size - overlap
    out = []
    i = 0
    while i < len(words):
        out.append(' '.join(words[i:i + size]))
        i += step
    return out
