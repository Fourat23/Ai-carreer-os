#!/usr/bin/env python3
"""V71 — CP12. Verification EXECUTABLE des affirmations chiffrees introduites
pendant V71 (CP9 a CP11) et qui n avaient encore aucun script.

Chaque bloc affiche : ce que la lecon AFFIRME, ce que l execution PRODUIT, et le
verdict. Aucune affirmation n est reputee vraie parce qu elle est plausible.
"""
import math
import numpy as np

OK, KO = [], []


def verifie(lecon, affirme, obtenu, vrai):
    (OK if vrai else KO).append(lecon)
    print(f"  {'OK ' if vrai else 'FAUX'}  {lecon:<30} affirme: {affirme:<34} obtenu: {obtenu}")


print("=" * 78)
print("CP12 — assertions V71 verifiees par execution")
print("=" * 78)

# ── neural-networks : le gradient qui s evanouit ──────────────────────────────
print("\n[neural-networks] derivee majoree par 0,25, amplitude apres k couches")
attendus = {1: "0,25", 5: "9,8e-4", 10: "9,5e-7", 20: "9,1e-13", 50: "7,9e-31"}
for k, att in attendus.items():
    v = 0.25 ** k
    # tolerance : deux chiffres significatifs
    a = float(att.replace(",", ".").replace("e", "e"))
    verifie(f"neural-networks k={k}", att, f"{v:.2g}", math.isclose(v, a, rel_tol=0.02))

# ── neural-networks : deux couches lineaires = une seule ──────────────────────
print("\n[neural-networks] rang du produit de deux matrices aleatoires")
rng = np.random.default_rng(20260908)
A = rng.normal(size=(8, 3))
B = rng.normal(size=(3, 8))
r = np.linalg.matrix_rank(A @ B)
verifie("neural-networks rang", "min(8,3) = 3", str(r), r == 3)

# ── neural-networks : XOR sans couche cachee ──────────────────────────────────
print("\n[neural-networks] XOR sans couche cachee : les sorties se figent vers 0,5")
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([0.0, 1.0, 1.0, 0.0])
w = rng.normal(size=2) * 0.1
b = 0.0
for _ in range(200_000):                       # cent fois plus que necessaire
    z = X @ w + b
    p = 1 / (1 + np.exp(-z))
    g = p - y
    w -= 0.1 * (X.T @ g) / 4
    b -= 0.1 * g.mean()
p = 1 / (1 + np.exp(-(X @ w + b)))
ecart = float(np.max(np.abs(p - 0.5)))
verifie("neural-networks XOR", "les 4 sorties ~ 0,50", " ".join(f"{v:.3f}" for v in p), ecart < 0.02)

# ── transformers : cout quadratique ───────────────────────────────────────────
print("\n[transformers] nombre de paires : de 512 a 128 000 unites")
f = (128_000 / 512) ** 2
verifie("transformers paires", "x62 500", f"x{f:.0f}", math.isclose(f, 62_500))

# ── transformers : l ecart-type des scores croit comme la racine de d ─────────
print("\n[transformers] ecart-type des scores bruts, puis apres division par sqrt(d)")
for d in (8, 64, 512):
    q = rng.normal(size=(4000, d))
    k = rng.normal(size=(4000, d))
    s = (q * k).sum(axis=1)
    brut, divise = float(s.std()), float((s / math.sqrt(d)).std())
    verifie(f"transformers d={d}", f"brut ~ sqrt({d}) = {math.sqrt(d):.1f}",
            f"brut {brut:.2f} / divise {divise:.2f}",
            math.isclose(brut, math.sqrt(d), rel_tol=0.10) and math.isclose(divise, 1.0, rel_tol=0.10))

# ── embeddings : cosinus(v, v) === 1 est FAUX ─────────────────────────────────
print("\n[embeddings] cosinus(v, v) compare a 1 par egalite stricte")
faux_par_graine = {}
for graine in (3, 42, 20260908):
    r = np.random.default_rng(graine)
    n = sum(1 for _ in range(10_000)
            if (lambda v: float(v @ v) / (float(np.linalg.norm(v)) ** 2) != 1.0)(r.uniform(-1, 1, 8)))
    faux_par_graine[graine] = n / 100
    verifie(f"embeddings graine {graine}", "~ une fois sur deux", f"{n/100:.1f} %", 40 < n / 100 < 60)
rng2 = np.random.default_rng(3)

