import numpy as np
np.set_printoptions(precision=3, suppress=True)
toks = ["Le", "chat", "dort"]
# 4 dimensions, valeurs choisies a la main pour que "dort" ressemble a "chat"
Q = np.array([[1,0,0,0],[0,1,0,0],[0,.9,.3,0]], float)   # ce que chaque token CHERCHE
K = np.array([[1,0,0,0],[0,1,0,0],[0,0,1,0]], float)     # ce que chaque token OFFRE
V = np.array([[.1,.0,.0,.0],[.0,.9,.1,.0],[.0,.1,.8,.0]], float)  # ce qu'il APPORTE
d = Q.shape[1]

scores = Q @ K.T / np.sqrt(d)
masque = np.triu(np.ones_like(scores), 1) * -1e9        # causal : on ne voit pas le futur
scores = scores + masque
e = np.exp(scores - scores.max(axis=1, keepdims=True))
poids = e / e.sum(axis=1, keepdims=True)

print("Poids d'attention (chaque ligne somme a 1) :")
print(f"{'':>8}" + "".join(f"{t:>9}" for t in toks))
for i, t in enumerate(toks):
    print(f"{t:>8}" + "".join(f"{poids[i][j]:>9.3f}" for j in range(3)))
print("\n-> 'dort' accorde", f"{poids[2][1]:.0%}", "de son attention a 'chat' et",
      f"{poids[2][2]:.0%}", "a lui-meme.")
print("-> 'Le' ne peut regarder que lui-meme (1.000) : le masque causal interdit le futur.")

sortie = poids @ V
print("\nVecteur de 'dort' AVANT attention :", V[2])
print("Vecteur de 'dort' APRES attention :", sortie[2])
print("-> il a absorbe une part de 'chat' : la composante 2 passe de",
      f"{V[2][1]:.2f} a {sortie[2][1]:.3f}.")
print("\nC'est tout le mecanisme : une moyenne ponderee, dont les poids sont calcules")
print("par produit scalaire puis softmax. Aucune etape n'est mysterieuse.")
