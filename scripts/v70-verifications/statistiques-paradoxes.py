#!/usr/bin/env python3
"""V70 — vérification exécutable pour la leçon `statistics-for-ml`.

Trois phénomènes que la leçon affirme, mesurés au lieu d'être racontés :

  1. le paradoxe de Simpson : un taux de succès qui s'inverse quand on agrège ;
  2. le retour à la moyenne : une « amélioration » produite par le seul hasard ;
  3. l'effet de la taille d'échantillon sur ce qu'on croit voir.

Aucune bibliothèque d'apprentissage automatique. numpy uniquement, graine fixe.
Les chiffres imprimés sont ceux cités dans la correction de la leçon.
"""

import numpy as np

RNG = np.random.default_rng(20260830)


def titre(t):
    print(f"\n== {t} ==")


# ---------------------------------------------------------------------------
titre("1. Paradoxe de Simpson — deux traitements, deux gravités")

# Effectifs choisis pour être réalistes : le traitement A est celui qu'on
# réserve aux cas graves, précisément parce qu'on le croit meilleur.
#            (succès, total)
donnees = {
    "A": {"bénins": (81, 87), "graves": (192, 263)},
    "B": {"bénins": (234, 270), "graves": (55, 80)},
}

for groupe in ("bénins", "graves"):
    a_s, a_t = donnees["A"][groupe]
    b_s, b_t = donnees["B"][groupe]
    print(f"   cas {groupe:8s} : A = {a_s:3d}/{a_t:3d} = {100*a_s/a_t:5.1f} %"
          f"   |   B = {b_s:3d}/{b_t:3d} = {100*b_s/b_t:5.1f} %"
          f"   -> {'A' if a_s/a_t > b_s/b_t else 'B'} gagne")

tot = {k: (sum(v[0] for v in d.values()), sum(v[1] for v in d.values()))
       for k, d in donnees.items()}
print()
for k, (s, t) in tot.items():
    print(f"   TOTAL {k}        : {s:3d}/{t:3d} = {100*s/t:5.1f} %")
gagnant = max(tot, key=lambda k: tot[k][0] / tot[k][1])
print(f"   -> agrégé, {gagnant} gagne. L'inversion est complète.")

print("\n   d'où vient l'inversion : la répartition des gravités")
for k, d in donnees.items():
    graves = d["graves"][1]
    total = sum(v[1] for v in d.values())
    print(f"     {k} : {graves:3d} cas graves sur {total:3d} = {100*graves/total:4.1f} %"
          f" de son effectif")
print("     le traitement A traite surtout des cas difficiles ; sa moyenne")
print("     globale porte la difficulté de ses patients, pas son efficacité.")


# ---------------------------------------------------------------------------
titre("2. Retour à la moyenne — une amélioration sans aucune cause")

# 1000 élèves. Leur note est PURE CHANCE : aucune compétence, aucun progrès.
n = 1000
epreuve1 = RNG.normal(50, 10, n)
epreuve2 = RNG.normal(50, 10, n)   # indépendante : rien ne relie les deux

print(f"   deux épreuves indépendantes, moyenne 50, écart-type 10, n = {n}")
print(f"   corrélation entre les deux épreuves : {np.corrcoef(epreuve1, epreuve2)[0,1]:+.3f}"
      "   (nulle, par construction)")

seuil = np.percentile(epreuve1, 10)
faibles = epreuve1 <= seuil
print(f"\n   on sélectionne les 10 % les plus faibles de l'épreuve 1"
      f" (note <= {seuil:.1f})")
print(f"   moyenne du groupe à l'épreuve 1 : {epreuve1[faibles].mean():5.2f}")
print(f"   moyenne du groupe à l'épreuve 2 : {epreuve2[faibles].mean():5.2f}")
print(f"   « progrès » apparent            : {epreuve2[faibles].mean() - epreuve1[faibles].mean():+5.2f} points")

forts = epreuve1 >= np.percentile(epreuve1, 90)
print(f"\n   et les 10 % les plus forts :")
print(f"   épreuve 1 : {epreuve1[forts].mean():5.2f}   épreuve 2 : {epreuve2[forts].mean():5.2f}"
      f"   « rechute » : {epreuve2[forts].mean() - epreuve1[forts].mean():+5.2f}")
print("   aucun soutien scolaire n'a eu lieu. Aucune démotivation non plus.")


# ---------------------------------------------------------------------------
titre("3. Taille d'échantillon — ce qu'on croit voir")

# Deux pièces STRICTEMENT identiques (p = 0.50). On mesure l'écart observé
# entre elles selon le nombre de lancers, sur 10 000 répétitions.
print("   deux processus rigoureusement identiques (p = 0,500 des deux côtés)")
print("   écart observé entre les deux taux, sur 10 000 répétitions :\n")
print("     n par groupe |  écart médian | écart dépassé 1 fois sur 20")
for taille in (20, 100, 1000, 10000):
    a = RNG.binomial(taille, 0.5, 10000) / taille
    b = RNG.binomial(taille, 0.5, 10000) / taille
    ecart = np.abs(a - b)
    print(f"     {taille:12d} | {100*np.median(ecart):11.2f} pts |"
          f" {100*np.percentile(ecart, 95):11.2f} pts")
print("\n   à n = 20, deux processus identiques affichent couramment 10 points")
print("   d'écart. Ce n'est pas un effet : c'est la largeur du bruit.")

print("\n== fin ==")
