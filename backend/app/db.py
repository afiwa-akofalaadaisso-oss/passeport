"""
Module de persistance et de Mémoire à Long Terme (SQLite Database)
pour l'Agent IA Passeport Financier PME.
Permet à l'agent de mémoriser les commerçants, leurs états financiers,
leurs antécédents d'audit et les faits contextuels (Loyer, Activité, Chiffres clés).
"""
import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "passeport_memory.db")


def get_db_connection() -> sqlite3.Connection:
    """Crée ou ouvre la connexion SQLite avec Row factory."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialise le schéma de base de données relationnelle SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Table des commerçants
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merchants (
            merchant_id TEXT PRIMARY KEY,
            business_name TEXT,
            operator TEXT DEFAULT 'wave',
            phone TEXT,
            city TEXT DEFAULT 'Dakar',
            created_at TEXT,
            updated_at TEXT
        )
    """)

    # 2. Table des mémoires / faits mémorisés de l'IA (Long-Term Memory)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS memory_facts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant_id TEXT NOT NULL,
            category TEXT NOT NULL, -- 'identité', 'financier', 'charges', 'crédit'
            fact_key TEXT NOT NULL,
            fact_value TEXT NOT NULL,
            source TEXT DEFAULT 'agent_chat',
            created_at TEXT,
            UNIQUE(merchant_id, fact_key) ON CONFLICT REPLACE
        )
    """)

    # 3. Table des bilans et étapes d'audit validées
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant_id TEXT NOT NULL,
            step_number INTEGER NOT NULL,
            step_title TEXT NOT NULL,
            metrics_json TEXT NOT NULL,
            created_at TEXT
        )
    """)

    # 4. Table des messages de discussion (Chat logs)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            step INTEGER DEFAULT 1,
            timestamp TEXT,
            created_at TEXT
        )
    """)

    conn.commit()
    conn.close()


def save_or_update_merchant(merchant_id: str, operator: str = "wave", business_name: Optional[str] = None, city: Optional[str] = None):
    """Enregistre ou met à jour le profil du commerçant."""
    conn = get_db_connection()
    now = datetime.now().isoformat()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO merchants (merchant_id, operator, business_name, city, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(merchant_id) DO UPDATE SET
            operator = COALESCE(excluded.operator, merchants.operator),
            business_name = COALESCE(excluded.business_name, merchants.business_name),
            city = COALESCE(excluded.city, merchants.city),
            updated_at = excluded.updated_at
    """, (merchant_id, operator.lower(), business_name, city, now, now))
    conn.commit()
    conn.close()


def add_memory_fact(merchant_id: str, category: str, fact_key: str, fact_value: str, source: str = "system"):
    """Ajoute ou met à jour un souvenir/fait contextuel sur le commerçant."""
    conn = get_db_connection()
    now = datetime.now().isoformat()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO memory_facts (merchant_id, category, fact_key, fact_value, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(merchant_id, fact_key) DO UPDATE SET
            fact_value = excluded.fact_value,
            category = excluded.category,
            source = excluded.source,
            created_at = excluded.created_at
    """, (merchant_id, category, fact_key, str(fact_value), source, now))
    conn.commit()
    conn.close()


def get_merchant_memories(merchant_id: str) -> List[Dict[str, Any]]:
    """Récupère tous les faits mémorisés pour un commerçant."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, category, fact_key, fact_value, source, created_at
        FROM memory_facts
        WHERE merchant_id = ?
        ORDER BY created_at ASC
    """, (merchant_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_audit_milestone(merchant_id: str, step_number: int, step_title: str, metrics: Dict[str, Any]):
    """Enregistre une étape franchie dans le pipeline d'audit."""
    conn = get_db_connection()
    now = datetime.now().isoformat()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_milestones (merchant_id, step_number, step_title, metrics_json, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (merchant_id, step_number, step_title, json.dumps(metrics, ensure_ascii=False), now))
    conn.commit()
    conn.close()


def get_audit_milestones(merchant_id: str) -> List[Dict[str, Any]]:
    """Retourne l'historique des étapes et bilans enregistrés."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, step_number, step_title, metrics_json, created_at
        FROM audit_milestones
        WHERE merchant_id = ?
        ORDER BY step_number ASC, created_at ASC
    """, (merchant_id,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        item = dict(r)
        try:
            item["metrics"] = json.loads(item["metrics_json"])
        except Exception:
            item["metrics"] = {}
        results.append(item)
    return results


def save_chat_message(merchant_id: str, sender: str, text: str, step: int = 1, timestamp: Optional[str] = None):
    """Persiste un message dans la base SQLite."""
    conn = get_db_connection()
    now = datetime.now().isoformat()
    t_stamp = timestamp or datetime.now().strftime("%H:%M")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO chat_messages (merchant_id, sender, text, step, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (merchant_id, sender, text, step, t_stamp, now))
    conn.commit()
    conn.close()


def get_chat_history(merchant_id: str, limit: int = 60) -> List[Dict[str, Any]]:
    """Retourne l'historique des messages persistés."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, sender, text, step, timestamp, created_at
        FROM chat_messages
        WHERE merchant_id = ?
        ORDER BY id ASC
        LIMIT ?
    """, (merchant_id, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def clear_merchant_data(merchant_id: str):
    """Efface la mémoire et les logs d'un commerçant pour recommencer à zéro."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM memory_facts WHERE merchant_id = ?", (merchant_id,))
    cursor.execute("DELETE FROM audit_milestones WHERE merchant_id = ?", (merchant_id,))
    cursor.execute("DELETE FROM chat_messages WHERE merchant_id = ?", (merchant_id,))
    cursor.execute("DELETE FROM merchants WHERE merchant_id = ?", (merchant_id,))
    conn.commit()
    conn.close()


def build_memory_context_prompt(merchant_id: str) -> str:
    """
    Construit le bloc de contexte de mémoire persistante à injecter
    dans les prompts système de l'agent LangGraph.
    """
    facts = get_merchant_memories(merchant_id)
    if not facts:
        return ""

    lines = ["\n[BASE DE DONNÉES & MÉMOIRE HISTORIQUE DU COMMERÇANT] :"]
    for f in facts:
        lines.append(f"- {f['fact_key']} : {f['fact_value']}")
    lines.append("Tu te souviens parfaitement de ces éléments lors de tes interactions avec lui.\n")
    return "\n".join(lines)


# Initialisation automatique au chargement du module
init_db()
