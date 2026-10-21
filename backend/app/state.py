from typing import TypedDict, Optional, List, Dict, Any, Annotated
import operator
from langchain_core.messages import BaseMessage


class FinancialPassportState(TypedDict, total=False):
    """
    État global du Passeport Financier PME dans LangGraph.
    Conserve les données financières, juridiques et conversationnelles
    au fil des 4 étapes obligatoires du pipeline.
    """
    # Fil de discussion (réduit par fusion additive)
    messages: Annotated[List[BaseMessage], operator.add]
    
    # Progression du pipeline : 'source_a' | 'source_b' | 'source_c' | 'completed'
    step: str
    
    # Étape 1 : Source A - Opérateur Mobile Money (Wave / Orange Money)
    operator: Optional[str]                     # 'WAVE' ou 'ORANGE'
    ca_mobile_money: float                      # CA mensuel audité (FCFA)
    ca_mobile_annual: float                     # CA annuel audité (FCFA)
    transactions_count: int                     # Nombre de transactions
    regularity_rate: str                        # Taux de régularité (ex: 99.4%)
    
    # Étape 2 : Source B - Carnet de Caisse & Recettes Cash
    cash_sales: float                           # Ventes cash journalières estimées (FCFA/jour)
    monthly_cash_sales: float                   # Ventes cash mensuelles estimées (FCFA/mois)
    purchases_goods: float                      # Achats marchandises mensuels
    rent_expense: float                         # Loyer commercial mensuel (FCFA)
    operating_charges: float                    # Autres charges d'exploitation (énergie, transport)
    customer_debts: float                       # Créances clients
    supplier_debts: float                       # Dettes fournisseurs
    net_margin: float                           # Marge brute / bénéfice d'exploitation estimé
    margin_rate: str                            # Taux de marge brute (ex: 28.1%)
    
    # Étape 3 : Source C - Identification Juridique Officielle (Sénégal)
    ninea_number: Optional[str]                 # N° NINEA (ex: 008942152 2Y2)
    rccm_number: Optional[str]                  # N° RCCM (ex: SN-DKR-2021-B-14820)
    company_name: Optional[str]                 # Raison sociale / Nom de l'établissement
    legal_form: Optional[str]                   # Forme juridique
    creation_date: Optional[str]                # Date d'immatriculation
    seniority: Optional[str]                    # Ancienneté d'activité vérifiée
    is_formalized: bool                         # Formalisé ou statut entreprenant
    
    # Étape 4 : Restitution - Bilan SYSCOHADA SMT & Score DSCR
    dscr_score: Optional[float]                 # Debt Service Coverage Ratio
    eligible: Optional[bool]                    # Éligibilité bancaire (DSCR >= 1.30)
    bilan_metrics: Optional[Dict[str, Any]]     # Détail complet Actif/Passif et Compte de Résultat
    pdf_generated: bool                         # Prêt pour téléchargement / transmission

    # =========================================================================
    # ARCHITECTURE ANTI-HALLUCINATION MULTI-PHOTOS (12+ PHOTOS ➔ BILAN CERTIFIÉ)
    # =========================================================================
    photos: Optional[List[Any]]                  # Lot de 12+ photos brutes
    documents_ocrises: Optional[List[Dict[str, Any]]] # Résultat OCR Vision par photo
    s1_factures: Optional[List[Dict[str, Any]]]  # Silo 1 : Factures achats/ventes
    s2_cash_wave: Optional[List[Dict[str, Any]]] # Silo 2 : Reçus Cash & Mobile Money
    s3_legal: Optional[List[Dict[str, Any]]]     # Silo 3 : Documents officiels RCCM/NINEA
    s_illisibles: Optional[List[Dict[str, Any]]] # Photos floues ou rejetées
    bilan_template: Optional[Dict[str, Any]]     # Squelette officiel SYSCOHADA rempli
    bilan_certifie: Optional[Dict[str, Any]]     # Bilan équilibré final avec ratios et audit trail
    audit_trail: Optional[List[Dict[str, Any]]]  # Preuves photo associées à chaque ligne
