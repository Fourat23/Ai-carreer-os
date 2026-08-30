# V70 — vérification exécutée pour neural-networks et transformers.
# ENVIRONNEMENT : numpy 2.4.6. Aucune bibliothèque d apprentissage profond n est
# utilisée : tout est écrit à la main, en une trentaine de lignes, pour que le
# mécanisme soit visible et non délégué.
import numpy as np
rng = np.random.default_rng(20260830)

print("== 1. Un réseau à une couche cachée, écrit et entraîné à la main ==")
# Problème du OU EXCLUSIF : non séparable linéairement. C est le plus petit
# problème qui EXIGE une couche cachée, donc la meilleure démonstration.
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)

def entrainer(activation, n_cache=4, pas=0.5, epoques=20000):
    W1 = rng.normal(0, 1, (2, n_cache)); b1 = np.zeros((1, n_cache))
    W2 = rng.normal(0, 1, (n_cache, 1)); b2 = np.zeros((1, 1))
    sig = lambda z: 1 / (1 + np.exp(-z))
    for e in range(epoques):
        z1 = X @ W1 + b1
        a1 = sig(z1) if activation == 'sigmoide' else np.maximum(0, z1)
        z2 = a1 @ W2 + b2
        a2 = sig(z2)
        # rétropropagation : la dérivée de l erreur remonte couche par couche
        d2 = (a2 - y) / len(X)
        dW2, db2 = a1.T @ d2, d2.sum(0, keepdims=True)
        da1 = d2 @ W2.T
        d1 = da1 * (a1 * (1 - a1) if activation == 'sigmoide' else (z1 > 0))
        dW1, db1 = X.T @ d1, d1.sum(0, keepdims=True)
        W2 -= pas * dW2; b2 -= pas * db2; W1 -= pas * dW1; b1 -= pas * db1
    z1 = X @ W1 + b1
    a1 = sig(z1) if activation == 'sigmoide' else np.maximum(0, z1)
    sortie = sig(a1 @ W2 + b2)
    erreur = float(np.mean((sortie - y) ** 2))
    # neurones « morts » : jamais actifs sur aucune entree (specifique a ReLU)
    morts = int((a1.max(0) <= 0).sum()) if activation == 'relu' else 0
    return sortie.ravel(), erreur, morts

# Sans couche cachée : régression logistique, donc séparation linéaire.
W = rng.normal(0, 1, (2, 1)); b = np.zeros((1, 1))
for e in range(20000):
    p = 1 / (1 + np.exp(-(X @ W + b)))
    d = (p - y) / len(X)
    W -= 0.5 * (X.T @ d); b -= 0.5 * d.sum(0, keepdims=True)
p = (1 / (1 + np.exp(-(X @ W + b)))).ravel()
print(f"   sans couche cachée (séparation linéaire) : {np.round(p, 3)}")
print(f"     erreur quadratique : {float(np.mean((p - y.ravel())**2)):.4f}"
      "   <- ne peut pas faire mieux, quel que soit l entraînement")
for act in ['sigmoide', 'relu']:
    s, err, morts = entrainer(act)
    sup = f"  ({morts}/4 neurones morts)" if act == 'relu' else ""
    print(f"   avec 4 neurones cachés, activation {act:9s} : {np.round(s, 3)}"
          f"  erreur {err:.6f}{sup}")
print("   attendu : [0, 1, 1, 0]")
print("")
print("   RESULTAT NEGATIF PUBLIE TEL QUEL. Avec cette graine, ReLU ECHOUE :")
print("   erreur 0,125 au lieu de 0,000001. Ce n est pas une erreur de code,")
print("   c est le probleme du NEURONE MORT. La derivee de ReLU vaut exactement")
print("   0 pour toute entree negative : un neurone dont les poids l ont amene")
print("   du mauvais cote ne recoit plus AUCUN gradient et ne peut plus jamais")
print("   revenir. Il est definitivement inutile. Sur seulement 4 neurones, en")
print("   perdre un ou deux suffit a rendre le probleme insoluble.")
print("   -> on ne corrige pas ce resultat en changeant la graine jusqu a ce")
print("      qu il passe. On le publie, parce qu il enseigne le compromis reel :")
print("      ReLU resout l evanouissement du gradient (section 2) et introduit")
print("      un autre defaut. Les remedes usuels sont une initialisation adaptee,")
print("      un pas plus petit, plus de neurones, ou une variante a pente non")
print("      nulle du cote negatif.")
n_essais, n_echecs = 20, 0
for g in range(n_essais):
    rng = np.random.default_rng(g)
    _, e, _ = entrainer('relu')
    if e > 0.01:
        n_echecs += 1
rng = np.random.default_rng(20260830)
print(f"   FREQUENCE MESUREE : sur {n_essais} initialisations differentes,")
print(f"   ReLU echoue {n_echecs} fois sur ce probleme a 4 neurones.")
print("   -> une couche cachée avec une activation NON LINÉAIRE suffit. Sans")
print("      la non-linéarité, empiler des couches ne sert à rien : une")
print("      composition de fonctions linéaires reste linéaire. Vérification :")
A = rng.normal(0, 1, (2, 8)); B = rng.normal(0, 1, (8, 3))
print(f"      rang de (A @ B) : {np.linalg.matrix_rank(A @ B)}"
      f" — deux couches linéaires équivalent à UNE matrice 2x3.")

