// Modèle DOM MINIMAL, PUR et sans dépendance — sert à NOTER les exercices web
// côté serveur (jamais dans le srcDoc). Voir ADR-011 : c'est un SOUS-ENSEMBLE
// volontairement borné du navigateur (pas de mise en page réelle, cascade CSS
// limitée). Suffisant pour le corpus V11 : sélecteurs tag/#id/.class/[attr],
// combinateur descendant, textContent, classList, getAttribute, value, et
// événements click/input pour les assertions pilotées par JS.
//
// Le même modèle est utilisé (1) directement pour les assertions statiques et
// (2) dans l'exécuteur Node existant (harnais web) où le JS de l'apprenant est
// exécuté contre `document`/`window` fournis par ce modèle.

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);

function decodeEntities(s) {
  return String(s)
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&#x27;/gi, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

// ── Nœud ─────────────────────────────────────────────────────────────────────
class LabNode {
  constructor(tag, doc) {
    this.tagName = tag ? tag.toUpperCase() : '';
    this.nodeType = tag ? 1 : 3;   // 1 element, 3 text
    this.attributes = {};
    this.childNodes = [];
    this.parentNode = null;
    this.ownerDocument = doc || null;
    this._text = '';               // pour nœuds texte / contenu brut script,style
    this._listeners = {};
    this._value = undefined;       // valeur "live" des champs de formulaire
  }
  get children() { return this.childNodes.filter((n) => n.nodeType === 1); }
  get id() { return this.attributes.id || ''; }
  get className() { return this.attributes.class || ''; }
  set className(v) { this.attributes.class = String(v); }
  get tagLower() { return this.tagName.toLowerCase(); }

  getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null; }
  setAttribute(name, val) { this.attributes[String(name)] = String(val); }
  hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attributes, name); }
  removeAttribute(name) { delete this.attributes[name]; }

  get classList() {
    const el = this;
    const list = () => (el.attributes.class ? el.attributes.class.split(/\s+/).filter(Boolean) : []);
    return {
      contains: (c) => list().includes(c),
      add: (c) => { const l = list(); if (!l.includes(c)) { l.push(c); el.attributes.class = l.join(' '); } },
      remove: (c) => { el.attributes.class = list().filter((x) => x !== c).join(' '); },
      toggle: (c) => { if (list().includes(c)) el.classList.remove(c); else el.classList.add(c); },
    };
  }

  get value() {
    if (this._value !== undefined) return this._value;
    return this.attributes.value !== undefined ? this.attributes.value : '';
  }
  set value(v) { this._value = String(v); }

  get textContent() {
    if (this.nodeType === 3) return this._text;
    let out = '';
    for (const c of this.childNodes) {
      if (c.nodeType === 3) out += c._text;
      else if (!RAW.has(c.tagLower)) out += c.textContent;
    }
    return out;
  }
  set textContent(v) {
    this.childNodes = [];
    const t = new LabNode(null, this.ownerDocument);
    t._text = String(v);
    t.parentNode = this;
    this.childNodes.push(t);
  }

  appendChild(node) { node.parentNode = this; this.childNodes.push(node); return node; }
  removeChild(node) { this.childNodes = this.childNodes.filter((n) => n !== node); return node; }

  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
  removeEventListener(type, fn) { if (this._listeners[type]) this._listeners[type] = this._listeners[type].filter((f) => f !== fn); }
  dispatchEvent(evt) {
    evt.target = evt.target || this;
    let node = this;
    let stop = false;
    evt.stopPropagation = () => { stop = true; };
    evt.preventDefault = () => { evt.defaultPrevented = true; };
    while (node) {
      evt.currentTarget = node;
      const fns = node._listeners[evt.type] || [];
      for (const fn of fns.slice()) { try { fn.call(node, evt); } catch { /* borné */ } }
      if (stop) break;
      node = node.parentNode;
    }
    return !evt.defaultPrevented;
  }

  querySelector(sel) { return querySelectorAll(this, sel)[0] || null; }
  querySelectorAll(sel) { return querySelectorAll(this, sel); }
}

