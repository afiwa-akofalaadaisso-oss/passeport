# 🛡️ Backend LangGraph & FastAPI - Passeport Financier PME

Serveur d'audit financier déterministe pour commerçants et PME (Sénégal / UEMOA), orchestré par **LangGraph**, avec calculs conformes au **Système Minimal de Trésorerie (SMT) SYSCOHADA** et certification du ratio **DSCR**.

---

## 🏗️ Architecture

```
                 ┌────────────────────────┐
                 │   START / ONBOARDING   │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │    Node_1: Source_A    │
                 │ (PDF/SMS Wave & OM)    │
                 └───────────┬────────────┘
                             │  (Validé)
                             ▼
                 ┌────────────────────────┐
                 │    Node_2: Source_B    │
                 │  (Carnet Caisse Cash)  │
                 └───────────┬────────────┘
                             │  (Validé)
                             ▼
                 ┌────────────────────────┐
                 │    Node_3: Source_C    │
                 │   (Scan NINEA/RCCM)    │
                 └───────────┬────────────┘
                             │  (Validé)
                             ▼
                 ┌────────────────────────┐
                 │ Node_4: Bilan_&_Score  │
                 │ (Génération SMT/DSCR)  │
                 └───────────┬────────────┘
                             │
                             ▼
                         ┌───────┐
                         │  END  │
                         └───────┘
```

---

## ⚡ Installation Rapide

### 1. Créer et activer l'environnement virtuel Python
```bash
cd backend
python -m venv .venv

# Sous Windows (PowerShell) :
.venv\Scripts\Activate.ps1

# Sous Linux / macOS :
source .venv/bin/activate
```

### 2. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3. (Optionnel) Configurer la clé OpenAI pour GPT-4o Vision
Dans le fichier `backend/.env` :
```env
OPENAI_API_KEY=sk-proj-votre-cle-openai-ici
PORT=8000
```
> **Note :** Si aucune clé OpenAI n'est fournie, l'agent bascule automatiquement sur son **moteur certifié déterministe de repli** pour permettre les tests et démonstrations sans interruption ni coût d'API.

### 4. Démarrer le serveur
```bash
python run.py
```
Le serveur démarre sur `http://localhost:8000`.  
Consultez la documentation interactive Swagger sur : **`http://localhost:8000/docs`**.

---

## 📡 Endpoints API

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Statut de l'agent et diagnostic OpenAI |
| `POST` | `/api/chat` | Envoi d'un message, photo ou transition d'étape LangGraph |
| `POST` | `/api/extract` | Extraction OCR (Wave, Carnet manuscrit, NINEA) |
| `GET` | `/api/state/{user_id}` | Récupération de l'état en mémoire pour un commerçant |
| `POST` | `/api/reset/{user_id}` | Réinitialisation complète de l'audit pour un commerçant |
