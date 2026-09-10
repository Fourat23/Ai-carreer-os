import re

def redact(line):
    return re.sub(r'(token=)([^\s]+)', r'\1***', line)
