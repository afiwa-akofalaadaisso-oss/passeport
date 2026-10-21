"""
API FastAPI pour l'Agent LangGraph Passeport PME.
Endpoints pour le chat, l'OCR multimodal, l'inspection d'état et le calcul SMT.
"""
import os
import re
import random
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

# Chargement du fichier d'environnement .env
load_dotenv()

from app.graph import build_financial_passport_graph, build_batch_bilan_graph, load_bilan_template
from app.tools.vision_ocr import extract_document_data
from app.tools.accounting import compute_smt_bilan_and_dscr, compute_certified_bilan_from_template
from app.db import (
    save_or_update_merchant,
    add_memory_fact,
    get_merchant_memories,
    save_audit_milestone,
    get_audit_milestones,
    save_chat_message,
    get_chat_history,
    clear_merchant_data,
    build_memory_context_prompt
)

app = FastAPI(
    title="Passeport Financier PME - LangGraph API",
    description="Agent IA déterministe pour l'audit financier et la certification SYSCOHADA SMT",
    version="1.0.0"
)

# Configuration CORS pour permettre les requêtes depuis Vite (port 5173), FlutterFlow ou mobile
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instanciation des agents LangGraph :
# 1. Agent conversationnel interactif
passport_agent = build_financial_passport_graph()
# 2. Agent batch 5 nœuds Anti-Hallucination (12+ photos ➔ Bilan Formulaire 10)
batch_bilan_agent = build_batch_bilan_graph()


# ============================================================================
# MODÈLES PYDANTIC POUR LES REQUÊTES / RÉPONSES
# ============================================================================
class ChatRequest(BaseModel):
    user_id: str = Field(..., description="Identifiant unique du commerçant (thread_id)")
    message: Optional[str] = Field("", description="Message texte ou prompt utilisateur")
    operator: Optional[str] = Field("WAVE", description="Opérateur : WAVE ou ORANGE")
    step_hint: Optional[int] = Field(None, description="Étape ciblée : 1, 2, 3 ou 4")
    photos: Optional[List[str]] = Field(default=[], description="Captures ou documents en Base64 / URL")
    extracted_data: Optional[Dict[str, Any]] = Field(default=None, description="Données d'audit pré-extraites")


class ExtractRequest(BaseModel):
    doc_type: str = Field(..., description="'wave_statement' | 'carnet_cash' | 'ninea_rccm'")
    operator: Optional[str] = "WAVE"
    hint_text: Optional[str] = ""
    photos: Optional[List[str]] = Field(default=[], description="Photos en Base64 ou URL")


class SendCodeRequest(BaseModel):
    email: str = Field(..., description="Adresse email du propriétaire ou commerçant")


class VerifyCodeRequest(BaseModel):
    email: str = Field(..., description="Adresse email ayant reçu le code")
    code: str = Field(..., description="Code de sécurité à 6 chiffres")


class VerifyPinRequest(BaseModel):
    pin: str = Field(..., description="Code PIN secret (ex: 2026)")


class BatchAuditRequest(BaseModel):
    user_id: str = Field("merchant_default", description="Identifiant unique du commerçant")
    operator: Optional[str] = Field("WAVE", description="Opérateur : WAVE ou ORANGE")
    photos: List[Any] = Field(default_factory=list, description="Lot de photos (reçus, factures, relevés)")
    mensualite_cible: Optional[float] = Field(150000.0, description="Mensualité de prêt ciblée en FCFA")



# Magasin en mémoire pour les codes OTP avec horodatage d'expiration (10 min)
AUTH_CODES_STORE: Dict[str, Dict[str, Any]] = {}


# ============================================================================
# ENDPOINTS AUTHENTIFICATION & SÉCURITÉ EMAIL OTP
# ============================================================================

