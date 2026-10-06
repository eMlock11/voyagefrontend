import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  User,
  Sliders,
  Shield,
  Building2,
  Laptop,
  CheckCircle,
  ExternalLink,
  Save,
  KeyRound,
  LogOut,
  Sparkles
} from 'lucide-react';
import { userService } from '../../services/userService';
import './Configuracoes.css';

interface UserData {
  id?: number | string;
  name?: string;
  email?: string;
  type?: 'client' | 'owner' | 'admin' | string;
  signature?: string;
  phone?: string;
  cpf?: string;
  profileImage?: string;
}

export default function Configuracoes() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'conta' | 'preferencias' | 'seguranca' | 'empresa'>('conta');
  
  // Feedback visual
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Estados de Preferências
  const [preferences, setPreferences] = useState({
    searchRadius: localStorage.getItem('voyage_search_radius') || '10',
    autoGps: localStorage.getItem('voyage_auto_gps') !== 'false',
    mapStyle: localStorage.getItem('voyage_map_style') || 'streets',
    pushNotifications: localStorage.getItem('voyage_push_notify') !== 'false',
    emailDigest: localStorage.getItem('voyage_email_digest') === 'true',
    businessVisibility: localStorage.getItem('voyage_biz_visible') !== 'false',
  });

  // Estados de Senha
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const user = userService.getCurrentUser();
    if (user) {
      // Complementar com dados de perfil do storage se existirem
      const savedProfile = localStorage.getItem('user_profile_data');
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          setCurrentUser({ ...user, ...parsed });
        } catch {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(user);
      }
    }
  }, []);

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(`voyage_${key}`, String(value));
      return updated;
    });
  };

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setFeedbackMessage('Preferências salvas com sucesso!');
    setTimeout(() => {
      setSaveSuccess(false);
      setFeedbackMessage(null);
    }, 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordState.currentPassword) {
      alert('Por favor, informe a senha atual.');
      return;
    }
    if (passwordState.newPassword.length < 8) {
      alert('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert('A confirmação de senha não confere.');
      return;
    }

    try {
      if (!currentUser?.id) {
        alert('Usuário não autenticado.');
        return;
      }
      setLoading(true);
      await userService.updateUser(currentUser.id, {
        password: passwordState.newPassword,
      });

      setSaveSuccess(true);
      setFeedbackMessage('Senha atualizada com sucesso no servidor!');
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setSaveSuccess(false);
        setFeedbackMessage(null);
      }, 3000);
    } catch (err: any) {
      setSaveSuccess(false);
      setFeedbackMessage(err.message || 'Erro ao atualizar senha no servidor.');
      alert(err.message || 'Erro ao atualizar senha no servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (currentUser?.type === 'owner') {
      navigate('/company');
    } else if (currentUser?.type === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const isOwnerOrAdmin = currentUser?.type === 'owner' || currentUser?.type === 'admin';

  return (
    <div className="settings-page-container">
      {/* Header Superior */}
      <header className="settings-header">
        <div className="settings-header-left">
          <button
            className="settings-back-btn"
            onClick={handleGoBack}
            title="Voltar ao Painel"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="settings-title-group">
            <h1>
              <Settings size={22} color="var(--voyage-accent-primary, #6366f1)" />
              Configurações
            </h1>
            <p>Gerencie suas preferências de aplicativo, segurança e conta</p>
          </div>
        </div>

        <div className="settings-header-actions">
          {currentUser?.type && (
            <span className={`settings-role-badge ${currentUser.type}`}>
              {currentUser.type === 'owner'
                ? 'Empresário'
                : currentUser.type === 'admin'
                ? 'Administrador'
                : 'Cliente'}
            </span>
          )}
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="settings-main">
        {/* Navegação Lateral de Abas */}
        <aside className="settings-nav-sidebar">
          <button
            className={`settings-tab-btn ${activeTab === 'conta' ? 'active' : ''}`}
            onClick={() => setActiveTab('conta')}
          >
            <User size={18} />
            <span>Conta & Perfil</span>
          </button>

          <button
            className={`settings-tab-btn ${activeTab === 'preferencias' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferencias')}
          >
            <Sliders size={18} />
            <span>Preferências & Mapa</span>
          </button>

          <button
            className={`settings-tab-btn ${activeTab === 'seguranca' ? 'active' : ''}`}
            onClick={() => setActiveTab('seguranca')}
          >
            <Shield size={18} />
            <span>Segurança & Senha</span>
          </button>

          {isOwnerOrAdmin && (
            <button
              className={`settings-tab-btn ${activeTab === 'empresa' ? 'active' : ''}`}
              onClick={() => setActiveTab('empresa')}
            >
              <Building2 size={18} />
              <span>Dados da Empresa</span>
            </button>
          )}
        </aside>

        {/* Área de Visualização da Aba */}
        <section className="settings-content-area">
          {feedbackMessage && (
            <div className={`settings-alert ${saveSuccess ? 'success' : 'info'}`}>
              <CheckCircle size={18} />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* ABA 1: CONTA & PERFIL */}
          {activeTab === 'conta' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h2>Dados da Conta Pessoal</h2>
                <p>Informações principais de acesso e identificação no Voyage</p>
              </div>

              <div className="profile-overview-box">
                <div className="profile-avatar-circle">
                  {currentUser?.profileImage ? (
                    <img src={currentUser.profileImage} alt="Foto de Perfil" />
                  ) : (
                    <span>{currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
                <div className="profile-overview-details">
                  <h3>{currentUser?.name || 'Usuário Voyage'}</h3>
                  <p>{currentUser?.email || 'email@exemplo.com'}</p>
                </div>
              </div>

              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={currentUser?.name || ''}
                    disabled
                  />
                </div>

                <div className="settings-form-group">
                  <label>E-mail Cadastrado</label>
                  <input
                    type="email"
                    className="settings-input"
                    value={currentUser?.email || ''}
                    disabled
                  />
                </div>

                <div className="settings-form-group">
                  <label>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={currentUser?.phone || '(Não informado)'}
                    disabled
                  />
                </div>

                <div className="settings-form-group">
                  <label>Plano Atual</label>
                  <input
                    type="text"
                    className="settings-input"
                    value={currentUser?.signature === 'PREMIUM' ? 'Voyage+ (Premium)' : 'Básico (Gratuito)'}
                    disabled
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button
                  className="settings-btn-primary"
                  onClick={() => navigate('/editar-perfil')}
                >
                  <User size={16} />
                  <span>Editar Perfil Completo</span>
                </button>

                <button
                  className="settings-btn-secondary"
                  onClick={() => navigate('/payment')}
                >
                  <Sparkles size={16} />
                  <span>Gerenciar Assinatura</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 2: PREFERÊNCIAS & MAPA */}
          {activeTab === 'preferencias' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h2>Experiência de Navegação & Mapa</h2>
                <p>Personalize os parâmetros de geolocalização e interface</p>
              </div>

              {/* Raio do Mapa */}
              <div className="settings-item-row">
                <div className="settings-item-info">
                  <h4>Raio Padrão de Busca no Mapa</h4>
                  <p>Distância máxima inicial para localizar parceiros e estabelecimentos</p>
                </div>
                <select
                  className="settings-select"
                  value={preferences.searchRadius}
                  onChange={(e) => handlePreferenceChange('search_radius', e.target.value)}
                >
                  <option value="2">Até 2 km (Muito Perto)</option>
                  <option value="5">Até 5 km (Bairro)</option>
                  <option value="10">Até 10 km (Cidade)</option>
                  <option value="25">Até 25 km (Regional)</option>
                </select>
              </div>

              {/* GPS Automático */}
              <div className="settings-item-row">
                <div className="settings-item-info">
                  <h4>Localização por GPS Automático</h4>
                  <p>Centralizar o mapa automaticamente ao abrir a rota de exploração</p>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.autoGps}
                    onChange={(e) => handlePreferenceChange('auto_gps', e.target.checked)}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>

              {/* Notificações no App */}
              <div className="settings-item-row">
                <div className="settings-item-info">
                  <h4>Notificações de Atividades</h4>
                  <p>Receber alertas visuais de novas atualizações e avisos do sistema</p>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => handlePreferenceChange('push_notify', e.target.checked)}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button className="settings-btn-primary" onClick={handleSavePreferences}>
                  <Save size={16} />
                  <span>Salvar Preferências</span>
                </button>
              </div>
            </div>
          )}

          {/* ABA 3: SEGURANÇA & SENHA */}
          {activeTab === 'seguranca' && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h2>Segurança da Conta</h2>
                <p>Altere suas credenciais de acesso e visualize sessões ativas</p>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="settings-form-grid">
                  <div className="settings-form-group full-width">
                    <label>Senha Atual</label>
                    <input
                      type="password"
                      className="settings-input"
                      placeholder="••••••••••••"
                      value={passwordState.currentPassword}
                      onChange={(e) =>
                        setPasswordState({ ...passwordState, currentPassword: e.target.value })
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Nova Senha</label>
                    <input
                      type="password"
                      className="settings-input"
                      placeholder="Mínimo 8 caracteres"
                      value={passwordState.newPassword}
                      onChange={(e) =>
                        setPasswordState({ ...passwordState, newPassword: e.target.value })
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Confirmar Nova Senha</label>
                    <input
                      type="password"
                      className="settings-input"
                      placeholder="Repita a nova senha"
                      value={passwordState.confirmPassword}
                      onChange={(e) =>
                        setPasswordState({ ...passwordState, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" className="settings-btn-primary" disabled={loading}>
                    <KeyRound size={16} />
                    <span>{loading ? 'Atualizando...' : 'Atualizar Senha'}</span>
                  </button>
                </div>
              </form>

              <div style={{ marginTop: '36px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: '#ffffff' }}>
                  Sessões Ativas
                </h3>

                <div className="active-session-item">
                  <div className="session-info">
                    <div className="session-icon">
                      <Laptop size={20} />
                    </div>
                    <div className="session-texts">
                      <h5>
                        Navegador Web (Sessão Atual)
                        <span className="session-badge-current">Ativo Agora</span>
                      </h5>
                      <p>Acesso recente via token de autenticação seguro</p>
                    </div>
                  </div>

                  <button
                    className="settings-btn-danger"
                    onClick={() => {
                      userService.logout();
                      navigate('/login');
                    }}
                  >
                    <LogOut size={16} />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: EMPRESA & NEGÓCIOS (Owner/Admin) */}
          {activeTab === 'empresa' && isOwnerOrAdmin && (
            <div className="settings-card">
              <div className="settings-card-header">
                <h2>Configurações Corporativas</h2>
                <p>Parâmetros operacionais do seu estabelecimento no Voyage</p>
              </div>

              <div className="settings-item-row">
                <div className="settings-item-info">
                  <h4>Visibilidade no Catálogo & Mapa</h4>
                  <p>Permitir que clientes encontrem seu estabelecimento nas buscas</p>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.businessVisibility}
                    onChange={(e) =>
                      handlePreferenceChange('biz_visible', e.target.checked)
                    }
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>

              <div className="settings-item-row">
                <div className="settings-item-info">
                  <h4>Painel Completo do Estabelecimento</h4>
                  <p>Acesse o gerenciamento de equipe, faturamento, KPIs e perfil da empresa</p>
                </div>
                <button
                  className="settings-btn-secondary"
                  onClick={() => navigate('/company')}
                >
                  <ExternalLink size={16} />
                  <span>Abrir Painel da Empresa</span>
                </button>
              </div>

              <div className="settings-item-row">
                <div className="settings-item-info">
                  <h4>Planos e Cobrança</h4>
                  <p>Gerencie o plano empresarial, métodos de pagamento e faturas</p>
                </div>
                <button
                  className="settings-btn-primary"
                  onClick={() => navigate('/payment')}
                >
                  <Sparkles size={16} />
                  <span>Ver Faturamento</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
