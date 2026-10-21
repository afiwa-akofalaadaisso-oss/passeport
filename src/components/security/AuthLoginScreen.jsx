import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Lock, 
  ChevronLeft,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { sendAuthEmailCode, verifyAuthEmailCode, verifyAuthPin } from '../../services/agentApi';

export default function AuthLoginScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('EMAIL'); // 'EMAIL' | 'OTP' | 'PIN'
  const [email, setEmail] = useState(() => localStorage.getItem('passeport_user_email') || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [pin, setPin] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  
  // États de chargement et d'erreur
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoCode, setDemoCode] = useState(null);
  
  // Compte à rebours de réexpédition (60 secondes)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Références pour les 6 champs de saisie OTP
  const otpInputRefs = useRef([]);

  // Gestion du décompte pour renvoyer le code
  useEffect(() => {
    let timer;
    if (mode === 'OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, countdown]);

  // Focus sur la première case OTP quand on entre dans l'écran OTP
  useEffect(() => {
    if (mode === 'OTP' && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 200);
    }
  }, [mode]);

  // 1. Envoi du code OTP par Email
  const handleSendEmailCode = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Veuillez entrer une adresse email valide (ex: contact@entreprise.sn).');
      return;
    }

    setLoading(true);
    try {
      const res = await sendAuthEmailCode(cleanEmail);
      if (res && (res.success || res.status === 'sent')) {
        setDemoCode(res.demo_code || null);
        setMode('OTP');
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        if (rememberDevice) {
          localStorage.setItem('passeport_user_email', cleanEmail);
        }
      } else {
        setErrorMsg(res?.message || 'Erreur lors de l’envoi du code. Veuillez réessayer.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Impossible de joindre le serveur. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Gestion des inputs OTP individuels
  const handleOtpChange = (index, value) => {
    // Si l'utilisateur colle un code complet de 6 chiffres
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      if (pastedDigits.length > 0) {
        const newOtp = [...otp];
        pastedDigits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        const nextIndex = Math.min(pastedDigits.length, 5);
        otpInputRefs.current[nextIndex]?.focus();
        
        // Auto-soumission si les 6 chiffres sont présents
        if (pastedDigits.length === 6) {
          triggerVerifyCode(newOtp.join(''));
        }
      }
      return;
    }

    // Saisie d'un seul chiffre
    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setErrorMsg('');

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Si le 6ème chiffre est tapé, vérifier automatiquement
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !newOtp.includes('')) {
      triggerVerifyCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Remplissage automatique du code de démonstration en 1 clic
  const handleAutoFillDemoCode = () => {
    if (!demoCode) return;
    const digits = demoCode.split('');
    setOtp(digits);
    triggerVerifyCode(demoCode);
  };

  // 4. Vérification du code OTP
  const triggerVerifyCode = async (codeToVerify) => {
    const code = (codeToVerify || otp.join('')).trim();
    if (code.length < 6) {
      setErrorMsg('Veuillez entrer le code de vérification complet (6 chiffres).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await verifyAuthEmailCode(email.trim().toLowerCase(), code);
      if (res && res.success) {
        setSuccessMsg('Authentification réussie !');
        if (rememberDevice) {
          localStorage.setItem('passeport_app_unlocked', 'true');
          localStorage.setItem('passeport_auth_token', res.token || 'verified');
          localStorage.setItem('passeport_auth_user', JSON.stringify(res.user || { email }));
        }
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 500);
      } else {
        setErrorMsg('Code incorrect ou expiré. Veuillez vérifier.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Code incorrect. Veuillez vérifier vos chiffres.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Déverrouillage d'urgence par PIN 2026
  const handlePinPress = async (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        setLoading(true);
        try {
          const res = await verifyAuthPin(nextPin);
          if (res && res.success) {
            setSuccessMsg('Déverrouillage PIN confirmé !');
            if (rememberDevice) {
              localStorage.setItem('passeport_app_unlocked', 'true');
            }
            setTimeout(() => {
              onLoginSuccess({ email: 'owner@passeport.pme', role: 'owner' });
            }, 400);
          } else {
            setErrorMsg('Code PIN incorrect.');
            setTimeout(() => setPin(''), 500);
          }
        } catch {
          setErrorMsg('Code PIN incorrect (par défaut: 2026).');
          setTimeout(() => setPin(''), 500);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '430px',
      minHeight: '620px',
      maxHeight: 'min(94vh, 840px)',
      background: '#0c0d10',
      borderRadius: '28px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 24px 70px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      color: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Halo lumineux d'ambiance */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        height: '240px',
        background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.1) 40%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header avec statut de sécurité */}
      <div style={{
        padding: '24px 24px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: '#94a3b8'
        }}>
          <ShieldCheck size={13} color="#10b981" />
          <span>ACCÈS SÉCURISÉ BANCAIRE</span>
        </div>

        {mode !== 'EMAIL' && (
          <button
            onClick={() => {
              setMode('EMAIL');
              setErrorMsg('');
              setPin('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <ChevronLeft size={14} />
            <span>Retour</span>
          </button>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODE 1 : SAISIE DE L'EMAIL */}
      {/* ===================================================================== */}
      {mode === 'EMAIL' && (
        <form onSubmit={handleSendEmailCode} style={{
          padding: '16px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          zIndex: 1
        }}>
          <div>
            {/* Icône et Titres */}
            <div style={{ textAlign: 'center', margin: '16px 0 28px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.15))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)'
              }}>
                <Mail size={28} color="#c084fc" />
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 8px',
                letterSpacing: '-0.02em'
              }}>
                Connexion Commerçant
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#94a3b8',
                lineHeight: 1.5,
                margin: 0,
                padding: '0 12px'
              }}>
                Entrez votre adresse email pour recevoir votre code d'accès à 6 chiffres.
              </p>
            </div>

            {/* Champ Saisie Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Adresse Email Professionnelle
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.sn"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 46px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(168, 85, 247, 0.6)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                />
              </div>
            </div>

            {/* Case à cocher "Se souvenir de moi" */}
            <div 
              onClick={() => setRememberDevice(!rememberDevice)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                marginBottom: '20px'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '6px',
                background: rememberDevice ? '#6366f1' : 'rgba(255, 255, 255, 0.06)',
                border: rememberDevice ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s'
              }}>
                {rememberDevice && <CheckCircle2 size={13} color="#ffffff" />}
              </div>
              <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                Garder ma session active sur ce téléphone
              </span>
            </div>

            {/* Message d'erreur */}
            {errorMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div>
            {/* Bouton Envoyer le code */}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                transition: 'opacity 0.2s',
                opacity: loading || !email.trim() ? 0.6 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Envoi du code en cours...</span>
                </>
              ) : (
                <>
                  <span>Recevoir mon code secret</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Accès rapide alternatif par PIN 2026 */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setMode('PIN');
                  setErrorMsg('');
                  setPin('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
              >
                <KeyRound size={13} color="#a855f7" />
                <span>Se connecter avec le code PIN d'urgence (2026)</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* MODE 2 : VÉRIFICATION DU CODE OTP (6 CHIFFRES) */}
      {/* ===================================================================== */}
      {mode === 'OTP' && (
        <div style={{
          padding: '16px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          zIndex: 1
        }}>
          <div>
            {/* En-tête OTP */}
            <div style={{ textAlign: 'center', margin: '12px 0 24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.15))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
              }}>
                <CheckCircle2 size={30} color="#10b981" />
              </div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 6px',
                letterSpacing: '-0.02em'
              }}>
                Vérifiez votre boîte mail
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#94a3b8',
                lineHeight: 1.5,
                margin: 0
              }}>
                Un code à 6 chiffres a été envoyé à :<br />
                <span style={{ color: '#c084fc', fontWeight: 600 }}>{email}</span>
              </p>
            </div>

            {/* Notification toast avec code de démonstration cliquable */}
            {demoCode && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(99, 102, 241, 0.08))',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="#c084fc" />
                  <span style={{ fontSize: '13px', color: '#e2e8f0' }}>
                    Code généré : <strong style={{ color: '#38bdf8', letterSpacing: '0.08em', fontSize: '14px' }}>{demoCode}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillDemoCode}
                  style={{
                    background: '#6366f1',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Remplir
                </button>
              </div>
            )}

            {/* 6 Cases de saisie OTP */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              margin: '0 auto 20px',
              maxWidth: '340px'
            }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={{
                    width: '46px',
                    height: '56px',
                    borderRadius: '12px',
                    background: digit ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: digit 
                      ? '1.5px solid #8b5cf6' 
                      : '1.5px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '22px',
                    fontWeight: 700,
                    textAlign: 'center',
                    outline: 'none',
                    transition: 'all 0.15s',
                    boxShadow: digit ? '0 0 12px rgba(139, 92, 246, 0.3)' : 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c084fc'}
                  onBlur={(e) => {
                    if (!digit) e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                />
              ))}
            </div>

            {/* Message d'erreur ou succès */}
            {errorMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Option Renvoyer le code */}
            <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c084fc',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Renvoyer un nouveau code par email</span>
                </button>
              ) : (
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  Renvoyer un code dans <strong>{countdown}s</strong>
                </span>
              )}
            </div>
          </div>

          <div>
            {/* Bouton de validation */}
            <button
              type="button"
              onClick={() => triggerVerifyCode()}
              disabled={loading || otp.join('').length < 6}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                transition: 'opacity 0.2s',
                opacity: loading || otp.join('').length < 6 ? 0.6 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Vérification du code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Confirmer et ouvrir mon Passeport</span>
                </>
              )}
            </button>

            {/* Revenir à la saisie de l'email */}
            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setMode('EMAIL');
                  setErrorMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Changer d'adresse email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 3 : CODE PIN NUMÉRIQUE PHYSIQUE (2026) */}
      {/* ===================================================================== */}
      {mode === 'PIN' && (
        <div style={{
          padding: '16px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.15))',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Lock size={26} color="#eab308" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
              Code PIN Propriétaire
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px' }}>
              Entrez votre code secret à 4 chiffres (PIN par défaut : <strong>2026</strong>)
            </p>

            {/* 4 Points indicateurs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', margin: '14px 0' }}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: pin.length > idx ? '#eab308' : 'rgba(255, 255, 255, 0.12)',
                    boxShadow: pin.length > idx ? '0 0 12px rgba(234, 179, 8, 0.6)' : 'none',
                    transition: 'all 0.15s'
                  }}
                />
              ))}
            </div>

            {errorMsg && (
              <p style={{ color: '#fca5a5', fontSize: '12px', margin: '4px 0' }}>{errorMsg}</p>
            )}
          </div>

          {/* Clavier numérique 1-9 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            maxWidth: '280px',
            margin: '0 auto 12px'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinPress(num.toString())}
                style={{
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.15s'
                }}
              >
                {num}
              </button>
            ))}

            <div />
            <button
              type="button"
              onClick={() => handlePinPress('0')}
              style={{
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '20px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin((prev) => prev.slice(0, -1))}
              style={{
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: 'none',
                color: '#94a3b8',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Effacer
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setMode('EMAIL');
                setErrorMsg('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#c084fc',
                fontSize: '12.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Mail size={13} />
              <span>Préférer la connexion par Email & Code OTP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
