// Construction PURE et sécurisée du document de preview (srcDoc) — aucune I/O.
// À partir des fichiers PUBLICS d'un exercice web (HTML/CSS/JS), produit le
// document rendu dans une iframe sandboxée. Voir docs/ADR-011.
//
// Garanties de sécurité (côté document) :
//  • CSP stricte injectée (default-src 'none', connect-src 'none', …) ;
//  • bootstrap d'instrumentation (console + erreurs) posté vers le parent avec
//    un identifiant de canal non devinable, en UN SEUL sens ;
//  • séquences </script> neutralisées dans le JS injecté inline ;
//  • AUCUNE donnée privée : cette fonction ne reçoit que le contenu éditable
//    public ; jamais de test privé, de solution ni de progression.
// L'iframe elle-même (sandbox sans allow-same-origin) est posée par le client.

const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "base-uri 'none'",
  "form-action 'none'",
  "connect-src 'none'",
].join('; ');

const DEFAULT_ENTRY = 'index.html';

function isHtml(p) { return /\.html?$/i.test(p); }
function isCss(p) { return /\.css$/i.test(p); }
function isJs(p) { return /\.js$/i.test(p); }

// Neutralise toute séquence de fermeture de balise script dans du contenu inline.
function neutralizeScript(code) {
  return String(code).replace(/<\/(script)/gi, '<\\/$1');
}
// Échappe pour un attribut HTML entre guillemets doubles.
function attrEscape(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

// Identifiant de canal aléatoire non devinable (client). Fallback déterministe
// uniquement si aucune source d'aléa (jamais en navigateur).
export function makeChannel() {
  try {
    const g = globalThis;
    if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
      const a = new Uint8Array(16); g.crypto.getRandomValues(a);
      return 'ch_' + Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch { /* no crypto */ }
  return 'ch_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Bootstrap d'instrumentation injecté AVANT tout script utilisateur.
function bootstrap(channel) {
  const ch = JSON.stringify(String(channel));
  return `<script>
(function(){
  var CH=${ch}, MAX=200, LEN=2000, count=0;
  function ser(v,d,seen){ d=d||0; seen=seen||[]; try{
    if(v===null) return 'null'; var t=typeof v;
    if(t==='undefined') return 'undefined';
    if(t==='string') return v;
    if(t==='number'||t==='boolean') return String(v);
    if(t==='function') return '[function '+(v.name||'')+']';
    if(t==='object'){ if(seen.indexOf(v)>=0) return '[cycle]'; if(d>3) return Array.isArray(v)?'[…]':'{…}'; seen=seen.concat([v]); }
    if(Array.isArray(v)) return '['+v.slice(0,20).map(function(x){return ser(x,d+1,seen);}).join(', ')+(v.length>20?', …':'')+']';
    var ks=Object.keys(v).slice(0,20), out=[];
    for(var i=0;i<ks.length;i++){ out.push(ks[i]+': '+ser(v[ks[i]],d+1,seen)); }
    return '{'+out.join(', ')+(Object.keys(v).length>20?', …':'')+'}';
  }catch(e){ return '[valeur non sérialisable]'; } }
  function send(msg){ if(count>=MAX){ return; } count++; try{ parent.postMessage(Object.assign({channel:CH},msg),'*'); }catch(e){} }
  ['log','info','warn','error','debug'].forEach(function(m){
    var orig=(console[m]||console.log).bind(console);
    console[m]=function(){ var a=Array.prototype.slice.call(arguments);
      var text=a.map(function(x){return ser(x);}).join(' '); if(text.length>LEN){ text=text.slice(0,LEN)+'…'; }
      send({type:'console',level:m,text:text}); try{orig.apply(null,arguments);}catch(e){} };
  });
  window.addEventListener('error',function(e){ var t=e&&e.message?String(e.message):'Erreur';
    send({type:'error',level:'error',text:t,line:(e&&e.lineno)||null,col:(e&&e.colno)||null}); });
  window.addEventListener('unhandledrejection',function(e){ var r=e&&e.reason;
    send({type:'error',level:'error',text:'Promesse rejetée : '+((r&&r.message)?r.message:ser(r))}); });
  try{ parent.postMessage({channel:CH,type:'ready'},'*'); }catch(e){}
})();
</script>`;
}

function headInjection(channel, cssFiles) {
  const meta = `<meta http-equiv="Content-Security-Policy" content="${attrEscape(CSP)}">`;
  const styles = cssFiles.map((f) => `<style data-file="${attrEscape(f.path)}">\n${String(f.content).replace(/<\/(style)/gi, '<\\/$1')}\n</style>`).join('\n');
  return `${meta}\n${bootstrap(channel)}\n${styles}`;
}

function bodyInjection(jsFiles) {
  return jsFiles.map((f) => `<script data-file="${attrEscape(f.path)}">\n${neutralizeScript(f.content)}\n</script>`).join('\n');
}

// Insère `frag` juste avant la 1re occurrence (insensible à la casse) de `tag`,
// ou renvoie null si absent.
function insertBefore(html, tag, frag) {
  const i = html.toLowerCase().indexOf(tag);
  if (i < 0) return null;
  return html.slice(0, i) + frag + '\n' + html.slice(i);
}

/**
 * Construit le srcDoc de preview.
 * @param {Array<{path:string, content:string}>} files  fichiers PUBLICS éditables
 * @param {{ channel?:string, entry?:string }} [opts]
 * @returns {{ srcDoc:string, channel:string, entry:string, cssOrder:string[], jsOrder:string[] }}
 */
export function buildPreviewDoc(files, opts = {}) {
  const list = Array.isArray(files) ? files.filter((f) => f && typeof f.path === 'string') : [];
  const channel = String(opts.channel || makeChannel());
  const entry = opts.entry && list.some((f) => f.path === opts.entry)
    ? opts.entry
    : (list.find((f) => f.path === DEFAULT_ENTRY)?.path ?? list.find((f) => isHtml(f.path))?.path ?? null);

  const cssFiles = list.filter((f) => isCss(f.path));      // ordre déclaré (déterministe)
  const jsFiles = list.filter((f) => isJs(f.path));        // ordre déclaré (déterministe)

  let html = entry ? String(list.find((f) => f.path === entry).content) : '';
  if (!/<html[\s>]/i.test(html)) {
    // Enveloppe minimale si l'entrée n'est pas un document complet.
    html = `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${html}\n</body>\n</html>`;
  }

  // ── Injection dans <head> (CSP + bootstrap + styles) ──
  const head = headInjection(channel, cssFiles);
  let out = insertBefore(html, '</head>', head);
  if (out === null) {
    // Pas de </head> : injecter après <html…> ou en tête.
    const m = html.match(/<html[^>]*>/i);
    if (m) out = html.replace(m[0], `${m[0]}\n<head>\n${head}\n</head>`);
    else out = `<head>\n${head}\n</head>\n${html}`;
  }

  // ── Injection des scripts utilisateur en fin de <body> ──
  const body = bodyInjection(jsFiles);
  if (body) {
    const withBody = insertBefore(out, '</body>', body);
    out = withBody !== null ? withBody : out + '\n' + body;
  }

  return { srcDoc: out, channel, entry: entry ?? DEFAULT_ENTRY, cssOrder: cssFiles.map((f) => f.path), jsOrder: jsFiles.map((f) => f.path) };
}

export const PREVIEW_CSP = CSP;