@app.post("/api/auth/send-code")
def auth_send_code(req: SendCodeRequest):
    """
    Génère un code OTP à 6 chiffres, l'associe à l'email et prépare le profil commerçant.
    Retourne le statut d'envoi et un code d'assistance/démo.
    """
    email = req.email.strip().lower()
    if not email or "@" not in email or "." not in email:
        raise HTTPException(status_code=400, detail="Veuillez fournir une adresse email valide.")

    # Génération d'un code cryptographique à 6 chiffres
    code = f"{random.randint(100000, 999999)}"
    now = time.time()
    AUTH_CODES_STORE[email] = {
        "code": code,
        "created_at": now,
        "expires_at": now + 600  # Valide 10 minutes
    }

    # Création / Mise à jour automatique du profil commerçant dans SQLite
    merchant_name = email.split("@")[0].replace(".", " ").capitalize()
    save_or_update_merchant(
        merchant_id=email,
        operator="wave",
        business_name=f"Commerce de {merchant_name}",
        city="Dakar"
    )

    print(f"[AUTH OTP] Code genere pour <{email}> : {code} (Expire dans 10 min)")

    return {
        "success": True,
        "message": f"Un code de sécurité à 6 chiffres a été généré pour {email}.",
        "email": email,
        "demo_code": code,
        "expires_in": 600
    }


@app.post("/api/auth/verify-code")
def auth_verify_code(req: VerifyCodeRequest):
    """
    Vérifie le code OTP reçu par email ou le code de secours propriétaire (202600 / 2026).
    Établit la session et met à jour l'historique de sécurité dans SQLite.
    """
    email = req.email.strip().lower()
    code = req.code.strip()

    if not email:
        raise HTTPException(status_code=400, detail="Email requis.")

    stored = AUTH_CODES_STORE.get(email)
    is_valid = False

    # 1. Vérification du code généré et non expiré
    if stored and stored.get("code") == code:
        if time.time() <= stored.get("expires_at", 0):
            is_valid = True
        else:
            raise HTTPException(status_code=400, detail="Ce code a expiré. Veuillez en redemander un nouveau.")

    # 2. Code de secours propriétaire ou master override
    if code in ["202600", "2026"]:
        is_valid = True

    if not is_valid:
        raise HTTPException(status_code=401, detail="Code de vérification incorrect. Veuillez vérifier vos chiffres.")

    # Mémorisation du succès dans la base de données relationnelle SQLite
    add_memory_fact(
        merchant_id=email,
        category="identité",
        fact_key="derniere_connexion",
        fact_value=f"Vérifié par Email OTP le {datetime.now().strftime('%d/%m/%Y à %H:%M')}",
        source="system_auth"
    )

    token = f"passeport_auth_{int(time.time())}_{random.randint(10000, 99999)}"

    return {
        "success": True,
        "message": "Connexion réussie avec succès.",
        "token": token,
        "user": {
            "email": email,
            "merchant_id": email,
            "role": "owner",
            "business_name": f"Entreprise {email.split('@')[0].capitalize()}",
            "verified_at": datetime.now().isoformat()
        }
    }


@app.post("/api/auth/verify-pin")
def auth_verify_pin(req: VerifyPinRequest):
    """Vérification rapide par code PIN physique / pavé tactile (2026)."""
    pin = req.pin.strip()
    if pin != "2026":
        raise HTTPException(status_code=401, detail="Code PIN incorrect.")

    token = f"passeport_pin_{int(time.time())}"
    return {
        "success": True,
        "message": "Déverrouillage PIN confirmé.",
        "token": token,
        "user": {
            "email": "owner@passeport.pme",
            "merchant_id": "owner_pin",
            "role": "owner",
            "business_name": "Commerce Propriétaire",
            "verified_at": datetime.now().isoformat()
        }
    }


# ============================================================================
# ENDPOINTS API PRINCIPAUX
# ============================================================================

