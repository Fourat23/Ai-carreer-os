import pandas as pd, numpy as np
df = pd.DataFrame({
    "date":    ["2024-03-05","2024-03-17","2024-1-9","2024-04-02","05/04/2024","2024-04-11",""],
    "montant": ["120.50","89",None,"210.00","45,90","1 300","75"],
    "client":  ["Dupont","dupont ","Martin","MARTIN","Nkolo","Nkolo","Sow"],
})
print("Donnees brutes telles qu'un export les fournit :"); print(df.to_string(index=False))

print("\n1) Le piege silencieux : montant est du TEXTE")
print("   dtype :", df.montant.dtype, "| somme naive :", repr(df.montant.dropna().sum())[:60])

m = pd.to_numeric(df.montant, errors="coerce")
print("\n2) to_numeric(errors='coerce') :")
print("   ", m.tolist())
print(f"   -> {m.isna().sum()} valeurs perdues sur {len(m)} : les formats francais '45,90' et '1 300'")

m2 = pd.to_numeric(df.montant.str.replace(" ", "", regex=False).str.replace(",", ".", regex=False), errors="coerce")
print("\n3) apres nettoyage du format :")
print("   ", m2.tolist(), f"-> {m2.isna().sum()} valeur(s) manquante(s) restante(s)")
print(f"   somme : {m2.sum():.2f}  (contre {m.sum():.2f} sans nettoyage : ecart de {m2.sum()-m.sum():.2f})")

print("\n4) Les dates :")
d = pd.to_datetime(df.date, errors="coerce", format="mixed")
print("   ", [str(x)[:10] for x in d.tolist()])
print(f"   -> {d.isna().sum()} date(s) non interpretee(s)")

print("\n5) Les clients : combien de clients distincts ?")
print("   brut         :", df.client.nunique(), "->", sorted(df.client.unique()))
norm = df.client.str.strip().str.lower()
print("   apres strip+lower :", norm.nunique(), "->", sorted(norm.unique()))
