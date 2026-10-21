"""
Script de test complet pour valider tous les endpoints de l'API FastAPI et du Graphe LangGraph.
Exécutez : python test_api.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configuration de l'encodage UTF-8 pour Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("🧪 DÉBUT DU TEST DU BACKEND LANGGRAPH PASSEPORT PME")
    print("=" * 60)

    # 1. Test /api/health
    print("\n1. Test GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Erreur health: {res.text}"
    health_data = res.json()
    print(f"   ✅ Santé API : {health_data['status']} | Mode : {health_data['mode']}")

    # 2. Test /api/extract
    print("\n2. Test POST /api/extract (Wave)...")
    res = client.post("/api/extract", json={"doc_type": "wave_statement", "operator": "WAVE"})
    assert res.status_code == 200, f"Erreur extract: {res.text}"
    extract_data = res.json()["data"]
    print(f"   ✅ CA extrait : {extract_data['monthlyRevenue']:,} FCFA / mois ({extract_data['transactionsCount']} tx)")

    # 3. Test /api/chat - Étape 1 : Source A (Wave)
    user_id = "test_merchant_42"
    print(f"\n3. Test POST /api/chat - Étape 1 (Source A pour {user_id})...")
    res = client.post("/api/chat", json={
        "user_id": user_id,
        "message": "Bonjour, je transmets mon relevé Wave.",
        "operator": "WAVE",
        "step_hint": 1
    })
    assert res.status_code == 200, f"Erreur chat step 1: {res.text}"
    step1 = res.json()
    print(f"   ✅ Étape : {step1['step_name']} (N° {step1['step_number']})")
    print(f"   ✅ Réponse : {step1['response'][:100]}...")

    # 4. Test /api/chat - Étape 2 : Source B (Carnet Cash)
    print(f"\n4. Test POST /api/chat - Étape 2 (Source B)...")
    res = client.post("/api/chat", json={
        "user_id": user_id,
        "message": "Voici mon carnet de caisse.",
        "operator": "WAVE",
        "step_hint": 2
    })
    assert res.status_code == 200, f"Erreur chat step 2: {res.text}"
    step2 = res.json()
    print(f"   ✅ Étape : {step2['step_name']} (N° {step2['step_number']})")
    print(f"   ✅ Achats enregistrés : {step2['state']['purchases_goods']:,} FCFA")

    # 5. Test /api/chat - Étape 3 : Source C (NINEA / RCCM)
    print(f"\n5. Test POST /api/chat - Étape 3 (Source C)...")
    res = client.post("/api/chat", json={
        "user_id": user_id,
        "message": "Voici mon NINEA et RCCM.",
        "operator": "WAVE",
        "step_hint": 3
    })
    assert res.status_code == 200, f"Erreur chat step 3: {res.text}"
    step3 = res.json()
    print(f"   ✅ Étape : {step3['step_name']} (N° {step3['step_number']})")
    print(f"   ✅ Entreprise : {step3['state']['company_name']} (NINEA: {step3['state']['ninea_number']})")

    # 6. Test /api/chat - Étape 4 : Restitution Bilan SYSCOHADA SMT & DSCR
    print(f"\n6. Test POST /api/chat - Étape 4 (Bilan SMT & DSCR)...")
    res = client.post("/api/chat", json={
        "user_id": user_id,
        "message": "Générer mon bilan comptable certifié.",
        "operator": "WAVE",
        "step_hint": 4
    })
    assert res.status_code == 200, f"Erreur chat step 4: {res.text}"
    step4 = res.json()
    metrics = step4['state']['bilan_metrics']
    print(f"   ✅ Étape finale : {step4['step_name']} (N° {step4['step_number']})")
    print(f"   ✅ Ratio DSCR : {step4['state']['dscr_score']}")
    print(f"   ✅ Éligibilité Crédit : {step4['state']['eligible']}")
    print(f"   ✅ Score PME : {metrics['score_credit']}")
    print(f"   ✅ CA Annuel certifié : {metrics['ca_annuel']:,} FCFA")
    print(f"   ✅ Résultat Net Annuel : {metrics['resultat_net_annuel']:,} FCFA")
    print(f"   ✅ Total Actif / Passif : {metrics['total_actif']:,} FCFA")

    # 7. Test /api/state/{user_id}
    print(f"\n7. Test GET /api/state/{user_id}...")
    res = client.get(f"/api/state/{user_id}")
    assert res.status_code == 200
    state_vals = res.json()["values"]
    print(f"   ✅ État sauvegardé en mémoire pour {user_id} : step='{state_vals.get('step')}'")

    print("\n" + "=" * 60)
    print("🎉 TOUS LES TESTS LANGGRAPH & SYSCOHADA ONT RÉUSSI AVEC SUCCÈS !")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
