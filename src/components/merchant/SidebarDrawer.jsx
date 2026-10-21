import React, { useState } from 'react';
import { 
  Search, 
  Image as ImageIcon, 
  BookOpen, 
  Folder, 
  Clock, 
  Grid, 
  MessageSquare, 
  PenSquare, 
  Settings, 
  X,
  Pin,
  ChevronRight,
  Sparkles,
  Crown
} from 'lucide-react';

export default function SidebarDrawer({ 
  isOpen, 
  onClose, 
  onNewChat, 
  onSelectChat, 
  onOpenSettings,
  onOpenPro,
  onOpenBilanSheet,
  operatorName = 'Wave'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'light'

  if (!isOpen) return null;

  // Conversations épinglées
  const pinnedChats = [
    { id: 'rec-bilan-10', title: '📋 Formulaire 10 Certifié (Rose / Orange)' },
    { id: 'pin-1', title: 'Dossier certifié Wave & NINEA (ETS Diallo)' }
  ];

  // Conversations récentes (historique d'audit)
  const recentChats = [
    { id: 'rec-1', title: `Audit des flux ${operatorName} 12 mois` },
    { id: 'rec-2', title: 'Carnet de caisse & Calcul marge nette' },
    { id: 'rec-3', title: 'Validation RCCM & Attestation NINEA' },
    { id: 'rec-4', title: 'Bilan Comptable SYSCOHADA SMT & DSCR' },
    { id: 'rec-5', title: 'Garantie FONGIP & Dossier Bancaire' },
    { id: 'rec-6', title: 'Simulation crédit de trésorerie PME' }
  ];

  const filteredRecents = searchQuery.trim()
    ? recentChats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : recentChats;

  const isLight = themeMode === 'light';

  // Couleurs selon mode clair (ChatGPT original) ou sombre
  const bg = isLight ? '#ffffff' : '#18181c';
  const textPrimary = isLight ? '#0f172a' : '#ffffff';
  const textSecondary = isLight ? '#64748b' : 'rgba(255, 255, 255, 0.6)';
  const borderCol = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
  const hoverBg = isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)';
  const itemIconColor = isLight ? '#334155' : 'rgba(255, 255, 255, 0.85)';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      display: 'flex'
    }}>
      {/* 1. BACKDROP / SCRIM (Click to close) */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease forwards'
        }}
      />

      {/* 2. SLIDING SIDEBAR DRAWER (Style exact ChatGPT Mobile) */}
      <div style={{
        position: 'relative',
        width: '82%',
        maxWidth: '340px',
        height: '100%',
        background: bg,
        color: textPrimary,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '10px 0 35px rgba(0, 0, 0, 0.5)',
        zIndex: 95,
        animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        padding: 'calc(14px + env(safe-area-inset-top, 0px)) 16px max(16px, env(safe-area-inset-bottom, 16px))',
        boxSizing: 'border-box'
      }}>
        {/* HEADER : Titre "ChatGPT" + Loupe Recherche 🔍 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          borderBottom: `1px solid ${borderCol}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '1.38rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              color: textPrimary
            }}>
              ChatGPT
            </span>
            <span style={{
              background: '#0070f3',
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: '800',
              padding: '2px 6px',
              borderRadius: '6px'
            }}>
              PME
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Bouton Recherche */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${borderCol}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: itemIconColor,
                cursor: 'pointer'
              }}
              title="Rechercher"
            >
              <Search size={18} />
            </button>

            {/* Bouton Fermer */}
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${borderCol}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: itemIconColor,
                cursor: 'pointer'
              }}
              title="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Champ de recherche déroulant */}
        {showSearchInput && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans l'historique..."
              autoFocus
              style={{
                width: '100%',
                background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${borderCol}`,
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '0.82rem',
                color: textPrimary,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* ZONE SCROLLABLE : MENU PRINCIPAL + ÉPINGLÉS + RÉCENTS */}
        <div 
          className="clean-scrollbar"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            paddingTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* 1. LISTE DE NAVIGATION PRINCIPALE (Exacte capture ChatGPT) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Formulaire 10 Officiel Certifié */}
            <div
              onClick={() => {
                if (onOpenBilanSheet) onOpenBilanSheet();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: isLight 
                  ? 'linear-gradient(90deg, rgba(236, 72, 153, 0.08) 0%, rgba(249, 115, 22, 0.08) 100%)'
                  : 'linear-gradient(90deg, rgba(236, 72, 153, 0.16) 0%, rgba(249, 115, 22, 0.16) 100%)',
                border: '1.5px solid rgba(236, 72, 153, 0.4)',
                color: textPrimary,
                transition: 'all 0.2s',
                marginBottom: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ec4899';
                e.currentTarget.style.transform = 'translateX(2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(236, 72, 153, 0.35)'
              }}>
                <Sparkles size={15} color="#ffffff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: textPrimary, letterSpacing: '-0.01em' }}>
                  Formulaire 10 Certifié
                </div>
                <div style={{ fontSize: '0.70rem', color: '#ec4899', fontWeight: '700' }}>
                  Bilan SMT · Actif Rose & Passif Orange
                </div>
              </div>
            </div>

            {/* Images */}
            <div
              onClick={() => { onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: textPrimary,
                fontSize: '0.92rem',
                fontWeight: '600',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ImageIcon size={20} color={itemIconColor} />
              <span>Images & Pièces</span>
            </div>

            {/* Bibliothèque */}
            <div
              onClick={() => { onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: textPrimary,
                fontSize: '0.92rem',
                fontWeight: '600',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <BookOpen size={20} color={itemIconColor} />
              <span>Bibliothèque SYSCOHADA</span>
            </div>

            {/* Projets */}
            <div
              onClick={() => { onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: textPrimary,
                fontSize: '0.92rem',
                fontWeight: '600',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Folder size={20} color={itemIconColor} />
              <span>Projets & Dossiers PME</span>
            </div>

            {/* Planifié */}
            <div
              onClick={() => { onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: textPrimary,
                fontSize: '0.92rem',
                fontWeight: '600',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Clock size={20} color={itemIconColor} />
              <span>Planifié & Alertes DGI</span>
            </div>

            {/* Explorer */}
            <div
              onClick={() => { onClose(); if (onOpenPro) onOpenPro(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: textPrimary,
                fontSize: '0.92rem',
                fontWeight: '600',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Grid size={20} color={itemIconColor} />
              <span>Explorer les modèles</span>
            </div>
          </div>

          {/* 2. SECTION ÉPINGLÉS (Exacte capture ChatGPT) */}
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: '800',
              color: textSecondary,
              padding: '4px 10px 6px',
              textTransform: 'none'
            }}>
              Épinglés
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {pinnedChats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    if (onSelectChat) onSelectChat(c);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    color: textPrimary,
                    fontWeight: '500',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MessageSquare size={16} color={itemIconColor} style={{ flexShrink: 0 }} />
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {c.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. SECTION RÉCENTS (Exacte capture ChatGPT) */}
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: '800',
              color: textSecondary,
              padding: '4px 10px 6px',
              textTransform: 'none'
            }}>
              Récents
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filteredRecents.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    if (onSelectChat) onSelectChat(c);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    color: textPrimary,
                    fontWeight: '500',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MessageSquare size={16} color={itemIconColor} style={{ flexShrink: 0 }} />
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {c.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. BARRE D'ACTIONS DU BAS FLOTTANTE (Exacte capture ChatGPT) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: `1px solid ${borderCol}`,
          marginTop: 'auto'
        }}>
          {/* Bouton Bleu Vibrant Pilule : [ ✎ Chat ] */}
          <button
            onClick={() => {
              if (onNewChat) onNewChat();
              onClose();
            }}
            style={{
              background: '#0070f3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 112, 243, 0.45)',
              transition: 'transform 0.15s'
            }}
          >
            <PenSquare size={16} />
            <span>Chat</span>
          </button>

          {/* Bouton Paramètres ⚙ (ou Thème) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${borderCol}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: itemIconColor,
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
              title="Basculer Mode Clair / Sombre"
            >
              {isLight ? '🌙' : '☀️'}
            </button>

            <button
              onClick={() => {
                if (onOpenSettings) onOpenSettings();
                onClose();
              }}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${borderCol}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: itemIconColor,
                cursor: 'pointer'
              }}
              title="Paramètres"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
