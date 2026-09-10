// Harnais généré — ne pas modifier.
const __chunks = [];
const __origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, e, cb) => { __chunks.push(String(c)); if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
process.stderr.write = (c, e, cb) => { if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
const TESTS = [{"id":"t1","kind":"call-equals","export":"hostPortFor","args":[["8080:80","5432:5432"],80]},{"id":"t2","kind":"call-equals","export":"hostPortFor","args":[["8080:80","5432:5432"],5432]},{"id":"t3","kind":"call-equals","export":"hostPortFor","args":[["8080:80"],3000]},{"id":"t4","kind":"call-equals","export":"hostPortFor","args":[[],80]},{"id":"t5","kind":"call-equals","export":"hostPortFor","args":[["9000:80","9001:80"],80]}];
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
