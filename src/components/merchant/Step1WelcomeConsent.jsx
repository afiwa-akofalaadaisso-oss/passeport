import React, { useState } from 'react';
import { Check, ShieldCheck, X, ArrowRight } from 'lucide-react';

export default function Step1WelcomeConsent({ 
  onCompleteStep, 
  initialPlan = 'right', 
  initialAcceptedTerms = true 
}) {
  // 'left' (Orange Money) ou 'right' (Wave)
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [acceptedTerms, setAcceptedTerms] = useState(initialAcceptedTerms);
  const [showCdpModal, setShowCdpModal] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const isReady = acceptedTerms && selectedPlan !== null;

  const handleStart = () => {
    if (!isReady) return;
    if (onCompleteStep) {
      onCompleteStep({
        selected: selectedPlan === 'right' ? 'Wave Sénégal (0 FCFA)' : 'Orange Money (Sénégal)',
        operator: selectedPlan === 'right' ? 'wave' : 'orange',
        plan: selectedPlan,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="mobile-screen-container" style={{
      background: `
        radial-gradient(circle at 14% 14%, rgba(14, 165, 233, 0.48) 0%, transparent 50%),
        radial-gradient(circle at 86% 18%, rgba(34, 197, 94, 0.35) 0%, transparent 46%),
        radial-gradient(circle at 50% 36%, rgba(250, 204, 21, 0.28) 0%, transparent 44%),
        radial-gradient(circle at 88% 74%, rgba(14, 165, 233, 0.38) 0%, transparent 50%),
        radial-gradient(circle at 12% 82%, rgba(59, 130, 246, 0.42) 0%, transparent 52%),
        linear-gradient(180deg, #07090e 0%, #0a0d14 50%, #050609 100%)
      `,
      userSelect: 'none'
    }}>

        {/* ========================================================
            1. TOP BAR (Logo à gauche, Barre de progression au centre, '1/2 · 30s' à droite)
        ======================================================== */}
        <div style={{
          padding: 'calc(clamp(10px, 1.8vh, 16px) + env(safe-area-inset-top, 0px)) clamp(16px, 4vw, 24px) 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'transparent',
          zIndex: 2,
          flexShrink: 0
        }}>
          {/* Logo Pebble officiel transparent avec battement de cœur */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/toycad-logo-clean.png"
              alt="Logo"
              className="heartbeat-logo"
              style={{
                width: 'clamp(38px, 4.8vh, 44px)',
                height: 'clamp(38px, 4.8vh, 44px)',
                objectFit: 'contain',
                display: 'block',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Barre de progression épurée (50% étape 1 sur 2) */}
          <div style={{
            flex: 1,
            maxWidth: '180px',
            height: '4px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.22)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              borderRadius: '9999px',
              background: '#ffffff',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.75)'
            }} />
          </div>

          {/* Indicateur textuel 1/2 · 30s */}
          <span style={{
            fontSize: 'clamp(0.82rem, 1.8vh, 0.92rem)',
            fontWeight: '700',
            color: 'rgba(255, 255, 255, 0.92)',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap'
          }}>
            1/2 · 30s
          </span>
        </div>

        {/* ========================================================
            2. CONTENU PRINCIPAL : EXACTEMENT SELON VOTRE CAPTURE
        ======================================================== */}
        <div style={{
          padding: 'clamp(8px, 1.8vh, 18px) 24px clamp(8px, 1.8vh, 16px)',
          zIndex: 2,
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Titre principal : Votre compte d'encaissement */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5.6vh, 3.1rem)',
            fontWeight: '900',
            color: '#ffffff',
            lineHeight: '1.05',
            letterSpacing: '-0.04em',
            margin: 0,
            textShadow: '0 2px 24px rgba(0, 0, 0, 0.6)'
          }}>
            Votre compte<br />
            d'encaissement
          </h1>

          {/* Sous-titre explicatif : Où arrivent vos paiements du jour */}
          <p style={{
            fontSize: 'clamp(0.95rem, 2.3vh, 1.15rem)',
            color: 'rgba(255, 255, 255, 0.85)',
            marginTop: 'clamp(10px, 1.8vh, 16px)',
            marginBottom: 0,
            fontWeight: '500',
            lineHeight: 1.42,
            textShadow: '0 1px 8px rgba(0, 0, 0, 0.35)'
          }}>
            Où arrivent vos paiements du jour
          </p>
        </div>

        {/* ========================================================
            3. BLOC DU BAS (Drawer Dark Glassmorphism avec cartes agrandies)
        ======================================================== */}
        <div style={{
          background: 'rgba(11, 14, 21, 0.88)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          borderTopLeftRadius: '34px',
          borderTopRightRadius: '34px',
          borderBottomLeftRadius: '38px',
          borderBottomRightRadius: '38px',
          margin: '0',
          width: '100%',
          padding: 'clamp(12px, 2vh, 18px) 16px clamp(10px, 1.8vh, 16px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.75)',
          zIndex: 2,
          position: 'relative',
          flexShrink: 0
        }}>
          
          {/* GRILLE DES 2 CARTES OPÉRATEURS AGRANDIES */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: 'clamp(12px, 1.8vh, 16px)'
          }}>
            
            {/* CARTE GAUCHE : ORANGE MONEY */}
            <div
              onClick={() => {
                setSelectedPlan('left');
                setAcceptedTerms(true);
              }}
              style={{
                height: 'clamp(122px, 17vh, 155px)',
                borderRadius: '22px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                transform: 'none',
                opacity: 1,
                background: '#ff7900',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px'
              }}
            >
              {/* L'image officielle Orange Money */}
              <img
                src="/orange-money-card.png"
                alt="Orange Money Sénégal"
                style={{
                  width: '94%',
                  height: '94%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />

              {/* Badge OM en haut à gauche symétrique à Wave */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '9999px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                zIndex: 5
              }}>
                OM
              </div>

              {/* Checkmark blanc et orange en haut à droite si sélectionné */}
              {selectedPlan === 'left' && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
                  zIndex: 5
                }}>
                  <Check size={14} strokeWidth={3.5} color="#ff7900" />
                </div>
              )}
            </div>

            {/* CARTE DROITE : WAVE SÉNÉGAL */}
            <div
              onClick={() => {
                setSelectedPlan('right');
                setAcceptedTerms(true);
              }}
              style={{
                height: 'clamp(122px, 17vh, 155px)',
                borderRadius: '22px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                transform: 'none',
                opacity: 1,
                background: '#22b8ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
            >
              {/* L'image est grande, 100% visible, centrée et sans coupure */}
              <img
                src="/wave-logo.png"
                alt="Wave Sénégal"
                style={{
                  width: '92%',
                  height: '92%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />

              {/* Badge -0F en haut à gauche */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '9999px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                zIndex: 5
              }}>
                -0F
              </div>

              {/* Checkmark blanc et bleu en haut à droite si sélectionné */}
              {selectedPlan === 'right' && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
                  zIndex: 5
                }}>
                  <Check size={14} strokeWidth={3.5} color="#0284c7" />
                </div>
              )}
            </div>

          </div>

          {/* ========================================================
              4. BAS DE PAGE : EXACTEMENT SELON VOTRE CAPTURE
          ======================================================== */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 1.6vh, 14px)',
            width: '100%',
            padding: '0 4px'
          }}>
            {/* 1. Ligne Case à cocher + Texte CDP */}
            <div
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {/* Carré de case à cocher */}
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                border: acceptedTerms ? 'none' : '1.5px solid rgba(255, 255, 255, 0.4)',
                background: acceptedTerms
                  ? '#1e5c4d'
                  : 'rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: acceptedTerms
                  ? '0 0 12px rgba(30, 92, 77, 0.6)'
                  : 'none',
                transition: 'all 0.2s ease'
              }}>
                {acceptedTerms && <Check size={15} strokeWidth={3.5} color="#ffffff" />}
              </div>

              {/* Texte légal CDP */}
              <div style={{
                fontSize: 'clamp(0.78rem, 1.6vh, 0.88rem)',
                color: 'rgba(255, 255, 255, 0.92)',
                lineHeight: 1.35,
                fontWeight: '500'
              }}>
                J'accepte les conditions et le traitement de mes données&nbsp;
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCdpModal(true);
                  }}
                  style={{
                    color: '#ffffff',
                    fontWeight: '700',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  (CDP)
                </span>
              </div>
            </div>

            {/* 2. Bouton plein-largeur "Continuer" */}
            <button
              onClick={handleStart}
              disabled={!isReady}
              onMouseEnter={() => setIsBtnHovered(true)}
              onMouseLeave={() => setIsBtnHovered(false)}
              className="continue-btn"
              style={{
                width: '100%',
                background: '#000000',
                color: !isReady ? 'rgba(255, 255, 255, 0.45)' : '#ffffff',
                borderRadius: '20px',
                padding: 'clamp(14px, 1.9vh, 17px) 20px',
                fontSize: 'clamp(1.05rem, 2.2vh, 1.18rem)',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: '-0.01em',
                transform: isBtnHovered && isReady ? 'translateY(-2px)' : 'none',
                boxShadow: !isReady
                  ? '0 6px 18px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.12)'
                  : isBtnHovered
                    ? '0 16px 38px rgba(30, 92, 77, 0.92), 0 6px 16px rgba(0, 0, 0, 0.95), 0 0 0 1.5px rgba(255, 255, 255, 0.5)'
                    : '0 14px 34px rgba(30, 92, 77, 0.78), 0 4px 14px rgba(0, 0, 0, 0.9), 0 0 0 1.5px rgba(255, 255, 255, 0.35)',
                cursor: isReady ? 'pointer' : 'not-allowed',
                border: 'none',
                outline: 'none',
                opacity: !isReady ? 0.65 : 1,
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <span>Continuer</span>
            </button>

            {/* 3. Texte d'aide sous le bouton */}
            <div style={{
              textAlign: 'center',
              fontSize: 'clamp(0.78rem, 1.6vh, 0.88rem)',
              color: isReady ? '#4ade80' : '#38bdf8',
              fontWeight: '500',
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease',
              minHeight: '18px'
            }}>
              {isReady
                ? '✓ Prêt à continuer'
                : !selectedPlan && !acceptedTerms
                  ? 'Choisissez votre compte et cochez la case'
                  : !selectedPlan
                    ? 'Choisissez Orange Money ou Wave'
                    : 'Cochez la case pour continuer'}
            </div>

            {/* Barre indicatrice smartphone */}
            <div style={{
              width: '120px',
              height: '4px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.28)',
              margin: '6px auto 0',
              flexShrink: 0
            }} />
          </div>

        </div>

        {/* Modale des mentions légales CDP */}
        {showCdpModal && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}>
            <div style={{
              background: '#0d1017',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '28px',
              padding: '24px',
              width: '100%',
              color: '#ffffff',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="#4ade80" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                    Conformité CDP Sénégal
                  </h3>
                </div>
                <button onClick={() => setShowCdpModal(false)} style={{ color: '#D9D9D7' }}>
                  <X size={20} />
                </button>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.5, marginBottom: '16px' }}>
                En utilisant ce service, vous acceptez l'extraction et l'analyse de vos relevés conformément à la <strong style={{ color: '#ffffff' }}>Loi sénégalaise n° 2008-12</strong> relative à la protection des données personnelles (CDP).
              </p>

              <button
                onClick={() => setShowCdpModal(false)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #bef264 0%, #a3e635 100%)',
                  color: '#0d1604',
                  fontWeight: '900',
                  padding: '12px',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 18px rgba(163, 230, 53, 0.4)'
                }}
              >
                Compris, j'accepte
              </button>
            </div>
          </div>
        )}

      </div>
  );
}