// ── Parseur HTML (borné, tolérant) ───────────────────────────────────────────
export function parseHTML(html) {
  const doc = new LabDocument();
  const root = doc.documentElement;
  let cur = doc.body;                 // on rattache le contenu au body par défaut
  let head = doc.head;
  const stack = [];
  const s = String(html);
  let i = 0;
  while (i < s.length) {
    const lt = s.indexOf('<', i);
    if (lt < 0) { const txt = s.slice(i); if (txt.trim()) addText(cur || doc.body, txt); break; }
    if (lt > i) { const txt = s.slice(i, lt); if (txt.replace(/\s/g, '')) addText(cur || doc.body, decodeEntities(txt)); }
    if (s.startsWith('<!--', lt)) { const end = s.indexOf('-->', lt); i = end < 0 ? s.length : end + 3; continue; }
    if (s.startsWith('<!', lt)) { const end = s.indexOf('>', lt); i = end < 0 ? s.length : end + 1; continue; }
    const gt = s.indexOf('>', lt);
    if (gt < 0) break;
    const raw = s.slice(lt + 1, gt).trim();
    if (raw.startsWith('/')) {
      const name = raw.slice(1).trim().toLowerCase();
      // remonte jusqu'au tag correspondant
      for (let k = stack.length - 1; k >= 0; k--) { if (stack[k].tagLower === name) { stack.length = k; cur = stack[k - 1] || pickContainer(doc, name); break; } }
      cur = stack[stack.length - 1] || defaultContainer(doc, cur, head);
      i = gt + 1; continue;
    }
    const selfClose = raw.endsWith('/');
    const body = selfClose ? raw.slice(0, -1) : raw;
    const { tag, attrs } = parseTag(body);
    if (!tag) { i = gt + 1; continue; }
    const el = new LabNode(tag, doc);
    el.attributes = attrs;
    // <html>/<head>/<body> : réutiliser les nœuds structurels du document
    if (tag === 'html') { Object.assign(root.attributes, attrs); cur = root; i = gt + 1; continue; }
    if (tag === 'head') { cur = head; i = gt + 1; continue; }
    if (tag === 'body') { Object.assign(doc.body.attributes, attrs); cur = doc.body; i = gt + 1; continue; }
    (cur || doc.body).appendChild(el);
    if (RAW.has(tag)) {
      const close = s.toLowerCase().indexOf('</' + tag, gt);
      const inner = s.slice(gt + 1, close < 0 ? s.length : close);
      const t = new LabNode(null, doc); t._text = inner; el.appendChild(t);
      const closeGt = s.indexOf('>', close); i = closeGt < 0 ? s.length : closeGt + 1; continue;
    }
    if (!selfClose && !VOID.has(tag)) { stack.push(el); cur = el; }
    i = gt + 1;
  }
  return doc;
}

function pickContainer(doc) { return doc.body; }
function defaultContainer(doc, cur, head) { return cur === head ? head : doc.body; }
function addText(parent, txt) { const t = new LabNode(null, parent.ownerDocument); t._text = txt; parent.appendChild(t); }

