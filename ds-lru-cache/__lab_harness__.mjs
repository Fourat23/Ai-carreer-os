// Harnais généré — ne pas modifier.
const __chunks = [];
const __origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, e, cb) => { __chunks.push(String(c)); if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
process.stderr.write = (c, e, cb) => { if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
const TESTS = [{"id":"t1","kind":"call-equals","export":"lruProcess","args":[2,[["put",1,10],["put",2,20],["get",1],["put",3,30],["get",2],["get",3]]]},{"id":"t2","kind":"call-equals","export":"lruProcess","args":[3,[["put",5,50],["get",5],["get",9]]]},{"id":"t3","kind":"call-equals","export":"lruProcess","args":[2,[["put",1,1],["put",2,2],["get",1],["put",3,3],["get",1],["get",2]]]},{"id":"t4","kind":"call-equals","export":"lruProcess","args":[2,[["put",1,1],["put",2,2],["put",1,9],["put",3,3],["get",2],["get",1],["get",3]]]}];
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
