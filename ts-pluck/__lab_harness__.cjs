// Harnais généré — ne pas modifier.
const __chunks = [];
const __origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (c, e, cb) => { __chunks.push(String(c)); if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
process.stderr.write = (c, e, cb) => { if (typeof e === 'function') e(); else if (typeof cb === 'function') cb(); return true; };
const TESTS = [{"id":"t1","kind":"call-equals","export":"pluck","args":[[{"name":"Ada","age":36},{"name":"Bo","age":20}],"name"]},{"id":"t2","kind":"call-equals","export":"pluck","args":[[{"name":"Ada","age":36},{"name":"Bo","age":20}],"age"]},{"id":"t3","kind":"call-equals","export":"pluck","args":[[],"x"]},{"id":"t4","kind":"call-equals","export":"pluck","args":[[{"id":7}],"id"]}];
(async () => {
  let mod = null, importError = null;
  try { mod = require("./solution.js"); }
  catch (e) { importError = String((e && e.stack) || e).slice(0, 2000); }
  if (mod && mod.default && typeof mod === 'object') { /* interop léger : exports nommés préférés */ }
  const observed = {};
  for (const t of TESTS) {
    if (t.kind === 'call-equals') {
      const __t0 = Date.now();
      let entry;
      if (importError) entry = { error: importError };
      else {
        try {
          let fn = mod[t.export];
          if (typeof fn !== 'function' && mod.default && typeof mod.default[t.export] === 'function') fn = mod.default[t.export];
          if (typeof fn !== 'function') entry = { error: "export « " + t.export + " » introuvable ou non-fonction" };
          else { const value = await fn(...(t.args || [])); entry = { value }; }
        } catch (e) { entry = { error: String((e && e.message) || e).slice(0, 500) }; }
      }
      entry.durationMs = Date.now() - __t0;
      observed[t.id] = entry;
    } else {
      observed[t.id] = importError ? { error: importError, stdout: __chunks.join('') } : { stdout: __chunks.join('') };
    }
  }
  const userStdout = __chunks.join('');
  process.stdout.write = __origWrite;
  let payload;
  try { payload = JSON.stringify({ observed, stdout: userStdout.slice(0, 100000) }); }
  catch { payload = JSON.stringify({ observed: {}, fatal: "résultat non sérialisable" }); }
  __origWrite("__LAB_RESULT__" + payload + "\n");
})();
