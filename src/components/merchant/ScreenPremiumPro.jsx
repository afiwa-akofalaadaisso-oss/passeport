import React, { useState } from 'react';
import { ChevronLeft, Check, Sparkles, Crown, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ScreenPremiumPro({ onBack }) {
  const [trialEnabled, setTrialEnabled] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(ellipse at top, #0f1c30 0%, #0d0f15 70%, #08080a 100%)',
      color: '#ffffff',
      overflowY: 'auto',
      padding: 'calc(12px + env(safe-area-inset-top, 0px)) 20px max(18px, env(safe-area-inset-bottom, 18px))',
      boxSizing: 'border-box'
    }} className="clean-scrollbar animate-fade">
      {/* 1. TOP NAVIGATION */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '20px'
      }}>
        <button
          onClick={onBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer'
          }}
          title="Retour"
        >
          <ChevronLeft size={20} />
        </button>

        <span style={{
          fontSize: '0.94rem',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.9)',
          letterSpacing: '-0.01em'
        }}>
          Premium
        </span>

        <div style={{ width: '36px' }} /> {/* Spacer */}
      </div>

      {/* 2. HERO HEADLINE */}
      <div style={{ textAlign: 'center', margin: '6px 0 22px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '1.75rem',
          fontWeight: '800',
          lineHeight: '1.22',
          color: '#ffffff',
          letterSpacing: '-0.02em'
        }}>
          Unlock Smarter<br />AI Chats & Audits
        </h1>
        <p style={{
          margin: '8px 0 0',
          fontSize: '0.82rem',
          color: 'rgba(255, 255, 255, 0.55)',
          fontWeight: '500'
        }}>
          Smarter AI, stronger conversations & dossier bancaire certifié
        </p>
      </div>

      {/* 3. FREE TRIAL TOGGLE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: '16px',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#ffffff' }}>
          Free Trial Enabled
        </span>

        {/* Toggle Switch */}
        <div
          onClick={() => setTrialEnabled(!trialEnabled)}
          style={{
            width: '46px',
            height: '26px',
            borderRadius: '9999px',
            background: trialEnabled ? '#0070f3' : 'rgba(255, 255, 255, 0.2)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background 0.25s',
            boxShadow: trialEnabled ? '0 0 12px rgba(0, 112, 243, 0.5)' : 'none'
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#ffffff',
            transform: trialEnabled ? 'translateX(20px)' : 'translateX(0px)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>
      </div>

      {/* 4. MAIN SUBSCRIPTION CARD */}
      <div style={{
        background: 'linear-gradient(165deg, rgba(14, 30, 54, 0.8) 0%, rgba(13, 17, 26, 0.95) 100%)',
        border: '1px solid rgba(0, 112, 243, 0.35)',
        borderRadius: '20px',
        padding: '18px 18px',
        marginBottom: '18px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 112, 243, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Price Tag */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: '900', color: '#ffffff' }}>
              $11.99
            </span>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>
              / Month
            </span>
            <span style={{
              marginLeft: 'auto',
              background: 'rgba(0, 112, 243, 0.15)',
              color: '#38bdf8',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '3px 8px',
              borderRadius: '9999px',
              border: '1px solid rgba(56, 189, 248, 0.25)'
            }}>
              ~ 7 500 FCFA
            </span>
          </div>
          <p style={{
            margin: '6px 0 0',
            fontSize: '0.78rem',
            color: 'rgba(255, 255, 255, 0.65)',
            lineHeight: '1.4'
          }}>
            Reach your goals quicker with AI-powered financial auditing and bank tracking.
          </p>
        </div>

        {/* Features Pill */}
        <div style={{
          alignSelf: 'flex-start',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '9999px',
          padding: '4px 12px',
          fontSize: '0.72rem',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.85)',
          marginTop: '4px'
        }}>
          Features
        </div>

        {/* Feature List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#0070f3',
              boxShadow: '0 0 8px #0070f3',
              flexShrink: 0
            }} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
              Chat without limits — anytime, anywhere.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#0070f3',
              boxShadow: '0 0 8px #0070f3',
              flexShrink: 0
            }} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
              Get instant answers, powered by AI & SYSCOHADA.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#0070f3',
              boxShadow: '0 0 8px #0070f3',
              flexShrink: 0
            }} />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
              Bilan SYSCOHADA SMT et éligibilité FONGIP prioritaire.
            </span>
          </div>
        </div>
      </div>

      {/* 5. DISCLAIMER */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.72rem',
        color: 'rgba(255, 255, 255, 0.45)',
        marginBottom: '10px'
      }}>
        Auto-renewable, Cancel anytime
      </div>

      {/* 6. PRIMARY CTA BUTTON */}
      <button
        onClick={() => {
          setSubscribed(true);
          setTimeout(() => onBack(), 1200);
        }}
        style={{
          width: '100%',
          background: subscribed ? '#16a34a' : 'linear-gradient(90deg, #0070f3 0%, #2563eb 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '9999px',
          padding: '14px 20px',
          fontSize: '0.94rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(0, 112, 243, 0.45)',
          transition: 'all 0.25s'
        }}
      >
        {subscribed ? (
          <>
            <Check size={18} />
            <span>Abonnement Pro Actif !</span>
          </>
        ) : (
          <>
            <span>{trialEnabled ? 'Try For Free' : 'Souscrire maintenant'}</span>
            <ArrowRight size={17} />
          </>
        )}
      </button>

      {/* 7. FOOTER LINKS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '18px',
        fontSize: '0.7rem',
        color: 'rgba(255, 255, 255, 0.4)'
      }}>
        <span style={{ cursor: 'pointer' }}>Privacy</span>
        <span>|</span>
        <span style={{ cursor: 'pointer' }}>Terms</span>
        <span>|</span>
        <span style={{ cursor: 'pointer' }}>Restore</span>
      </div>
    </div>
  );
}
