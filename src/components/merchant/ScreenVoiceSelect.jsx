import React, { useState } from 'react';
import { ChevronLeft, Check, Crown, Volume2, Sparkles } from 'lucide-react';

export default function ScreenVoiceSelect({ onBack, onSaveVoice }) {
  const [selectedVoiceId, setSelectedVoiceId] = useState('paula');
  const [selectedTone, setSelectedTone] = useState('Excited');
  const [selectedSpeed, setSelectedSpeed] = useState('1.50x');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const voices = [
    {
      id: 'james',
      name: 'James Phillips',
      sub: 'Man · Conseiller PME',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
      isPro: false
    },
    {
      id: 'barbara',
      name: 'Barbara Gordon',
      sub: 'Girl · Guide Création',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces',
      isPro: true
    },
    {
      id: 'paula',
      name: 'Paula Irving',
      sub: 'Girl · Assistante Digitale',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      isPro: false
    },
    {
      id: 'natasha',
      name: 'Natasha Romanoff',
      sub: 'Woman · Experte SYSCOHADA',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
      isPro: false
    },
    {
      id: 'tony',
      name: 'Tony Stark',
      sub: 'Old Man · Analyste Bancaire Senior',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      isPro: true
    }
  ];

  const tones = ['Happy', 'Serious', 'Excited', 'Formal'];
  const speeds = ['0.75x', '1x', '1.25x', '1.50x', '1.75x'];

  const handleApply = () => {
    setIsPlayingPreview(true);
    setTimeout(() => {
      setIsPlayingPreview(false);
      if (onSaveVoice) onSaveVoice({ voiceId: selectedVoiceId, tone: selectedTone, speed: selectedSpeed });
      onBack();
    }, 600);
  };

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
        marginBottom: '16px'
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
          Select Voice
        </span>

        <div style={{ width: '36px' }} /> {/* Spacer */}
      </div>

      {/* 2. SECTION : VOICE TYPE */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)' }}>
            Voice Type
          </span>
          <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.5)', cursor: 'pointer' }}>
            See all
          </span>
        </div>

        {/* List of Voice Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {voices.map((v) => {
            const isSelected = selectedVoiceId === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVoiceId(v.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isSelected ? 'rgba(0, 112, 243, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid rgba(0, 112, 243, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 18px rgba(0, 112, 243, 0.25)' : 'none'
                }}
              >
                {/* Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={v.avatar}
                    alt={v.name}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isSelected ? '1.5px solid #0070f3' : '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  />
                  <div>
                    <div style={{
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      color: '#ffffff'
                    }}>
                      {v.name}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                      {v.sub}
                    </div>
                  </div>
                </div>

                {/* Right action / Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Pro Crown */}
                  {v.isPro && (
                    <Crown size={15} color="#eab308" style={{ filter: 'drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))' }} />
                  )}

                  {/* Audio Wave Indicator if selected */}
                  {isSelected && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '16px' }}>
                      <span className="wave-bar-1" style={{ width: '2px', background: '#38bdf8', borderRadius: '2px' }} />
                      <span className="wave-bar-2" style={{ width: '2px', background: '#38bdf8', borderRadius: '2px' }} />
                      <span className="wave-bar-3" style={{ width: '2px', background: '#38bdf8', borderRadius: '2px' }} />
                      <span className="wave-bar-4" style={{ width: '2px', background: '#38bdf8', borderRadius: '2px' }} />
                    </div>
                  )}

                  {/* Blue Checkmark Circle */}
                  {isSelected && (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#0070f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 0 10px rgba(0, 112, 243, 0.6)'
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION : TONE / EMOTION */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '0.84rem',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '8px'
        }}>
          Tone/Emotion
        </div>

        {/* Pills row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {tones.map((t) => {
            const isActive = selectedTone === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTone(t)}
                style={{
                  background: isActive ? '#0070f3' : 'rgba(255, 255, 255, 0.05)',
                  border: isActive ? '1px solid #0070f3' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  padding: '7px 16px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 0 14px rgba(0, 112, 243, 0.5)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SECTION : SPEED */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{
          fontSize: '0.84rem',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '8px'
        }}>
          Speed
        </div>

        {/* Pills row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '6px'
        }}>
          {speeds.map((s) => {
            const isActive = selectedSpeed === s;
            return (
              <button
                key={s}
                onClick={() => setSelectedSpeed(s)}
                style={{
                  flex: 1,
                  background: isActive ? '#0070f3' : 'rgba(255, 255, 255, 0.05)',
                  border: isActive ? '1px solid #0070f3' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  padding: '7px 0',
                  textAlign: 'center',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 0 14px rgba(0, 112, 243, 0.5)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. LARGE CTA BUTTON : GENERATE */}
      <button
        onClick={handleApply}
        style={{
          width: '100%',
          marginTop: 'auto',
          background: 'linear-gradient(90deg, #0070f3 0%, #2563eb 100%)',
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
        <Volume2 size={17} />
        <span>{isPlayingPreview ? 'Configuration appliquée...' : 'Generate & Activer la Voix'}</span>
      </button>
    </div>
  );
}
