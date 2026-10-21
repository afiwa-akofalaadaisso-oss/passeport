import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  RefreshCw, 
  Download, 
  X, 
  Link2, 
  Maximize2, 
  Minimize2,
  Video
} from 'lucide-react';
import { 
  DEFAULT_VIDEOS, 
  getVideoUrlForOperator, 
  saveVideoUrlForOperator, 
  resetVideoUrlForOperator 
} from '../../config/videoConfig';

export default function Step2ImportData({ operatorData, onBack, onReset, onProceedToChat }) {
  const isOrange = operatorData?.operator === 'orange';
  const operatorKey = isOrange ? 'orange' : 'wave';
  const operatorName = isOrange ? 'Orange Money' : 'Wave';
  const operatorFullName = isOrange ? 'Orange Money (Sénégal)' : 'Wave Sénégal (0 FCFA)';
  const brandColor = isOrange ? '#ff7900' : '#22b8ed';
  const brandLogo = isOrange ? '/orange-money-card.png' : '/wave-logo.png';
  const badgeLabel = isOrange ? 'OM' : '-0F';

  // URL vidéo dynamique (non-scellée / modifiable librement et mémorisée)
  const [videoUrl, setVideoUrl] = useState(() => {
    return operatorData?.customVideoUrl || getVideoUrlForOperator(operatorKey);
  });
  const [fitMode, setFitMode] = useState('contain');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [tempUrlInput, setTempUrlInput] = useState('');
  
  const [uploadedFile, setUploadedFile] = useState(null);

  // Synchronise automatiquement la vidéo si l'opérateur change
  useEffect(() => {
    if (operatorData?.customVideoUrl) {
      setVideoUrl(operatorData.customVideoUrl);
    } else {
      setVideoUrl(getVideoUrlForOperator(operatorKey));
    }
  }, [operatorKey, operatorData?.customVideoUrl]);

  // Ouverture directe de l'application mobile (Wave ou Orange Money)
  const handleOpenOperatorApp = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    if (isOrange) {
      if (isAndroid) {
        // Lance l'application native Orange Money Sénégal sur Android
        window.location.href = 'intent://#Intent;package=com.orange.mobile.orangemoney;scheme=orangemoney;end;';
        setTimeout(() => {
          window.location.href = 'orangemoney://';
        }, 350);
      } else if (isIOS) {
        // Deep-link iOS Orange Money
        window.location.href = 'orangemoney://';
      } else {
        // Portail officiel Orange Money Sénégal sur ordinateur
        window.open('https://orangemoney.orange.sn/', '_blank');
      }
    } else {
      if (isAndroid) {
        // Déclenche l'ouverture native via intent Chrome Android vers Wave
        window.location.href = 'intent://#Intent;package=com.wave.personal;scheme=wave;end;';
        setTimeout(() => {
          window.location.href = 'wave://';
        }, 350);
      } else if (isIOS) {
        // Deep-link direct iOS Wave
        window.location.href = 'wave://';
      } else {
        // Sur ordinateur / bureau : ouvre le portail web Wave Sénégal
        window.open('https://www.wave.com/fr/', '_blank');
      }
    }
  };

  // Analyse et résultat
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const fileInputRef = useRef(null);

  // Extraction intelligente de l'URL d'embed (YouTube ou vidéo directe)
  const getEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/|video_id=)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0&controls=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${ytMatch[1]}`;
    }
    if (rawUrl.includes('youtube.com/embed/')) {
      return rawUrl.includes('?') ? rawUrl : `${rawUrl}?autoplay=1&mute=0&controls=1&playsinline=1`;
    }
    return rawUrl;
  };

  const isDirectVideo = videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.startsWith('/video') || videoUrl.includes('.mp4?');
  const isShort = videoUrl.includes('/shorts/') || videoUrl.includes('6Ka09ejcvMc') || videoUrl.includes('o8tJBdCfAZc');
  const activeEmbedUrl = getEmbedUrl(videoUrl);

  const handleSaveCustomUrl = (e) => {
    e?.preventDefault();
    if (tempUrlInput.trim()) {
      const cleanUrl = tempUrlInput.trim();
      setVideoUrl(cleanUrl);
      saveVideoUrlForOperator(operatorKey, cleanUrl);
      setShowUrlModal(false);
      setTempUrlInput('');
    }
  };

  const handleSelectPreset = (presetUrl) => {
    setVideoUrl(presetUrl);
    saveVideoUrlForOperator(operatorKey, presetUrl);
    setShowUrlModal(false);
  };

  const handleResetToDefault = () => {
    const defaultUrl = resetVideoUrlForOperator(operatorKey);
    setVideoUrl(defaultUrl);
    setShowUrlModal(false);
  };

  // Chargement exemple direct
  const handleUseSample = () => {
    setUploadedFile({
      name: isOrange ? 'Releve_OrangeMoney_12M_2024.pdf' : 'Releve_Wave_Officiel_12M.pdf',
      size: '1.4 Mo',
      isSample: true
    });
    startAnalysis();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' Mo',
        isSample: false
      });
      startAnalysis();
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => {
      setAnalysisStep(2);
    }, 1600);

    setTimeout(() => {
      setAnalysisStep(3);
    }, 3200);

    setTimeout(() => {
      setIsAnalyzing(false);
      setIsCompleted(true);
    }, 4800);
  };

  return (
    <div className="video-screen-container" style={{
      width: '412px',
      maxWidth: '100vw',
      flex: '0 0 412px',
      height: 'min(94vh, 840px)',
      position: 'relative',
      overflow: 'hidden',
      background: '#000000',
      userSelect: 'none'
    }}>

      {/* ========================================================
          1. LA VIDÉO PREND 100% DE LA LONGUEUR ET DE LA LARGEUR
      ======================================================== */}
      {!isAnalyzing && !isCompleted && (
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: '#000000',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {isDirectVideo ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: fitMode === 'cover' ? 'cover' : 'contain',
                display: 'block'
              }}
            />
          ) : (
            <iframe
              src={activeEmbedUrl}
              title={`Vidéo ${operatorName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isShort || fitMode === 'contain' ? '100%' : '320%',
                height: '100%',
                minWidth: '100%',
                minHeight: '100%',
                border: 'none',
                display: 'block',
                pointerEvents: 'auto'
              }}
            />
          )}
        </div>
      )}

      {/* ========================================================
          2. STRUCTURE EN SURIMPRESSION (FLOTTANTE ET ROBUSTE)
      ======================================================== */}
      {!isAnalyzing && !isCompleted && (
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}>
          {/* HEADER FLOTTANT EN HAUT */}
          <div style={{
            padding: 'calc(clamp(12px, 2vh, 18px) + env(safe-area-inset-top, 0px)) 16px 20px',
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.45) 60%, transparent 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            {/* Bouton Retour */}
            <button
              onClick={onBack}
              className="mobile-back-btn"
              style={{ pointerEvents: 'auto' }}
              title="Retour au choix des opérateurs"
              aria-label="Retour"
            >
              <ArrowLeft size={18} strokeWidth={2.8} />
            </button>

            {/* Badge Titre Demandé par l'utilisateur */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1.5px solid ${isOrange ? 'rgba(255, 121, 0, 0.55)' : 'rgba(34, 184, 237, 0.55)'}`,
              padding: '6px 12px 6px 8px',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
              pointerEvents: 'auto',
              minWidth: 0
            }}>
              <img 
                src={brandLogo} 
                alt={operatorName} 
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  objectFit: 'contain',
                  background: '#ffffff',
                  padding: '2px',
                  flexShrink: 0
                }} 
              />
              <div style={{
                fontSize: '0.71rem',
                fontWeight: '800',
                color: '#ffffff',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                textAlign: 'left'
              }}>
                Tutoriel pour avoir votre historique depuis la création de votre compte marchand
              </div>
            </div>

            {/* Options en haut à droite */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'auto' }}>
              <button
                onClick={() => setFitMode(fitMode === 'cover' ? 'contain' : 'cover')}
                className="mobile-back-btn"
                style={{ width: '36px', height: '36px' }}
                title={fitMode === 'cover' ? 'Adapter en 16:9' : 'Remplir 100% de l\'écran'}
              >
                {fitMode === 'cover' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                onClick={() => setShowUrlModal(true)}
                className="mobile-back-btn"
                style={{ width: '36px', height: '36px' }}
                title="Modifier le lien vidéo"
              >
                <Link2 size={16} />
              </button>
            </div>
          </div>

          {/* ZONE CENTRALE TRANSPARENTE POUR VOIR LA VIDÉO PLEIN ÉCRAN */}
          <div style={{ flex: 1, pointerEvents: 'auto' }} />

          {/* FOOTER FLOTTANT EN BAS */}
          <div style={{
            padding: '30px 16px calc(clamp(14px, 2vh, 20px) + env(safe-area-inset-bottom, 8px))',
            background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.65) 60%, transparent 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'auto'
          }}>
            {/* Bouton Continuer : Ouvre Wave et redirige directement vers l'assistant conversationnel */}
            <button
              onClick={() => {
                handleOpenOperatorApp();
                if (onProceedToChat) {
                  onProceedToChat();
                }
              }}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              className="continue-btn"
              style={{
                width: '100%',
                background: '#000000',
                color: '#ffffff',
                borderRadius: '20px',
                padding: 'clamp(14px, 2vh, 17px) 20px',
                fontSize: 'clamp(0.96rem, 2vh, 1.08rem)',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                boxShadow: isBtnHovered
                  ? `0 16px 38px ${isOrange ? 'rgba(255, 121, 0, 0.9)' : 'rgba(30, 92, 77, 0.95)'}, 0 0 0 1.5px rgba(255, 255, 255, 0.5)`
                  : `0 12px 30px ${isOrange ? 'rgba(255, 121, 0, 0.75)' : 'rgba(30, 92, 77, 0.8)'}, 0 0 0 1.5px rgba(255, 255, 255, 0.35)`,
                transform: isBtnHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <span>Continuer sur {operatorName}</span>
              <Check size={18} strokeWidth={3} />
            </button>

            {/* Barre indicatrice smartphone */}
            <div style={{
              width: '120px',
              height: '4px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.45)',
              margin: '6px auto 0',
              flexShrink: 0
            }} />
          </div>
        </div>
      )}




      {/* Input de fichier masqué pour l'import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.csv,.xlsx"
        style={{ display: 'none' }}
      />

      {/* ========================================================
          MODALE POUR MODIFIER / PERSONNALISER LE LIEN VIDÉO
      ======================================================== */}
      {showUrlModal && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#0d131d',
            border: `1.5px solid ${brandColor}80`,
            borderRadius: '24px',
            padding: '20px',
            color: '#ffffff',
            boxShadow: '0 12px 50px rgba(0, 0, 0, 0.95)',
            maxHeight: '90%',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={brandLogo} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fff', padding: '2px' }} />
                <h3 style={{ fontSize: '0.98rem', fontWeight: '900', margin: 0 }}>
                  Changer la vidéo {operatorName}
                </h3>
              </div>
              <button 
                onClick={() => setShowUrlModal(false)} 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.1)', 
                  border: 'none', 
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.45, margin: '0 0 14px' }}>
              Vous pouvez coller n'importe quel lien <strong>YouTube Shorts</strong>, vidéo <strong>YouTube classique</strong> ou lien direct <strong>.mp4</strong>. La vidéo sera mémorisée.
            </p>

            {/* Formulaire de saisie d'URL personnalisée */}
            <form onSubmit={handleSaveCustomUrl} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>
                  Lien personnalisé :
                </label>
                <input
                  type="text"
                  value={tempUrlInput}
                  onChange={(e) => setTempUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/shorts/... ou https://..."
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '11px 14px',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!tempUrlInput.trim()}
                style={{
                  background: tempUrlInput.trim() ? brandColor : 'rgba(255, 255, 255, 0.1)',
                  color: tempUrlInput.trim() ? '#000000' : 'rgba(255, 255, 255, 0.4)',
                  padding: '11px',
                  borderRadius: '14px',
                  fontWeight: '900',
                  fontSize: '0.84rem',
                  cursor: tempUrlInput.trim() ? 'pointer' : 'default',
                  border: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Appliquer et mémoriser cette vidéo
              </button>
            </form>

            {/* Liste de vidéos suggérées / presets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: '800', textTransform: 'uppercase' }}>
                Vidéos prêtes à l'emploi :
              </span>

              {DEFAULT_VIDEOS[operatorKey]?.presets.map((preset) => {
                const isActive = videoUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    style={{
                      background: isActive ? `${brandColor}22` : 'rgba(255, 255, 255, 0.05)',
                      border: isActive ? `1.5px solid ${brandColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '9px 12px',
                      color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.76rem',
                      fontWeight: isActive ? '800' : '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>{preset.title}</span>
                    {isActive && <Check size={14} color={brandColor} strokeWidth={3} />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleResetToDefault}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '6px 0',
                  marginTop: '4px'
                }}
              >
                Rétablir la vidéo initiale par défaut
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================================
          4. ÉCRAN DE CHARGEMENT / ANALYSE CRYPTOGRAPHIQUE
      ======================================================== */}
      {isAnalyzing && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#07090e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          textAlign: 'center',
          zIndex: 30
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${brandColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            position: 'relative',
            boxShadow: `0 0 30px ${isOrange ? 'rgba(255, 121, 0, 0.4)' : 'rgba(34, 184, 237, 0.4)'}`
          }}>
            <RefreshCw size={34} color={brandColor} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#ffffff', marginBottom: '6px' }}>
            Analyse certifiée {operatorName}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.75)', maxWidth: '280px', lineHeight: 1.4 }}>
            Extraction automatique des flux Mobile Money conformément au protocole CDP Sénégal.
          </p>

          {/* Étapes d'analyse */}
          <div style={{
            marginTop: '22px',
            width: '100%',
            background: 'rgba(0, 0, 0, 0.45)',
            borderRadius: '18px',
            padding: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color={analysisStep >= 1 ? '#4ade80' : 'rgba(255,255,255,0.3)'} />
              <span style={{ fontSize: '0.78rem', color: analysisStep >= 1 ? '#ffffff' : 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                Lecture cryptographique du relevé {operatorName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color={analysisStep >= 2 ? '#4ade80' : 'rgba(255,255,255,0.3)'} />
              <span style={{ fontSize: '0.78rem', color: analysisStep >= 2 ? '#ffffff' : 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                Agrégation des 12 mois de chiffre d'affaires
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color={analysisStep >= 3 ? '#4ade80' : 'rgba(255,255,255,0.3)'} />
              <span style={{ fontSize: '0.78rem', color: analysisStep >= 3 ? '#ffffff' : 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                Calcul du Score de Crédit certifié FONGIP & DER-FJ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. ÉCRAN FINAL : PASSEPORT FINANCIER CERTIFIÉ DÉBLOQUÉ
      ======================================================== */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#07090e',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'calc(clamp(14px, 2vh, 20px) + env(safe-area-inset-top, 0px)) 18px calc(clamp(14px, 2vh, 22px) + env(safe-area-inset-bottom, 0px))',
          zIndex: 30,
          overflowY: 'auto'
        }}>
          {/* HAUT DU PASSEPORT */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.5)'
            }}>
              <CheckCircle2 size={32} color="#ffffff" strokeWidth={2.5} />
            </div>

            <div style={{
              display: 'inline-block',
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '9999px',
              padding: '3px 12px',
              color: '#4ade80',
              fontSize: '0.72rem',
              fontWeight: '900',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              Passeport Certifié Débloqué
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 2px' }}>
              Félicitations !
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              Flux {operatorName} audités avec succès sur 12 mois.
            </p>
          </div>

          {/* CARTE PASSEPORT FINANCIER CERTIFIÉ */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(20, 26, 38, 0.95) 0%, rgba(10, 14, 22, 0.98) 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '24px',
            padding: '16px 16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            margin: '12px 0'
          }}>
            {/* Entête de la carte */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={brandLogo} alt={operatorName} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', padding: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '700' }}>
                    SOURCE CERTIFIÉE
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#ffffff', fontWeight: '900' }}>
                    {operatorFullName}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #bef264 0%, #a3e635 100%)',
                color: '#0d1604',
                fontWeight: '900',
                fontSize: '0.82rem',
                padding: '3px 8px',
                borderRadius: '8px'
              }}>
                Score A+
              </div>
            </div>

            {/* Métriques extraites */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', padding: '10px' }}>
                <div style={{ fontSize: '0.64rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: '700' }}>
                  CA MENSUEL MOYEN
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                  {isOrange ? '2 450 000 F' : '3 450 000 F'}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', padding: '10px' }}>
                <div style={{ fontSize: '0.64rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: '700' }}>
                  TRANSACTIONS
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: '900', color: brandColor, marginTop: '2px' }}>
                  {isOrange ? '1 480 op.' : '1 920 op.'}
                </div>
              </div>
            </div>

            {/* Éligibilité FONGIP & DER-FJ */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={18} color="#4ade80" />
              <div style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: '700', lineHeight: 1.3 }}>
                Éligibilité Garantie FONGIP & DER-FJ confirmée.
              </div>
            </div>
          </div>

          {/* BOUTONS D'ACTION DU PASSEPORT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #135457 0%, #1e5c4d 50%, #104c3b 100%)',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '0.92rem',
                padding: '13px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px rgba(22, 92, 77, 0.6)',
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              <span>Télécharger mon Passeport (PDF)</span>
            </button>

            <button
              onClick={onReset}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: '700',
                fontSize: '0.8rem',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer'
              }}
            >
              Recommencer / Changer d'opérateur
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
