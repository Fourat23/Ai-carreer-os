# Harnais genere - ne pas modifier.
import sys, json, io, importlib.util, traceback
TESTS = json.loads("[{\"id\":\"t1\",\"kind\":\"call-equals\",\"export\":\"skewed\",\"args\":[[{\"income\":5,\"age\":30},{\"income\":7,\"age\":40}],[{\"income\":5000,\"age\":31},{\"income\":7000,\"age\":39}],1]},{\"id\":\"t2\",\"kind\":\"call-equals\",\"export\":\"skewed\",\"args\":[[{\"a\":1,\"b\":10},{\"a\":3,\"b\":12}],[{\"a\":1,\"b\":11},{\"a\":3,\"b\":11}],1]},{\"id\":\"t3\",\"kind\":\"call-equals\",\"export\":\"skewed\",\"args\":[[{\"a\":0,\"b\":0}],[{\"a\":5,\"b\":9}],1]}]")
ENTRY = "solution.py"
MARKER = "__LAB_RESULT__"
_buf = io.StringIO()
_real = sys.stdout
sys.stdout = _buf
sys.stderr = io.StringIO()
mod = None
import_error = None
try:
    spec = importlib.util.spec_from_file_location("user_entry", ENTRY)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
except Exception:
    import_error = traceback.format_exc()[:2000]
observed = {}
import time as _time
for t in TESTS:
    tid = t["id"]
    if t["kind"] == "call-equals":
        _t0 = _time.time()
        if import_error:
            entry = {"error": import_error}
        else:
            fn = getattr(mod, t["export"], None)
            if not callable(fn):
                entry = {"error": "export '%s' introuvable ou non-callable" % t["export"]}
            else:
                try:
                    entry = {"value": fn(*t.get("args", []))}
                except Exception as e:
                    entry = {"error": (repr(e))[:500]}
        entry["durationMs"] = int((_time.time() - _t0) * 1000)
        observed[tid] = entry
    else:
        observed[tid] = {"error": import_error, "stdout": _buf.getvalue()} if import_error else {"stdout": _buf.getvalue()}
user_stdout = _buf.getvalue()[:100000]
sys.stdout = _real
try:
    payload = json.dumps({"observed": observed, "stdout": user_stdout})
except Exception:
    payload = json.dumps({"observed": {}, "fatal": "resultat non serialisable"})
sys.stdout.write(MARKER + payload + "\n")
