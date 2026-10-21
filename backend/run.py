"""
Script de démarrage direct pour le serveur FastAPI LangGraph.
Exécutez : python run.py
"""
import uvicorn
import os
import sys

# Ajoute le dossier courant au PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    print("=" * 60)
    print(" 🚀 Démarrage du serveur LangGraph Passeport Financier PME")
    print(f" 📡 URL locale : http://localhost:{port}")
    print(f" 📚 Documentation interactive Swagger : http://localhost:{port}/docs")
    print("=" * 60)
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
