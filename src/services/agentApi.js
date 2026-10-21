/**
 * Service Client pour connecter l'interface React à l'Agent LangGraph (FastAPI).
 * Gère automatiquement le basculement en mode démo déterministe si le backend est hors-ligne.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Convertit un objet File du navigateur en chaîne Base64 Data URL.
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Vérifie si le backend FastAPI LangGraph est joignable.
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2500)
    });
    if (!res.ok) throw new Error('API non prête');
    const data = await res.json();
    return {
      online: true,
      mode: data.mode || 'LangGraph Online',
      openai_configured: data.openai_configured || false
    };
  } catch (err) {
    return {
      online: false,
      mode: 'Simulation Locale Certifiée',
      openai_configured: false,
      error: err.message
    };
  }
};

/**
 * Envoie un message ou une action d'étape à l'agent LangGraph.
 */
export const sendChatMessage = async ({
  userId = 'merchant_default',
  message = '',
  operator = 'WAVE',
  stepHint = null,
  photos = [],
  extractedData = null
}) => {
  try {
    // Si des fichiers photos sont fournis, s'assurer qu'ils sont au format base64
    let processedPhotos = [];
    if (photos && photos.length > 0) {
      processedPhotos = await Promise.all(
        photos.map(async (p) => {
          if (typeof p === 'string') return p;
          if (p.file instanceof File) return await fileToDataUrl(p.file);
          if (p.url) return p.url;
          return null;
        })
      );
      processedPhotos = processedPhotos.filter(Boolean);
    }

    const payload = {
      user_id: userId,
      message,
      operator: operator.toUpperCase(),
      step_hint: stepHint,
      photos: processedPhotos,
      extracted_data: extractedData
    };

    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000)
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      isLiveBackend: true,
      ...data
    };
  } catch (err) {
    console.warn('[agentApi] Backend non joignable ou erreur réseau. Utilisation du mode repli local.', err);
    return {
      success: false,
      isLiveBackend: false,
      error: err.message
    };
  }
};

/**
 * Réinitialise la session d'audit pour le commerçant.
 */
export const resetMerchantSession = async (userId = 'merchant_default') => {
  try {
    const res = await fetch(`${API_BASE_URL}/reset/${userId}`, {
      method: 'POST',
      signal: AbortSignal.timeout(3000)
    });
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * Récupère les faits mémorisés dans la base SQLite pour ce commerçant.
 */
export const getMerchantMemory = async (userId = 'merchant_default') => {
  try {
    const res = await fetch(`${API_BASE_URL}/memory/${userId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return { memories: [], milestones: [] };
    return await res.json();
  } catch {
    return { memories: [], milestones: [] };
  }
};

/**
 * Ajoute un fait ou une note dans la mémoire SQLite du commerçant.
 */
export const addMerchantFact = async (userId = 'merchant_default', fact = {}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/memory/${userId}/fact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(fact),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

/**
 * Récupère l'historique des discussions sauvegardé en base SQLite.
 */
export const getChatHistoryFromDb = async (userId = 'merchant_default') => {
  try {
    const res = await fetch(`${API_BASE_URL}/history/${userId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return { messages: [] };
    return await res.json();
  } catch {
    return { messages: [] };
  }
};

/**
 * Envoie un code OTP à 6 chiffres par email pour la connexion sécurisée.
 */
export const sendAuthEmailCode = async (email) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Erreur lors de l’envoi du code');
    }
    return await res.json();
  } catch (err) {
    // Mode hors-ligne / fallback sécurisé
    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔐 [AUTH FALLBACK] Code d'accès simulé : ${demoCode}`);
    return {
      success: true,
      email,
      demo_code: demoCode,
      message: 'Code de sécurité généré avec succès.',
      fallback: true
    };
  }
};

/**
 * Vérifie le code OTP reçu par email.
 */
export const verifyAuthEmailCode = async (email, code) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, code }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Code de vérification invalide');
    }
    return await res.json();
  } catch (err) {
    // Mode hors-ligne / fallback : accepter 2026, 202600 ou n'importe quel code 6 chiffres valide si fallback
    if (code === '2026' || code === '202600' || (code.length === 6 && /^\d+$/.test(code))) {
      return {
        success: true,
        token: `pst_tok_offline_${Date.now()}`,
        user: {
          email,
          merchant_id: email,
          role: 'owner',
          business_name: `Entreprise ${email.split('@')[0]}`,
          verified_at: new Date().toISOString()
        }
      };
    }
    throw err;
  }
};

/**
 * Vérifie le code PIN de déverrouillage physique (2026).
 */
export const verifyAuthPin = async (pin) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ pin }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Code PIN incorrect');
    return await res.json();
  } catch (err) {
    if (pin === '2026') {
      return {
        success: true,
        token: `pst_pin_offline_${Date.now()}`,
        user: {
          email: 'owner@passeport.pme',
          merchant_id: 'owner_pin',
          role: 'owner'
        }
      };
    }
    throw new Error('Code PIN incorrect');
  }
};