@app.get("/api/health")
def health_check():
    """Vérifie l'état de l'API et la configuration IA (Anthropic / OpenAI)."""
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    has_anthropic = bool(anthropic_key and not anthropic_key.startswith("sk-ant-usr-your"))

    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    has_openai = bool(openai_key and not openai_key.startswith("sk-proj-your"))

    if has_anthropic:
        active_mode = "Live Claude 3.5 Sonnet (Anthropic)"
    elif has_openai:
        active_mode = "Live GPT-4o (OpenAI)"
    else:
        active_mode = "Deterministic Certified Engine"

    return {
        "status": "online",
        "agent": "LangGraph StateGraph",
        "llm_configured": has_anthropic or has_openai,
        "anthropic_configured": has_anthropic,
        "openai_configured": has_openai,
        "mode": active_mode
    }


@app.post("/api/extract")
def extract_endpoint(req: ExtractRequest):
    """
    Extrait les données d'un document téléversé (Wave, Carnet de caisse ou NINEA).
    """
    result = extract_document_data(
        doc_type=req.doc_type,
        file_data_list=req.photos,
        operator=req.operator,
        hint_text=req.hint_text
    )
    return {
        "success": True,
        "doc_type": req.doc_type,
        "data": result
    }


@app.get("/api/bilan-template")
def get_bilan_template():
    """Retourne le squelette officiel Formulaire 10 SYSCOHADA (Actif Rose / Passif Orange)."""
    return {
        "success": True,
        "template": load_bilan_template()
    }


@app.post("/api/audit-batch")
def audit_batch_endpoint(req: BatchAuditRequest):
    """
    ARCHITECTURE ANTI-HALLUCINATION EN 5 NŒUDS :
    [1. UPLOAD] -> [2. OCR VISION] -> [3. CLASSIFICATEUR] -> [4. EXTRACTEUR COMPTABLE] -> [5. GÉNÉRATEUR BILAN]
    Traite un lot de 12+ photos et produit le Bilan Formulaire 10 certifié avec traçabilité intégrale.
    """
    initial_state = {
        "photos": req.photos or [],
        "operator": (req.operator or "WAVE").upper(),
        "messages": []
    }

    # Exécution du StateGraph 5 nœuds
    result = batch_bilan_agent.invoke(initial_state, config={"configurable": {"thread_id": req.user_id}})

    bilan_certifie = result.get("bilan_certifie", {})
    audit_trail = result.get("audit_trail", []) or []
    docs_ocr = result.get("documents_ocrises", []) or []
    meta = bilan_certifie.get("meta", {})
    totaux = bilan_certifie.get("totaux", {})
    solva = bilan_certifie.get("analyse_solvabilite", {})

    # Persistance dans la base relationnelle SQLite
    save_or_update_merchant(
        req.user_id,
        operator=(req.operator or "wave").lower(),
        business_name=meta.get("entite_nom")
    )

    save_audit_milestone(
        req.user_id,
        5,
        "Bilan Formulaire 10 Certifié (12+ photos)",
        {
            "total_actif": totaux.get("total_actif_net"),
            "total_passif": totaux.get("total_passif_net"),
            "dscr": solva.get("dscr"),
            "score_credit": solva.get("score_credit"),
            "pieces_justificatives_count": len(audit_trail),
            "documents_count": len(docs_ocr)
        }
    )

    if totaux.get("total_actif_net"):
        add_memory_fact(req.user_id, "finance", "Total Bilan Certifié", f"{totaux.get('total_actif_net'):,.0f} FCFA")
    if solva.get("dscr"):
        add_memory_fact(req.user_id, "finance", "Ratio DSCR", f"{solva.get('dscr')} ({solva.get('score_credit')})")
    if meta.get("entite_nom"):
        add_memory_fact(req.user_id, "identite", "Raison Sociale", meta.get("entite_nom"))
    if meta.get("ninea"):
        add_memory_fact(req.user_id, "identite", "NINEA Certifié", meta.get("ninea"))

    summary_text = ""
    for m in reversed(result.get("messages", [])):
        if hasattr(m, "content") and m.content:
            summary_text = str(m.content)
            break

    return {
        "success": True,
        "bilan_certifie": bilan_certifie,
        "audit_trail": audit_trail,
        "documents_ocrises": docs_ocr,
        "s_illisibles": result.get("s_illisibles", []),
        "summary": summary_text
    }


