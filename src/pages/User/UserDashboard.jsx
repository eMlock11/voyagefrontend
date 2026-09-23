import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { userService } from '../../services/userService';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Compass,
  Menu,
  Bell,
  Settings,
  MapPin,
  Heart,
  Navigation,
  Star,
  Sparkles,
  LogOut,
  User,
  ExternalLink,
  Clock,
  Compass as ExploreIcon
} from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUser = userService.getCurrentUser();

  const handleLogout = () => {
    userService.logout();
    navigate('/login');
  };

  return (
    <div id="user-dashboard-page">
      {/* Sidebar Integrada */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeItem="resumo"
      />

      <div className="user-dashboard-container">
        {/* Header Bar */}
        <header className="user-header-bar">
          <div className="user-header-left">
            <button
              className="header-icon-btn"
              onClick={() => setIsSidebarOpen(true)}
              title="Abrir Menu de Navegação"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={22} />
            </button>
            <div className="user-logo-area">
              <Compass className="user-brand-icon" size={26} />
              <span className="user-logo-text">Voyage<span>.</span></span>
            </div>
            <div className="header-divider"></div>
            <span className="header-module-name">Meu Resumo</span>
          </div>

          <div className="user-header-actions">
            <button
              className="btn-quick-map"
              onClick={() => navigate('/map')}
              title="Explorar Mapa"
            >
              <MapPin size={16} />
              <span>Explorar Mapa</span>
            </button>
            <button className="header-icon-btn" title="Notificações" aria-label="Notificações">
              <Bell size={19} />
            </button>
            <ThemeToggle className="header-icon-btn" />
            <button
              className="header-icon-btn"
              onClick={() => navigate('/configuracoes')}
              title="Configurações da Conta"
              aria-label="Configurações"
            >
              <Settings size={19} />
            </button>
            <button
              className="btn-header-logout"
              onClick={handleLogout}
              title="Sair da Conta"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Hero do Usuário / Boas-vindas */}
        <section className="user-hero-card">
          <div className="user-hero-info">
            <div className="user-avatar-large">
              {currentUser?.name
                ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                : 'U'}
            </div>
            <div>
              <h1 className="user-greeting">
                Olá, {currentUser?.name || 'Viajante'}!
                <span className="user-badge-role">Usuário</span>
              </h1>
              <p className="user-email-text">{currentUser?.email || 'usuario@voyage.com'}</p>
            </div>
          </div>

          <div className="user-hero-actions">
            <button className="btn-hero-action primary" onClick={() => navigate('/map')}>
              <MapPin size={16} />
              <span>Abrir Mapa Interativo</span>
            </button>
            <button className="btn-hero-action secondary" onClick={() => navigate('/editar-perfil')}>
              <User size={16} />
              <span>Editar Perfil</span>
            </button>
          </div>
        </section>

        {/* Cards de Métricas do Usuário */}
        <section className="user-grid-section">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper">
                <Navigation size={22} />
              </div>
              <span className="stat-label">Rotas Criadas</span>
            </div>
            <div className="stat-value">12</div>
            <span className="stat-label">Última rota hoje</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper">
                <Heart size={22} />
              </div>
              <span className="stat-label">Favoritos</span>
            </div>
            <div className="stat-value">8</div>
            <span className="stat-label">Locais salvos</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper">
                <Star size={22} />
              </div>
              <span className="stat-label">Avaliações</span>
            </div>
            <div className="stat-value">5</div>
            <span className="stat-label">Média 4.9 ★ dada</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper">
                <Sparkles size={22} />
              </div>
              <span className="stat-label">Plano Voyage</span>
            </div>
            <div className="stat-value" style={{ fontSize: '20px', color: '#a5b4fc' }}>Gratuito</div>
            <span className="stat-label">Desbloqueie o Voyage+</span>
          </div>
        </section>

        {/* Grid de 2 Colunas */}
        <div className="user-dashboard-columns">
          {/* Painel de Locais Favoritos / Recentes */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <Heart size={20} className="text-red-400" />
                Lugares Salvos & Recentes
              </h2>
              <button
                className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                onClick={() => navigate('/map')}
              >
                <span>Ver no Mapa</span>
                <ExternalLink size={14} />
              </button>
            </div>

            <div className="places-list">
              <div className="place-item">
                <div className="place-info">
                  <div className="place-icon-bubble">
                    <ExploreIcon size={20} />
                  </div>
                  <div>
                    <h3 className="place-name">Pará Lanches</h3>
                    <p className="place-cat">Lanchonete • 1.2 km de você</p>
                  </div>
                </div>
                <div className="place-badge-rating">
                  <Star size={14} fill="#facc15" />
                  <span>4.8</span>
                </div>
              </div>

              <div className="place-item">
                <div className="place-info">
                  <div className="place-icon-bubble">
                    <ExploreIcon size={20} />
                  </div>
                  <div>
                    <h3 className="place-name">Pizzaria Bella Napoli</h3>
                    <p className="place-cat">Pizzaria • 2.5 km de você</p>
                  </div>
                </div>
                <div className="place-badge-rating">
                  <Star size={14} fill="#facc15" />
                  <span>4.9</span>
                </div>
              </div>

              <div className="place-item">
                <div className="place-info">
                  <div className="place-icon-bubble">
                    <ExploreIcon size={20} />
                  </div>
                  <div>
                    <h3 className="place-name">Drogaria São Paulo</h3>
                    <p className="place-cat">Farmácia • 800 m de você</p>
                  </div>
                </div>
                <div className="place-badge-rating">
                  <Star size={14} fill="#facc15" />
                  <span>4.7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lateral: Promoção Voyage+ & Atividade */}
          <div className="flex flex-col gap-5">
            <div className="voyage-plus-promo">
              <span className="promo-tag">Experiência Completa</span>
              <h3 className="promo-title">Experimente o Voyage+</h3>
              <p className="promo-desc">
                Tenha navegação sem anúncios, rotas inteligentes em tempo real e cupons de desconto exclusivos nos melhores estabelecimentos.
              </p>
              <button className="btn-promo" onClick={() => navigate('/payment')}>
                <Sparkles size={16} />
                <span>Conhecer Planos Voyage+</span>
              </button>
            </div>

            <div className="dashboard-panel">
              <div className="panel-header">
                <h3 className="panel-title text-sm">
                  <Clock size={16} />
                  Atividade Recente
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                Você pesquisou <strong>Lanchonetes em Belém</strong> hoje às 15:20.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
