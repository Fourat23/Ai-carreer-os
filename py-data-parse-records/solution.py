def parse(text):
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        nom, age = line.split(',')
        rows.append([nom, int(age)])
    rows.sort(key=lambda r: r[0])
    return rows
