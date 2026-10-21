import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Delete, Sparkles, CheckCircle2 } from 'lucide-react';

const CORRECT_PIN = '2026';

export default function PinLockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === CORRECT_PIN) {
          setSuccess(true);
          setTimeout(() => {
            onUnlock();
          }, 350);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  // Support du clavier physique si utilisé sur PC ou tablette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '430px',
      height: '100%',
      maxHeight: 'min(94vh, 840px)',
      background: '#121215',
      borderRadius: '28px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 1px 1px rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '40px 24px 30px',
      position: 'relative',
      overflow: 'hidden',
      margin: 'auto'
    }}>
      {/* Halo d'ambiance supérieur */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none'
      }} />

      {/* En-tête : Cadenas & Titre */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 2 }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {success ? (
            <CheckCircle2 size={32} color="#4ade80" />
          ) : (
            <Lock size={30} color="#c084fc" />
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Passeport Financier PME
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Accès Privé Sécurisé · Entrez votre code PIN
          </p>
        </div>
      </div>

      {/* Indicateur visuel des 4 points PIN */}
      <div style={{
        display: 'flex',
        gap: '18px',
        margin: '20px 0',
        zIndex: 2,
        transform: error ? 'translateX(-4px)' : 'none',
        transition: 'transform 0.1s ease'
      }}>
        {[0, 1, 2, 3].map((idx) => {
          const isFilled = pin.length > idx;
          return (
            <div
              key={idx}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: error
                  ? '#ef4444'
                  : isFilled
                  ? (success ? '#4ade80' : '#38bdf8')
                  : 'rgba(255, 255, 255, 0.12)',
                border: error
                  ? '2px solid #ef4444'
                  : isFilled
                  ? 'none'
                  : '2px solid rgba(255, 255, 255, 0.25)',
                boxShadow: isFilled
                  ? (success ? '0 0 12px #4ade80' : '0 0 12px #38bdf8')
                  : 'none',
                transition: 'all 0.18s ease'
              }}
            />
          );
        })}
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: '700', marginTop: '-10px', zIndex: 2 }}>
          Code PIN erroné. Réessayez.
        </div>
      )}

      {/* Clavier numérique tactile (style smartphone) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '14px',
        width: '100%',
        maxWidth: '280px',
        zIndex: 2
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#1d1d22',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              fontSize: '1.45rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
              cursor: 'pointer',
              transition: 'background 0.15s, transform 0.1s',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {num}
          </button>
        ))}

        {/* Espace vide à gauche du 0 */}
        <div />

        {/* Touche 0 */}
        <button
          onClick={() => handleKeyPress('0')}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#1d1d22',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#ffffff',
            fontSize: '1.45rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
            cursor: 'pointer',
            transition: 'background 0.15s, transform 0.1s',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          0
        </button>

        {/* Touche Effacer ⌫ */}
        <button
          onClick={handleDelete}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
            cursor: 'pointer'
          }}
          title="Effacer"
        >
          <Delete size={24} />
        </button>
      </div>

      {/* Indication du code par défaut pour le propriétaire */}
      <div style={{
        marginTop: '16px',
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '9999px',
        fontSize: '0.7rem',
        color: 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        zIndex: 2
      }}>
        <Sparkles size={12} color="#c084fc" />
        <span>Code PIN d'accès par défaut : <strong>2026</strong></span>
      </div>
    </div>
  );
}