# ── embeddings : les trois verifications du critere ───────────────────────────
print("\n[embeddings] les trois verifications ecrites dans le critere de reussite")
v = rng2.uniform(-1, 1, 8)
cos = lambda a, b: float(a @ b) / (float(np.linalg.norm(a)) * float(np.linalg.norm(b)))
verifie("embeddings tolerance", "|cos(v,v) - 1| < 1e-9", f"{abs(cos(v, v) - 1):.2e}", abs(cos(v, v) - 1) < 1e-9)
verifie("embeddings oppose", "cos(v, -v) = -1", f"{cos(v, -v):.6f}", abs(cos(v, -v) + 1) < 1e-9)
o1, o2 = np.array([1.0, 0.0]), np.array([0.0, 1.0])
verifie("embeddings orthogonal", "cos([1,0],[0,1]) = 0 exact", repr(cos(o1, o2)), cos(o1, o2) == 0.0)

# ── vector-databases : empreinte memoire ──────────────────────────────────────
print("\n[vector-databases] 200 000 chunks x 768 dimensions en float32")
octets = 200_000 * 768 * 4
verifie("vector-databases", "614 400 000 o = 614 Mo", f"{octets} o = {octets/1e6:.1f} Mo", octets == 614_400_000)
verifie("vector-databases Mio", "586 Mio", f"{octets/1024**2:.1f} Mio", abs(octets / 1024 ** 2 - 585.9) < 0.2)

# ── ci-cd : instabilite cumulee ───────────────────────────────────────────────
print("\n[ci-cd] pipeline vert du premier coup, p = 1/20")
for k, att in ((1, 95), (5, 77), (14, 49)):
    v = (1 - 0.05) ** k * 100
    verifie(f"ci-cd k={k}", f"{att} %", f"{v:.1f} %", abs(round(v) - att) <= 1)

# ── cloud-finops : la facture ─────────────────────────────────────────────────
print("\n[cloud-finops] somme de la colonne, arrondis, et le geste a 273 EUR")
h = 730
postes = [4 * 0.16 * h, 3 * 0.16 * h, 2 * 0.08 * h, 0.34 * h, 0.34 * h,
          12 * 100 * 0.10, 5 * 3.60, 2000 * 0.023, 3000 * 0.09]
total = sum(postes)
somme_arrondie = sum(round(x) for x in postes)
verifie("cloud-finops total", "1 884,80 -> 1 885", f"{total:.2f} -> {round(total)}", round(total) == 1885)
verifie("cloud-finops colonne", "colonne arrondie = 1 884", str(somme_arrondie), somme_arrondie == 1884)
ext = (3 * 0.16 + 2 * 0.08) * h * (14 / 24)
verifie("cloud-finops geste 2", "273 EUR", f"{ext:.1f}", round(ext) == 273)
cumul = (12 * 100 * 0.10 + 5 * 3.60) + ext + 0.34 * h * 0.5
verifie("cloud-finops cumul", "535 EUR, 28 %", f"{cumul:.0f} EUR, {cumul/total*100:.0f} %",
        round(cumul) == 535 and round(cumul / total * 100) == 28)

# ── ai-evaluation : la ponderation 0,40 / 0,40 / 0,20 ─────────────────────────
print("\n[ai-evaluation] note globale ponderee des trois systemes")
for nom, (rap, fid, ref), att in (("A", (0.80, 0.70, 0.90), 0.78),
                                  ("B", (0.70, 0.80, 0.90), 0.78),
                                  ("C", (0.95, 0.95, 0.00), 0.76)):
    v = 0.40 * rap + 0.40 * fid + 0.20 * ref
    verifie(f"ai-evaluation {nom}", f"{att:.2f}", f"{v:.2f}", abs(v - att) < 0.005)

# ── statistics-for-ml : les quatre affirmations sur numpy ─────────────────────
print("\n[statistics-for-ml] les affirmations d API sur numpy")
verifie("numpy mean", "np.array([1,2,3]).mean() = 2.0", str(np.array([1, 2, 3]).mean()), np.array([1, 2, 3]).mean() == 2.0)
verifie("numpy broadcast", "[1,2,3] * 2 = [2 4 6]", str(np.array([1, 2, 3]) * 2), list(np.array([1, 2, 3]) * 2) == [2, 4, 6])
r1 = np.random.default_rng(42).integers(0, 10, 3)
r2 = np.random.default_rng(42).integers(0, 10, 3)
verifie("numpy reproductible", "default_rng(42) rejouable", f"{list(r1)} == {list(r2)}", list(r1) == list(r2))

print("\n" + "=" * 78)
print(f"ASSERTIONS VERIFIEES : {len(OK)}   —   ASSERTIONS FAUSSES : {len(KO)}")
if KO:
    print("FAUSSES :", ", ".join(KO))
print("=" * 78)
raise SystemExit(1 if KO else 0)
