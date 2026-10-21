# ============================================================================
# STAGE 1 : BUILD DU FRONTEND REACT (VITE)
# ============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# ============================================================================
# STAGE 2 : BACKEND FASTAPI PYTHON + SERVEUR ALL-IN-ONE
# ============================================================================
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Installation des dépendances Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copie du backend
COPY backend/app ./app

# Copie du frontend compilé depuis l'étape 1
COPY --from=frontend-builder /app/dist ./dist

# Création du dossier pour la base de données SQLite
RUN mkdir -p /app/data

EXPOSE 8000

# Lancement d'Uvicorn écoutant sur la variable d'environnement $PORT (Render / Railway)
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
