// Configuration dynamique des vidéos tutoriels (non-scellées / personnalisables)
export const DEFAULT_VIDEOS = {
  wave: {
    defaultUrl: 'https://www.youtube.com/shorts/6Ka09ejcvMc',
    name: 'Wave Sénégal',
    presets: [
      { id: 'wave-short-1', title: 'Short Wave Sénégal (Recommandé)', url: 'https://www.youtube.com/shorts/6Ka09ejcvMc' },
      { id: 'wave-alt-1', title: 'Tutoriel alternatif Wave Marchand', url: 'https://www.youtube.com/watch?v=6Ka09ejcvMc' },
      { id: 'wave-direct', title: 'Vidéo MP4 de démonstration', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
    ]
  },
  orange: {
    defaultUrl: 'https://www.youtube.com/shorts/o8tJBdCfAZc',
    name: 'Orange Money',
    presets: [
      { id: 'orange-short-1', title: 'Short Orange Money (Recommandé)', url: 'https://www.youtube.com/shorts/o8tJBdCfAZc' },
      { id: 'orange-alt-1', title: 'Tutoriel alternatif Orange Money', url: 'https://www.youtube.com/watch?v=o8tJBdCfAZc' },
      { id: 'orange-direct', title: 'Vidéo MP4 de démonstration', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
    ]
  }
};

/**
 * Récupère l'URL vidéo configurée pour l'opérateur (depuis le stockage local ou par défaut)
 */
export const getVideoUrlForOperator = (operator) => {
  const opKey = operator === 'orange' ? 'orange' : 'wave';
  try {
    const custom = localStorage.getItem(`passeport_video_${opKey}`);
    if (custom && custom.trim()) {
      return custom.trim();
    }
  } catch (e) {
    console.warn('LocalStorage non accessible', e);
  }
  return DEFAULT_VIDEOS[opKey]?.defaultUrl || '';
};

/**
 * Sauvegarde une URL vidéo personnalisée pour un opérateur
 */
export const saveVideoUrlForOperator = (operator, url) => {
  const opKey = operator === 'orange' ? 'orange' : 'wave';
  try {
    if (url && url.trim()) {
      localStorage.setItem(`passeport_video_${opKey}`, url.trim());
    } else {
      localStorage.removeItem(`passeport_video_${opKey}`);
    }
  } catch (e) {
    console.warn('Impossible de sauvegarder l\'URL vidéo', e);
  }
};

/**
 * Réinitialise à la vidéo par défaut
 */
export const resetVideoUrlForOperator = (operator) => {
  const opKey = operator === 'orange' ? 'orange' : 'wave';
  try {
    localStorage.removeItem(`passeport_video_${opKey}`);
  } catch (e) {
    // ignore
  }
  return DEFAULT_VIDEOS[opKey]?.defaultUrl || '';
};
