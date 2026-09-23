import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { userService } from '@/services/userService';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
  category?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  activeItem?: string;
  onSelectItem?: (itemKey: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  companyName = 'Pará Lanches',
  category = 'Lanchonete',
  isVerified = true,
  avatarUrl,
  activeItem = 'resumo',
  onSelectItem,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    userService.logout();
    navigate('/login');
  };

  const handleItemClick = (key: string, route?: string) => {
    if (onSelectItem) {
      onSelectItem(key);
    }
    if (route) {
      navigate(route);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop com blur */}
      <div
        className={`voyage-sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Gaveta Lateral (Sidebar) */}
      <aside
        className={`voyage-sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Menu Lateral Principal"
      >
        {/* 1. Header com Logo Voyage */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-logo-v">V</span>
            <span className="sidebar-logo-rest">oyage</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            title="Fechar menu"
            aria-label="Fechar menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 2. Cartão de Perfil / Empresa */}
        <div className="sidebar-profile-card">
          <div className="sidebar-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={companyName} className="sidebar-avatar-img" />
            ) : (
              <svg className="sidebar-avatar-silhouette" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <h2 className="sidebar-company-name">{companyName}</h2>
          <p className="sidebar-category">{category}</p>
          {isVerified && (
            <div className="sidebar-verified-badge">
              <span>Verificado</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          )}
        </div>

        {/* 3. Lista de Navegação Fiel à Captura */}
        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeItem === 'resumo' ? 'active' : ''}`}
            onClick={() => handleItemClick('resumo', '/company')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </span>
            <span>Resumo</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'catalogo' ? 'active' : ''}`}
            onClick={() => handleItemClick('catalogo')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span>Catálogo/Produtos</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'ofertas' ? 'active' : ''}`}
            onClick={() => handleItemClick('ofertas')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            <span>Ofertas e Promoções</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'avaliacoes' ? 'active' : ''}`}
            onClick={() => handleItemClick('avaliacoes')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span>Avaliações</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'desempenho' ? 'active' : ''}`}
            onClick={() => handleItemClick('desempenho', '/company')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <span>Desempenho</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'mensagens' ? 'active' : ''}`}
            onClick={() => handleItemClick('mensagens')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <span>Mensagens</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'perfil' ? 'active' : ''}`}
            onClick={() => handleItemClick('perfil', '/editar-perfil')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span>Editar Perfil</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'assinatura' ? 'active' : ''}`}
            onClick={() => handleItemClick('assinatura', '/payment')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </span>
            <span>Assinatura (Voyage+)</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeItem === 'mapa' ? 'active' : ''}`}
            onClick={() => handleItemClick('mapa', '/map')}
          >
            <span className="sidebar-nav-icon">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span>Mapa & Endereços</span>
          </button>
        </nav>

        {/* 4. Rodapé com Botão Voltar e Sair */}
        <div className="sidebar-footer">
          <button
            className="sidebar-back-btn"
            onClick={onClose}
            title="Voltar / Fechar"
            aria-label="Voltar / Fechar"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 14 4 9 9 4" />
              <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
            </svg>
          </button>

          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
