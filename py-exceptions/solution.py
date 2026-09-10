def parse_ratio(text):
    try:
        a, b = text.split('/')
        return int(a) / int(b)
    except (ValueError, ZeroDivisionError):
        return None
