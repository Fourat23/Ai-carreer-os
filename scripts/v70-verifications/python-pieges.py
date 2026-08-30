"""
V70 — vérification exécutée des affirmations publiées dans
curriculum/lessons/python-foundations.md (exemple guidé).

Quatre comportements de Python que personne ne devine, tous exécutés :
  1. l'argument par défaut mutable, partagé entre les appels
  2. la copie superficielle d'une structure imbriquée
  3. la variable de boucle capturée par une fonction
  4. la comparaison d'identité sur les petits entiers

Aucune dépendance : Python standard.
Exécution : python3 scripts/v70-verifications/python-pieges.py
"""

print("=== 1. argument par défaut mutable ===")

def ajouter(element, panier=[]):          # ⚠️ le piège
    panier.append(element)
    return panier

print("  ajouter('pomme')  ->", ajouter("pomme"))
print("  ajouter('poire')  ->", ajouter("poire"))
print("  ajouter('cerise') ->", ajouter("cerise"))
print("  id de la liste par défaut :", id(ajouter.__defaults__[0]))

def ajouter_ok(element, panier=None):
    if panier is None:
        panier = []
    panier.append(element)
    return panier

print("  version corrigée :", ajouter_ok("pomme"), ajouter_ok("poire"))

print("\n=== 2. copie superficielle ===")
import copy
original = {"nom": "Lyon", "tags": ["ville", "rhone"]}
superficielle = original.copy()
profonde = copy.deepcopy(original)
superficielle["tags"].append("MODIFIÉ")
print("  original après modification de la COPIE :", original)
print("  la copie profonde, elle :", profonde)
print("  original['tags'] is superficielle['tags'] :", original["tags"] is superficielle["tags"])

print("\n=== 3. variable de boucle capturée ===")
fonctions = [lambda: i for i in range(3)]
print("  [f() for f in fonctions] ->", [f() for f in fonctions])
fonctions_ok = [lambda i=i: i for i in range(3)]
print("  version corrigée            ->", [f() for f in fonctions_ok])

print("\n=== 4. == et is : la différence, mesurée ===")
# On construit les entiers À L'EXÉCUTION : sinon le compilateur replie les
# deux littéraux en une seule constante et la démonstration est faussée.
a = int("257")
b = int("257")
petit_a = int("256")
petit_b = int("256")
print(f"  int('257') is int('257') -> {a is b}      ← deux objets distincts")
print(f"  int('257') == int('257') -> {a == b}      ← la valeur, elle, est égale")
print(f"  int('256') is int('256') -> {petit_a is petit_b}      ← CPython met en cache -5..256")
print()
print("  Règle : == compare la VALEUR, is compare l'IDENTITÉ (le même objet).")
print("  is ne s'utilise que pour None, True, False — jamais pour des nombres")
print("  ni des chaînes, dont le comportement dépend d'optimisations internes.")
