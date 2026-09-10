// Harnais généré — ne pas modifier.
const __chunks = [];
const __origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, e, cb) => { __chunks.push(String(c)); if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
process.stderr.write = (c, e, cb) => { if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
const TESTS = [{"id":"t1","kind":"call-equals","export":"countByLevel","args":[["12:00 ERROR boom","12:01 INFO ok","12:02 ERROR again"]]},{"id":"t2","kind":"call-equals","export":"countByLevel","args":[["t WARN slow","t DEBUG x"]]},{"id":"t3","kind":"call-equals","export":"countByLevel","args":[["t TRACE noise","t INFO ok"]]},{"id":"t4","kind":"call-equals","export":"countByLevel","args":[[]]},{"id":"t5","kind":"call-equals","export":"countByLevel","args":[["a FATAL x","b VERBOSE y"]]}];
(async () => {
  let mod = null, importError = null;
  try { mod = await import("./solution.mjs"); }
  catch (e) { importError = String((e && e.stack) || e).slice(0, 2000); }
  const stdout = __chunks.join('');
  const observed = {};
  for (const t of TESTS) {
    if (t.kind === 'call-equals') {
      const __t0 = Date.now();
      let entry;
      if (importError) entry = { error: importError };
      else {
        try {
          const fn = mod[t.export];
          if (typeof fn !== 'function') entry = { error: "export « " + t.export + " » introuvable ou non-fonction" };
          else { const value = await fn(...(t.args || [])); entry = { value }; }
        } catch (e) { entry = { error: String((e && e.message) || e).slice(0, 500) }; }
      }
      entry.durationMs = Date.now() - __t0;
      observed[t.id] = entry;
    } else {
      observed[t.id] = importError ? { error: importError, stdout } : { stdout };
    }
  }
  const userStdout = __chunks.join('');
  process.stdout.write = __origWrite;
  let payload;
  try { payload = JSON.stringify({ observed, stdout: userStdout.slice(0, 100000) }); }
  catch { payload = JSON.stringify({ observed: {}, fatal: "résultat non sérialisable" }); }
  __origWrite("__LAB_RESULT__" + payload + "\n");
})();