print("\n== 2. Pourquoi les réseaux profonds ont longtemps échoué ==")
# Le gradient est un produit de dérivées, une par couche. On mesure son
# amplitude après N couches.
for n_couches in [1, 5, 10, 20, 50]:
    for nom, dmax in [('sigmoïde (dérivée <= 0,25)', 0.25), ('ReLU (dérivée = 1)', 1.0)]:
        g = dmax ** n_couches
        if nom.startswith('sigmoïde'):
            print(f"   {n_couches:2d} couches · {nom:26s} : gradient x{g:.3e}")
        else:
            print(f"   {' ':2s}           · {nom:26s} : gradient x{g:.3e}")
print("   -> avec une sigmoïde, le gradient est multiplié par au plus 0,25 à")
print("      chaque couche. Sur 20 couches : 9,1e-13. Les premières couches ne")
print("      reçoivent plus rien et n apprennent pas. C est le gradient qui")
print("      s évanouit, et c est un fait ARITHMÉTIQUE, pas une malchance.")
print("   -> ReLU garde une dérivée de 1 sur la partie active : le produit ne")
print("      s effondre pas. C est le changement qui a rendu la profondeur")
print("      praticable.")

print("\n== 3. L attention, calculée à la main — et ce qu elle ne fait pas seule ==")
mots = ['la', 'banque', 'de', 'la', 'riviere', 'etait', 'boueuse']
d = 8
E = rng.normal(0, 1, (len(mots), d))
Wq, Wk, Wv = rng.normal(0, 1, (d, d)), rng.normal(0, 1, (d, d)), rng.normal(0, 1, (d, d))
Q, K, V = E @ Wq, E @ Wk, E @ Wv
scores = Q @ K.T / np.sqrt(d)
poids = np.exp(scores - scores.max(1, keepdims=True))
poids /= poids.sum(1, keepdims=True)
i = mots.index('banque')
print(f"   projections NON ENTRAINEES, tirees au hasard.")
print(f"   a quoi « banque » prete-t-il attention ?")
for j in np.argsort(-poids[i])[:4]:
    print(f"     {mots[j]:10s} : {poids[i, j]*100:5.1f} %")
print(f"   somme des poids de la ligne : {poids[i].sum():.6f}"
      "   <- une distribution de probabilite")
print("")
print("   CE RESULTAT EST ARBITRAIRE, ET C EST LE POINT. Le mot le plus")
print("   attendu semantiquement (« riviere », qui desambiguise « banque »)")
print("   n arrive PAS en tete. Il serait facile de truquer les representations")
print("   jusqu a obtenir le resultat qui illustre bien ; ce serait mentir sur")
print("   ce que le calcul demontre.")
print("   -> ce que ce script demontre reellement : le MECANISME. Chaque mot")
print("      calcule un score avec chaque autre, les scores deviennent une")
print("      distribution de probabilite (somme = 1), et la sortie est un")
print("      melange pondere des valeurs. C est de l algebre lineaire, et elle")
print("      est entierement verifiable ici.")
print("   -> ce que ce script ne demontre PAS : que les poids ont un sens. Le")
print("      sens vient ENTIEREMENT des matrices Wq, Wk et Wv, qui sont ici")
print("      aleatoires et qui, dans un vrai modele, sont apprises sur des")
print("      milliards de mots. L architecture ne comprend rien : elle offre")
print("      une forme de calcul ou la comprehension PEUT etre apprise.")
verif = poids @ V
print(f"   sortie pour « banque » : melange pondere de {len(mots)} vecteurs,")
print(f"   dimension {verif.shape[1]} — identique a celle de l entree, ce qui")
print("   permet d empiler les couches.")

print("\n== 4. Le coût quadratique de l attention, chiffré ==")
print("   longueur | paires calculées | multiplication par rapport à 512")
base = 512 ** 2
for n in [512, 1024, 2048, 8192, 32768, 131072]:
    print(f"   {n:8d} | {n*n:16,d} | x{n*n/base:,.0f}".replace(',', ' '))
print("   -> doubler la longueur QUADRUPLE le calcul. C est pourquoi la")
print("      longueur de contexte est une contrainte d ingénierie et non un")
print("      simple réglage, et pourquoi tant de travaux cherchent une")
print("      attention de coût inférieur.")

print("\n== 5. Pourquoi diviser par la racine de la dimension ==")
for d_essai in [8, 64, 512]:
    q = rng.normal(0, 1, (2000, d_essai)); k = rng.normal(0, 1, (2000, d_essai))
    brut = (q * k).sum(1)
    print(f"   dimension {d_essai:4d} : écart-type des scores bruts "
          f"{brut.std():6.2f}, après division {(brut/np.sqrt(d_essai)).std():5.2f}")
print("   -> sans la division, l écart-type croît comme la racine de la")
print("      dimension. Des scores très étalés rendent la fonction softmax")
print("      quasi binaire : un mot capte presque tout le poids, et le gradient")
print("      disparaît. La division n est pas cosmétique : elle maintient les")
print("      scores dans la zone où la softmax reste dérivable utilement.")