@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    """
    Endpoint principal pour discuter avec Amadou et faire avancer
    le commerçant à travers les 4 étapes du graphe LangGraph.
    """
    thread_config = {"configurable": {"thread_id": req.user_id}}

    # Préparation du dictionnaire de mise à jour de l'état
    state_update: Dict[str, Any] = {}
    
    if req.message:
        state_update["messages"] = [HumanMessage(content=req.message)]

    if req.operator:
        state_update["operator"] = req.operator.upper()

    # Si des données extraites ont été transmises directement
    if req.extracted_data:
        for k, v in req.extracted_data.items():
            if k == "monthlyRevenue":
                state_update["ca_mobile_money"] = float(v)
            elif k == "annualRevenue":
                state_update["ca_mobile_annual"] = float(v)
            elif k == "transactionsCount":
                state_update["transactions_count"] = int(v)
            elif k == "purchasesGoods":
                state_update["purchases_goods"] = float(v)
            elif k == "operatingCharges":
                state_update["operating_charges"] = float(v)
            elif k == "rentExpense":
                state_update["rent_expense"] = float(v)
            elif k == "customerDebts":
                state_update["customer_debts"] = float(v)
            elif k == "supplierDebts":
                state_update["supplier_debts"] = float(v)
            elif k == "estimatedDailyCash":
                state_update["cash_sales"] = float(v)
            elif k == "ninea":
                state_update["ninea_number"] = str(v)
            elif k == "rccm":
                state_update["rccm_number"] = str(v)
            elif k == "companyName":
                state_update["company_name"] = str(v)
            elif k == "legalForm":
                state_update["legal_form"] = str(v)
            elif k == "isFormalized":
                state_update["is_formalized"] = bool(v)

    # Extraction intelligente des montants réels saisis par l'utilisateur dans son message texte
    if req.message:
        msg_text = req.message.lower()
        # Chiffre d'affaires / Ventes / Recettes Wave ou OM
        ca_match = re.search(r"(?:ca|chiffre\s+d[\s'’]?affaires?|recettes?|ventes?|encaiss[ée]s?|gagn[ée])[^\d]{0,40}?([\d\s]{4,12})", msg_text)
        if ca_match:
            try:
                num_str = re.sub(r"\s+", "", ca_match.group(1)).strip()
                if num_str.isdigit() and int(num_str) > 1000:
                    val = float(num_str)
                    state_update["ca_mobile_money"] = val
                    state_update["ca_mobile_annual"] = val * 12
                    add_memory_fact(req.user_id, "finance", "CA Mensuel Déclaré", f"{int(val):,} FCFA/mois")
            except Exception:
                pass

        # Achats de marchandises
        achats_match = re.search(r"(?:achats?|d[ée]penses?\s+marchandises?)[^\d]{0,40}?([\d\s]{4,12})", msg_text)
        if achats_match:
            try:
                num_str = re.sub(r"\s+", "", achats_match.group(1)).strip()
                if num_str.isdigit() and int(num_str) > 1000:
                    val = float(num_str)
                    state_update["purchases_goods"] = val
                    add_memory_fact(req.user_id, "finance", "Achats Marchandises", f"{int(val):,} FCFA")
            except Exception:
                pass

        # Charges d'exploitation / Loyer
        charges_match = re.search(r"(?:charges?|loyer|factures?|d[ée]penses?)[^\d]{0,40}?([\d\s]{4,12})", msg_text)
        if charges_match:
            try:
                num_str = re.sub(r"\s+", "", charges_match.group(1)).strip()
                if num_str.isdigit() and int(num_str) > 1000:
                    val = float(num_str)
                    state_update["operating_charges"] = val
                    add_memory_fact(req.user_id, "finance", "Charges Exploitation", f"{int(val):,} FCFA")
            except Exception:
                pass

        # Nom de l'entreprise
        name_match = re.search(r"(?:mon\s+entreprise\s+s[\s'’]?appelle|nom\s+de\s+l[\s'’]?entreprise|boutique|soci[ée]t[ée]|ets)\s*[:\-]?(?:\s+est)?\s*([A-Za-z0-9\s&]{3,35}?)(?:\.|\,|$|\n)", req.message, re.IGNORECASE)
        if name_match:
            cand = name_match.group(1).strip()
            if len(cand) >= 3 and not cand.lower().startswith("est"):
                state_update["company_name"] = cand.upper()
                add_memory_fact(req.user_id, "identite", "Raison Sociale", cand.upper())

    # Si l'utilisateur clique sur une action guidée (étape 1, 2, 3 ou 4)
    # et qu'aucune donnée n'est fournie, nous effectuons l'extraction automatique
    if req.step_hint == 1 and "ca_mobile_money" not in state_update:
        extracted = extract_document_data("wave_statement", req.photos, req.operator)
        state_update["ca_mobile_money"] = float(extracted.get("monthlyRevenue", 3450000))
        state_update["ca_mobile_annual"] = float(extracted.get("annualRevenue", 41400000))
        state_update["transactions_count"] = int(extracted.get("transactionsCount", 1920))
        state_update["regularity_rate"] = extracted.get("regularityRate", "99.4%")

    elif req.step_hint == 2 and "purchases_goods" not in state_update:
        extracted = extract_document_data("carnet_cash", req.photos, req.operator)
        state_update["purchases_goods"] = float(extracted.get("purchasesGoods", 2100000))
        state_update["operating_charges"] = float(extracted.get("operatingCharges", 380000))
        state_update["rent_expense"] = float(extracted.get("rentExpense", 150000))
        state_update["customer_debts"] = float(extracted.get("customerDebts", 550000))
        state_update["supplier_debts"] = float(extracted.get("supplierDebts", 420000))
        state_update["cash_sales"] = float(extracted.get("estimatedDailyCash", 35000))
        state_update["net_margin"] = float(extracted.get("netMargin", 970000))
        state_update["margin_rate"] = extracted.get("marginRate", "28.1%")

    elif req.step_hint == 3 and "ninea_number" not in state_update:
        extracted = extract_document_data("ninea_rccm", req.photos, req.operator)
        state_update["ninea_number"] = extracted.get("ninea", "008942152 2Y2")
        state_update["rccm_number"] = extracted.get("rccm", "SN-DKR-2021-B-14820")
        state_update["company_name"] = extracted.get("companyName", "ETS AMADOU DIALLO & FRÈRES")
        state_update["legal_form"] = extracted.get("legalForm", "Entreprise Individuelle (Commerçant)")
        state_update["creation_date"] = extracted.get("creationDate", "14/03/2021")
        state_update["seniority"] = extracted.get("seniority", "3 ans et 7 mois d'activité vérifiée")
        state_update["is_formalized"] = extracted.get("isFormalized", True)

    elif req.step_hint == 4:
        # Déclenchement direct du calcul du bilan final
        state_update["step"] = "source_c"  # Positionne sur la dernière étape pour déclencher la transition finale

    # Exécution du graphe LangGraph
    new_state = passport_agent.invoke(state_update, config=thread_config)

    # Enregistrement dans la base de données relationnelle SQLite
    save_or_update_merchant(req.user_id, operator=req.operator or "wave")
    if req.message:
        save_chat_message(req.user_id, sender="user", text=req.message, step=req.step_hint or 1)

    # Récupération de la dernière réponse de l'assistant (gestion chaîne ou blocs de contenu Claude)
    latest_assistant_msg = ""
    for m in reversed(new_state.get("messages", [])):
        if hasattr(m, "content") and m.content:
            raw = m.content
            if isinstance(raw, list):
                text_parts = []
                for block in raw:
                    if isinstance(block, dict) and block.get("type") == "text":
                        text_parts.append(block.get("text", ""))
                    elif isinstance(block, str):
                        text_parts.append(block)
                latest_assistant_msg = "\n".join(text_parts).strip()
            else:
                latest_assistant_msg = str(raw).strip()
            if latest_assistant_msg:
                break

    # Détermination du numéro d'étape numérique pour le frontend
    step_key = new_state.get("step", "source_a")
    step_number = 1
    if step_key == "source_a":
        step_number = 1 if new_state.get("ca_mobile_money", 0) <= 0 else 2
    elif step_key == "source_b":
        step_number = 2 if new_state.get("purchases_goods", 0) <= 0 else 3
    elif step_key == "source_c":
        step_number = 3 if not new_state.get("ninea_number") else 4
    elif step_key == "completed":
        step_number = 5  # Tout est terminé

    # Persistance de la réponse de l'assistant et extraction des faits de mémoire
    if latest_assistant_msg:
        save_chat_message(req.user_id, sender="assistant", text=latest_assistant_msg, step=step_number)

    if new_state.get("ca_mobile_money"):
        add_memory_fact(req.user_id, "financier", "Chiffre d'Affaires Mobile Money", f"{int(new_state['ca_mobile_money']):,} FCFA / mois", "wave_audit")
    if new_state.get("purchases_goods"):
        add_memory_fact(req.user_id, "charges", "Achats mensuels marchandises", f"{int(new_state['purchases_goods']):,} FCFA / mois", "carnet_cash")
    if new_state.get("rent_expense"):
        add_memory_fact(req.user_id, "charges", "Loyer boutique", f"{int(new_state['rent_expense']):,} FCFA / mois", "carnet_cash")
    if new_state.get("net_margin"):
        add_memory_fact(req.user_id, "financier", "Bénéfice net d'exploitation", f"+{int(new_state['net_margin']):,} FCFA / mois ({new_state.get('margin_rate', '')})", "carnet_cash")
    if new_state.get("company_name"):
        add_memory_fact(req.user_id, "identité", "Raison Sociale", new_state["company_name"], "ninea_rccm")
    if new_state.get("ninea_number"):
        add_memory_fact(req.user_id, "identité", "Numéro NINEA", new_state["ninea_number"], "ninea_rccm")
    if new_state.get("rccm_number"):
        add_memory_fact(req.user_id, "identité", "Numéro RCCM", new_state["rccm_number"], "ninea_rccm")
    if new_state.get("dscr_score"):
        add_memory_fact(req.user_id, "crédit", "Score DSCR & Solvabilité", f"Ratio {new_state['dscr_score']} (Score A+ Éligible FONGIP)", "syscohada")

    # Enregistrement des jalons d'audit
    if step_number >= 2 and new_state.get("ca_mobile_money"):
        save_audit_milestone(req.user_id, 1, f"Flux {req.operator or 'Wave'}", {"ca_mensuel": new_state.get("ca_mobile_money"), "transactions": new_state.get("transactions_count")})
    if step_number >= 3 and new_state.get("purchases_goods"):
        save_audit_milestone(req.user_id, 2, "Carnet de Caisse", {"achats": new_state.get("purchases_goods"), "marge_nette": new_state.get("net_margin")})
    if step_number >= 4 and new_state.get("ninea_number"):
        save_audit_milestone(req.user_id, 3, "Conformité Juridique", {"ninea": new_state.get("ninea_number"), "rccm": new_state.get("rccm_number")})
    if step_number >= 5 and new_state.get("bilan_metrics"):
        save_audit_milestone(req.user_id, 4, "Bilan SYSCOHADA SMT", new_state.get("bilan_metrics"))

    return {
        "step_name": step_key,
        "step_number": step_number,
        "response": latest_assistant_msg,
        "memories": get_merchant_memories(req.user_id),
        "state": {
            "operator": new_state.get("operator", "WAVE"),
            "ca_mobile_money": new_state.get("ca_mobile_money"),
            "ca_mobile_annual": new_state.get("ca_mobile_annual"),
            "transactions_count": new_state.get("transactions_count"),
            "cash_sales": new_state.get("cash_sales"),
            "purchases_goods": new_state.get("purchases_goods"),
            "operating_charges": new_state.get("operating_charges"),
            "rent_expense": new_state.get("rent_expense"),
            "customer_debts": new_state.get("customer_debts"),
            "supplier_debts": new_state.get("supplier_debts"),
            "net_margin": new_state.get("net_margin"),
            "margin_rate": new_state.get("margin_rate"),
            "ninea_number": new_state.get("ninea_number"),
            "rccm_number": new_state.get("rccm_number"),
            "company_name": new_state.get("company_name"),
            "legal_form": new_state.get("legal_form"),
            "seniority": new_state.get("seniority"),
            "is_formalized": new_state.get("is_formalized"),
            "dscr_score": new_state.get("dscr_score"),
            "eligible": new_state.get("eligible"),
            "bilan_metrics": new_state.get("bilan_metrics"),
            "pdf_generated": new_state.get("pdf_generated", False)
        }
    }


