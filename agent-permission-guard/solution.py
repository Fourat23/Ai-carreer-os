def guard(tool, required_perm, allowlist):
    if tool == 'shell.exec':
        return 'deny'
    return 'allow' if required_perm in allowlist else 'deny'