function parseTag(body) {
  const m = body.match(/^([a-zA-Z][\w-]*)/);
  if (!m) return { tag: null, attrs: {} };
  const tag = m[1].toLowerCase();
  const attrs = {};
  const re = /([a-zA-Z_:][\w:.-]*)(\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let a; let rest = body.slice(m[1].length);
  while ((a = re.exec(rest))) {
    if (!a[1]) break;
    const name = a[1].toLowerCase();
    const val = a[4] !== undefined ? a[4] : a[5] !== undefined ? a[5] : a[6] !== undefined ? a[6] : '';
    attrs[name] = decodeEntities(val);
  }
  return { tag, attrs };
}

// ── Document ─────────────────────────────────────────────────────────────────
class LabDocument extends LabNode {
  constructor() {
    super('#document', null);
    this.ownerDocument = this;
    this.documentElement = new LabNode('html', this);
    this.head = new LabNode('head', this);
    this.body = new LabNode('body', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }
  getElementById(id) { return this.querySelector('#' + cssEscape(id)); }
  createElement(tag) { return new LabNode(String(tag), this); }
  createTextNode(text) { const t = new LabNode(null, this); t._text = String(text); return t; }
}

function cssEscape(s) { return String(s).replace(/[^\w-]/g, '\\$&'); }

// ── Sélecteurs CSS (sous-ensemble : tag #id .class [attr] [attr=val], descendant) ──
function parseCompound(part) {
  const cond = { tag: null, id: null, classes: [], attrs: [] };
  const re = /([#.]?[\w-]+|\[[^\]]+\])/g;
  let m;
  while ((m = re.exec(part))) {
    const tok = m[1];
    if (tok.startsWith('#')) cond.id = tok.slice(1);
    else if (tok.startsWith('.')) cond.classes.push(tok.slice(1));
    else if (tok.startsWith('[')) {
      const inner = tok.slice(1, -1);
      const eq = inner.match(/^([\w-]+)(?:\s*=\s*("?)([^"]*)\2)?$/);
      if (eq) cond.attrs.push({ name: eq[1], value: eq[3] !== undefined ? eq[3] : null });
    } else cond.tag = tok.toLowerCase();
  }
  return cond;
}
function matchesCompound(el, cond) {
  if (el.nodeType !== 1) return false;
  if (cond.tag && el.tagLower !== cond.tag) return false;
  if (cond.id && el.attributes.id !== cond.id) return false;
  for (const c of cond.classes) if (!el.classList.contains(c)) return false;
  for (const a of cond.attrs) {
    if (!el.hasAttribute(a.name)) return false;
    if (a.value !== null && el.getAttribute(a.name) !== a.value) return false;
  }
  return true;
}
function walkAll(node, out) { for (const c of node.childNodes) { if (c.nodeType === 1) { out.push(c); walkAll(c, out); } } }

export function querySelectorAll(root, selector) {
  // support de plusieurs sélecteurs séparés par des virgules
  const groups = String(selector).split(',').map((s) => s.trim()).filter(Boolean);
  const seen = new Set();
  const results = [];
  for (const g of groups) {
    const parts = g.split(/\s+/).filter(Boolean).map(parseCompound);
    if (!parts.length) continue;
    // match descendant : chaque partie doit correspondre le long de la chaîne d'ancêtres
    const all = []; walkAll(root, all);
    for (const el of all) {
      if (!matchesCompound(el, parts[parts.length - 1])) continue;
      let ok = true; let anc = el.parentNode; let pi = parts.length - 2;
      while (pi >= 0) {
        while (anc && !matchesCompound(anc, parts[pi])) anc = anc.parentNode;
        if (!anc) { ok = false; break; }
        anc = anc.parentNode; pi--;
      }
      if (ok && !seen.has(el)) { seen.add(el); results.push(el); }
    }
  }
  return results;
}

// ── Notation des assertions web (PURE) ───────────────────────────────────────
// `ctx` fournit le document (après exécution éventuelle du JS) + le buffer console.
export function evalWebTest(test, doc, consoleText = '') {
  const base = { testId: test.id, name: test.name, expected: test.expected ?? null };
  const first = test.selector ? doc.querySelector(test.selector) : null;
  const ok = (passed, actual, message) => ({ ...base, passed, actual, message: passed ? 'OK' : message });
  switch (test.kind) {
    case 'selector-exists':
      return ok(!!first, !!first, `aucun élément ne correspond à « ${test.selector} »`);
    case 'selector-count': {
      const n = doc.querySelectorAll(test.selector).length;
      return ok(n === test.expected, n, `attendu ${test.expected} élément(s) « ${test.selector} », trouvé ${n}`);
    }
    case 'text-contains': {
      const scope = test.selector ? (first ? first.textContent : '') : doc.body.textContent;
      const passed = scope.includes(test.expected);
      return ok(passed, scope.trim().slice(0, 200), `le texte ne contient pas « ${test.expected} »`);
    }
    case 'attribute-equals': {
      if (!first) return ok(false, null, `aucun élément « ${test.selector} »`);
      const v = first.getAttribute(test.attribute);
      return ok(v === test.expected, v, `attribut ${test.attribute} = « ${v} » (attendu « ${test.expected} »)`);
    }
    case 'class-present': {
      if (!first) return ok(false, null, `aucun élément « ${test.selector} »`);
      return ok(first.classList.contains(test.expected), first.className, `classe « ${test.expected} » absente`);
    }
    case 'input-value': {
      if (!first) return ok(false, null, `aucun élément « ${test.selector} »`);
      return ok(first.value === test.expected, first.value, `valeur « ${first.value} » (attendu « ${test.expected} »)`);
    }
    case 'computed-style-equals': {
      if (!first) return ok(false, null, `aucun élément « ${test.selector} »`);
      const v = resolveStyle(first, test.property);
      return ok(v === test.expected, v, `style ${test.property} = « ${v ?? '(absent)'} » (attendu « ${test.expected} »)`);
    }
    case 'console-contains':
      return ok(consoleText.includes(test.expected), null, `la console ne contient pas « ${test.expected} »`);
    case 'event-changes-text': {
      // dispatché en amont par le harnais ; ici on lit le résultat.
      const target = doc.querySelector(test.selector);
      const txt = target ? target.textContent : '';
      const passed = txt.includes(test.expected);
      return ok(passed, txt.trim().slice(0, 200), `après l'action, le texte est « ${txt.trim()} » (attendu contient « ${test.expected} »)`);
    }
    default:
      return ok(false, null, `type d'assertion inconnu « ${test.kind} »`);
  }
}

// Style « calculé » LIMITÉ : style inline uniquement (pas de cascade réelle).
function resolveStyle(el, prop) {
  const inline = el.getAttribute('style');
  if (inline) {
    for (const decl of inline.split(';')) {
      const [k, v] = decl.split(':');
      if (k && v && k.trim() === prop) return v.trim();
    }
  }
  return null;
}

// ── Assertions React (notation par rendu react-dom/server → HTML → ce modèle) ──
// Réutilise evalWebTest pour les familles partagées ; ajoute component-renders,
// element-count, accessible-role-exists, accessible-name-equals, list-content,
// conditional-visible.
const IMPLICIT_ROLE = {
  button: 'button', a: 'link', nav: 'navigation', main: 'main', header: 'banner',
  footer: 'contentinfo', ul: 'list', ol: 'list', li: 'listitem', img: 'img',
  h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
  input: 'textbox', textarea: 'textbox', select: 'combobox', form: 'form', table: 'table',
};
function roleOf(el) {
  const explicit = el.getAttribute && el.getAttribute('role');
  if (explicit) return explicit;
  const tag = el.tagLower;
  if (tag === 'a' && !el.hasAttribute('href')) return null;
  if (tag === 'input') { const t = (el.getAttribute('type') || 'text').toLowerCase(); return t === 'button' || t === 'submit' ? 'button' : t === 'checkbox' ? 'checkbox' : 'textbox'; }
  return IMPLICIT_ROLE[tag] ?? null;
}
function accessibleName(el) {
  const label = el.getAttribute('aria-label');
  if (label) return label.trim();
  if (el.tagLower === 'img') return (el.getAttribute('alt') || '').trim();
  return el.textContent.trim();
}
function eq(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
  return a === b;
}

export function evalReactTest(test, doc, consoleText = '') {
  const base = { testId: test.id, name: test.name, expected: test.expected ?? null };
  const ok = (passed, actual, message) => ({ ...base, passed, actual, message: passed ? 'OK' : message });
  switch (test.kind) {
    case 'component-renders': {
      const rendered = doc.body.children.length > 0 || doc.body.textContent.trim().length > 0;
      return ok(rendered, rendered, 'le composant n’a rien rendu');
    }
    case 'element-count': {
      const n = doc.querySelectorAll(test.selector).length;
      return ok(n === test.expected, n, `attendu ${test.expected} élément(s) « ${test.selector} », trouvé ${n}`);
    }
    case 'accessible-role-exists': {
      const all = doc.querySelectorAll('*').filter((el) => roleOf(el) === test.role);
      return ok(all.length > 0, all.length, `aucun élément de rôle accessible « ${test.role} »`);
    }
    case 'accessible-name-equals': {
      const el = doc.querySelector(test.selector);
      if (!el) return ok(false, null, `aucun élément « ${test.selector} »`);
      const nm = accessibleName(el);
      return ok(nm === test.expected, nm, `nom accessible « ${nm} » (attendu « ${test.expected} »)`);
    }
    case 'list-content': {
      const got = doc.querySelectorAll(test.selector).map((el) => el.textContent.trim());
      return ok(eq(got, test.expected), got, `liste « ${JSON.stringify(got)} » (attendu ${JSON.stringify(test.expected)})`);
    }
    case 'conditional-visible': {
      const present = !!doc.querySelector(test.selector);
      return ok(present === test.expected, present, test.expected ? `« ${test.selector} » devrait être visible` : `« ${test.selector} » ne devrait PAS être visible`);
    }
    default:
      return evalWebTest(test, doc, consoleText);   // familles partagées
  }
}