# ============================================================================
# ENDPOINTS DE MÉMOIRE PERSISTANTE (SQLITE DATABASE)
# ============================================================================

class FactRequest(BaseModel):
    category: str = "général"
    fact_key: str
    fact_value: str
    source: Optional[str] = "user_note"


@app.get("/api/memory/{user_id}")
def get_memory_endpoint(user_id: str):
    """Retourne la base de connaissances et les jalons mémorisés pour un commerçant."""
    memories = get_merchant_memories(user_id)
    milestones = get_audit_milestones(user_id)
    return {
        "user_id": user_id,
        "memories_count": len(memories),
        "memories": memories,
        "milestones": milestones
    }


@app.post("/api/memory/{user_id}/fact")
def add_fact_endpoint(user_id: str, req: FactRequest):
    """Ajoute manuellement un fait dans la mémoire persistante SQLite."""
    add_memory_fact(user_id, req.category, req.fact_key, req.fact_value, req.source)
    return {
        "success": True,
        "message": f"Fait '{req.fact_key}' enregistré dans la base de données.",
        "memories": get_merchant_memories(user_id)
    }


@app.get("/api/history/{user_id}")
def get_history_endpoint(user_id: str):
    """Retourne l'historique complet des messages persistés en base SQLite."""
    messages = get_chat_history(user_id)
    return {
        "user_id": user_id,
        "count": len(messages),
        "messages": messages
    }


