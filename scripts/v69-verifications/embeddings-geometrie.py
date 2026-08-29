import numpy as np
rng = np.random.default_rng(11)
cos = lambda a,b: float(a@b/(np.linalg.norm(a)*np.linalg.norm(b)))

print("Cosinus entre DEUX VECTEURS TIRES AU HASARD, selon la dimension :")
print("   dim      moyenne   ecart-type   |cos| depasse 0,30 dans")
for d in [2, 3, 10, 100, 768, 1536]:
    v = [cos(rng.normal(size=d), rng.normal(size=d)) for _ in range(4000)]
    v = np.array(v)
    print(f"   {d:>5}   {v.mean():+.4f}     {v.std():.4f}       {(abs(v)>0.30).mean()*100:6.2f} % des cas")

print("\n-> En grande dimension, deux vecteurs sans aucun rapport ont un cosinus proche de 0.")
print("   Un cosinus de 0,30 y est donc DEJA tres loin du hasard, alors qu'en dimension 2")
print("   il arrive presque une fois sur deux.")

print("\n--- Le classement change-t-il selon la mesure employee ? ---")
q = np.array([1.0, 0.0])
docs = {"A (meme direction, court)": np.array([2.0, 0.0]),
        "B (meme direction, long)":  np.array([9.0, 0.0]),
        "C (direction differente)":  np.array([1.4, 1.4])}
print(f"   {'document':<28} {'cosinus':>9} {'distance euclid.':>18}")
for n, v in docs.items():
    print(f"   {n:<28} {cos(q,v):>9.3f} {np.linalg.norm(q-v):>18.3f}")
print("   -> par cosinus : A et B ex aequo (1,000), C dernier.")
print("      par distance : A premier, C deuxieme, B DERNIER (il est loin, mais aligne).")
print("      La longueur du vecteur compte pour l'un, pas pour l'autre.")
