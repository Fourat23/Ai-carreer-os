import numpy as np
# Depistage : maladie a 1 % de prevalence, 100 000 personnes.
N, prev = 100_000, 0.01
malades, sains = int(N*prev), int(N*(1-prev))
print(f"{N:,} personnes, prevalence {prev:.0%} -> {malades:,} malades, {sains:,} sains\n".replace(',', ' '))

def table(nom, sens, spec):
    VP = round(malades*sens); FN = malades-VP
    VN = round(sains*spec);   FP = sains-VN
    prec = VP/(VP+FP) if VP+FP else 0
    print(f"{nom}")
    print(f"   sensibilite (rappel) {sens:.0%} | specificite {spec:.0%}")
    print(f"   vrais positifs {VP:>6}   faux negatifs {FN:>6}  (malades rates)")
    print(f"   faux positifs  {FP:>6}   vrais negatifs {VN:>6}")
    print(f"   justesse (accuracy) = {(VP+VN)/N:.3f}")
    print(f"   PRECISION = si le test dit positif, probabilite d etre malade = {prec:.1%}")
    print(f"   -> {VP+FP} personnes convoquees pour {VP} malades trouves\n")

table("A) le modele qui ne fait rien : predit toujours 'sain'", 0.00, 1.00)
table("B) seuil haut : on veut etre sur", 0.50, 0.99)
table("C) seuil bas : on privilegie le rappel (recommandation de la lecon)", 0.95, 0.90)
table("D) seuil tres bas", 0.99, 0.50)

print("Le meme test C, sur une population a forte prevalence (20 %) :")
malades, sains = int(N*0.20), int(N*0.80)
table("C') sensibilite 95 %, specificite 90 %, prevalence 20 %", 0.95, 0.90)