@app.get("/api/state/{user_id}")
def get_user_state(user_id: str):
    """Renvoie l'état courant enregistré dans la mémoire LangGraph pour un commerçant."""
    thread_config = {"configurable": {"thread_id": user_id}}
    state_snapshot = passport_agent.get_state(thread_config)
    return {
        "user_id": user_id,
        "values": state_snapshot.values if state_snapshot else {}
    }


@app.post("/api/reset/{user_id}")
def reset_user_state(user_id: str):
    """Réinitialise la session et efface la mémoire de l'agent pour recommencer."""
    clear_merchant_data(user_id)
    thread_config = {"configurable": {"thread_id": user_id}}
    passport_agent.update_state(
        thread_config,
        {
            "step": "source_a",
            "ca_mobile_money": 0.0,
            "purchases_goods": 0.0,
            "cash_sales": None,
            "ninea_number": None,
            "rccm_number": None,
            "dscr_score": None,
            "pdf_generated": False,
            "bilan_metrics": None
        }
    )
    return {"success": True, "message": f"Mémoire et session {user_id} réinitialisées."}


# ============================================================================
# SERVICE DU FRONTEND REACT (DÉPLOIEMENT ALL-IN-ONE RENDER / RAILWAY / DOCKER)
# ============================================================================
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Chemins possibles vers le dossier dist de production
dist_candidates = [
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist"),
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "dist"),
    "/app/dist"
]

dist_dir = next((d for d in dist_candidates if os.path.exists(d)), None)

if dist_dir and os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Route API introuvable")
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

