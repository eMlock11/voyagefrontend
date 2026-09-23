import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PerformanceCharts from './PerformanceCharts';
import './Company.css';
import { companyService } from '../../services/companyService';
import { userService } from '../../services/userService';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Compass,
  Menu,
  Bell,
  Settings,
  BarChart3,
  Building,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Star,
  MapPin,
  TrendingUp,
  ExternalLink,
  LogOut,
  Save,
  PlusCircle,
  Eye,
  Phone,
  FileText
} from 'lucide-react';

function Company() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Estado para controlar a aba lateral (Sidebar)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Estado para controlar a aba selecionada (suporta ?tab=desempenho na URL)
  const initialTab = searchParams.get('tab') || 'kpis';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sincronizar activeTab quando o parâmetro da URL mudar
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const currentUser = userService.getCurrentUser();
  const isOwner = currentUser?.type === 'owner';

  // ID da empresa no banco de dados (se já carregada ou criada)
  const [companyId, setCompanyId] = useState(null);

  // Estados de feedback de API
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error' | 'info', text: string }

  // Estado local para os dados do perfil corporativo da própria empresa
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    categoria: 'Lanchonete',
    telefone: '',
    places: '',
    sobre: ''
  });

  // Função para aplicar os dados de uma empresa selecionada
  const applyCompanyData = (comp) => {
    setCompanyId(comp.id);
    setFormData({
      nomeFantasia: comp.name || '',
      razaoSocial: comp.name || '',
      cnpj: comp.cnpj || '',
      categoria: comp.category || 'Lanchonete',
      telefone: comp.phone || '',
      places: comp.places || '',
      sobre: comp.about || comp.sobre || ''
    });
  };

  // 1. Efeito para buscar os dados da empresa do owner no banco
  useEffect(() => {
    if (!isOwner) {
      setStatusMessage({
        type: 'error',
        text: 'Acesso restrito: Apenas o dono da empresa pode visualizar e alterar os dados corporativos.'
      });
      return;
    }

    async function loadCompanyData() {
      setLoading(true);
      try {
        const storedCompany = localStorage.getItem('user_company');

        if (storedCompany) {
          try {
            const parsed = JSON.parse(storedCompany);
            // Só aplica a empresa do storage se pertencer ao usuário logado atual
            const belongsToUser =
              (parsed.userId && currentUser?.id && parsed.userId === currentUser.id) ||
              (parsed.cnpj && currentUser?.cnpj && parsed.cnpj === currentUser.cnpj) ||
              (parsed.name?.toLowerCase().trim() === currentUser?.name?.toLowerCase().trim());

            if (parsed && belongsToUser && (parsed.id || parsed.name)) {
              applyCompanyData(parsed);
              setLoading(false);
              return;
            } else {
              // Se a empresa no storage for de outro usuário, descarta do storage
              localStorage.removeItem('user_company');
            }
          } catch {
            localStorage.removeItem('user_company');
          }
        }

        const companies = await companyService.getCompanies();
        if (Array.isArray(companies) && companies.length > 0) {
          const myCompany = companies.find(
            (c) =>
              (c.userId && currentUser?.id && c.userId === currentUser.id) ||
              (currentUser?.cnpj && c.cnpj === currentUser.cnpj) ||
              c.name?.toLowerCase().trim() === currentUser?.name?.toLowerCase().trim()
          );

          if (myCompany) {
            applyCompanyData(myCompany);
            localStorage.setItem('user_company', JSON.stringify(myCompany));
          } else {
            setFormData((prev) => ({
              ...prev,
              nomeFantasia: currentUser?.name || '',
              razaoSocial: currentUser?.name || '',
            }));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            nomeFantasia: currentUser?.name || '',
            razaoSocial: currentUser?.name || '',
          }));
        }
      } catch (err) {
        console.warn('Aviso ao carregar dados da empresa:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner]);

  const handleInputChange = (e) => {
    if (!isOwner) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Função para salvar
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOwner) {
      setStatusMessage({
        type: 'error',
        text: 'Permissão negada: Somente o proprietário da empresa pode realizar alterações.'
      });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const payload = {
      name: formData.nomeFantasia || formData.razaoSocial,
      category: formData.categoria || 'Lanchonete',
      cnpj: formData.cnpj,
      evaluate: 4.8,
      places: formData.places || 'Endereço Comercial'
    };

    try {
      if (companyId) {
        const updated = await companyService.updateCompany(companyId, payload);
        localStorage.setItem('user_company', JSON.stringify({ ...formData, id: companyId, ...updated }));
        setStatusMessage({ type: 'success', text: 'Dados da sua empresa atualizados com sucesso!' });
      } else {
        const created = await companyService.createCompany(payload);
        if (created && created.id) {
          setCompanyId(created.id);
          localStorage.setItem('user_company', JSON.stringify(created));
        }
        setStatusMessage({ type: 'success', text: 'Empresa cadastrada e vinculada com sucesso!' });
      }
    } catch (err) {
      console.error('Erro ao salvar empresa:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao persistir os dados da empresa.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="company-page">
      {/* Sidebar Integrada */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        companyName={formData.nomeFantasia || currentUser?.name || 'Pará Lanches'}
        category={formData.categoria || 'Lanchonete'}
        isVerified={true}
        activeItem={activeTab === 'kpis' ? 'resumo' : activeTab === 'desempenho' ? 'desempenho' : activeTab}
        onSelectItem={(itemKey) => {
          if (itemKey === 'resumo') handleTabChange('kpis');
          if (itemKey === 'desempenho') handleTabChange('desempenho');
          if (itemKey === 'catalogo') handleTabChange('profile');
        }}
      />

      <div className="company-container">
        {/* Header Desktop Widescreen */}
        <header className="company-header-bar">
          <div className="company-header-left">
            <button
              className="header-icon-btn menu-toggle"
              onClick={() => setIsSidebarOpen(true)}
              title="Abrir Menu de Navegação"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={22} />
            </button>
            <div className="company-logo-area">
              <Compass className="company-brand-icon" size={26} />
              <span className="company-logo-text">Voyage<span>.</span></span>
            </div>
            <div className="header-divider"></div>
            <span className="header-module-name">Painel Corporativo</span>
          </div>

          <div className="company-header-actions">
            <button 
              className="btn-quick-map"
              onClick={() => navigate('/map')}
              title="Abrir Mapa"
            >
              <MapPin size={16} />
              <span>Ver no Mapa</span>
            </button>
            <button className="header-icon-btn" title="Notificações" aria-label="Notificações">
              <Bell size={19} />
            </button>
            <ThemeToggle className="header-icon-btn" />
            <button
              className="header-icon-btn"
              onClick={() => navigate('/configuracoes')}
              title="Configurações"
              aria-label="Configurações"
            >
              <Settings size={19} />
            </button>
            <button
              className="btn-header-logout"
              onClick={() => {
                userService.logout();
                navigate('/login');
              }}
              title="Sair da Conta"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Banner do Proprietário */}
        <div className="company-owner-banner">
          <div className="owner-banner-info">
            <span className="owner-badge-tag">Proprietário Autenticado</span>
            <span className="company-owner-text">
              Logado como: <strong>{currentUser?.name || 'Sua Empresa'}</strong>
            </span>
          </div>
          <div className="owner-banner-meta">
            <span className="company-owner-badge">
              CNPJ: {formData.cnpj || 'Não cadastrado'}
            </span>
            <span className="voyage-demo-badge">Painel Demo</span>
          </div>
        </div>

        {/* Hero do Estabelecimento */}
        <section className="company-hero">
          <div className="hero-left-col">
            <div className="avatar-wrapper">
              <div className="company-avatar">
                <Building size={42} />
              </div>
            </div>

            <div className="company-title-area">
              <div className="company-name-row">
                <h1 className="company-name">{formData.nomeFantasia || 'Seu Estabelecimento'}</h1>
                <span className="verified-badge" title="Empresa Verificada">
                  <CheckCircle2 size={20} />
                </span>
              </div>
              <p className="company-subtitle">{formData.razaoSocial || 'Razão Social não informada'}</p>
              
              <div className="company-meta-tags">
                <span className="meta-tag category">{formData.categoria}</span>
                <div className="meta-rating">
                  <Star size={15} className="star-icon" />
                  <span>4.8 / 5.0</span>
                </div>
                <span className="meta-tag id">
                  {loading ? 'Carregando...' : companyId ? `ID: #${companyId}` : 'Nova Empresa'}
                </span>
              </div>
            </div>
          </div>

          <div className="hero-right-actions">
            <button 
              className="hero-action-btn primary"
              onClick={() => setActiveTab('profile')}
            >
              <Building size={16} />
              <span>Editar Empresa</span>
            </button>
            <button 
              className="hero-action-btn secondary"
              onClick={() => navigate('/payment')}
            >
              <CreditCard size={16} />
              <span>Planos & Assinatura</span>
            </button>
          </div>
        </section>

        {/* Barra de Abas */}
        <nav className="company-tabs-nav" aria-label="Navegação do Módulo Empresa">
          <button
            className={`tab-btn ${activeTab === 'kpis' ? 'active' : ''}`}
            onClick={() => handleTabChange('kpis')}
          >
            <BarChart3 size={18} />
            <span>Visão Geral & Métricas</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'desempenho' ? 'active' : ''}`}
            onClick={() => handleTabChange('desempenho')}
          >
            <TrendingUp size={18} />
            <span>Desempenho & Gráficos</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <Building size={18} />
            <span>Perfil Corporativo</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => handleTabChange('team')}
          >
            <Users size={18} />
            <span>Equipe & Acessos</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => handleTabChange('billing')}
          >
            <CreditCard size={18} />
            <span>Assinatura & Plano</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            <ShieldCheck size={18} />
            <span>Segurança & Logs</span>
          </button>
        </nav>

        {/* Layout Desktop de 2 Colunas: Conteúdo Principal + Snapshot Lateral */}
        <div className="company-dashboard-layout">
          {/* Coluna Principal Dinâmica */}
          <main className="company-tab-content">

            {/* ABA 0: DESEMPENHO COM GRÁFICOS (DIAS, SEMANAS, MESES E SEMESTRAIS) */}
            {activeTab === 'desempenho' && (
              <div className="tab-pane-content">
                <PerformanceCharts />
              </div>
            )}
            
            {/* ABA 1: VISÃO GERAL & KPIS */}
            {activeTab === 'kpis' && (
              <div className="tab-pane-content">
                <div className="company-card">
                  <div className="card-header">
                    <span className="card-title">
                      <BarChart3 size={20} className="card-title-icon" />
                      Métricas de Desempenho no Catálogo
                    </span>
                    <span className="card-action-link">Últimos 30 dias</span>
                  </div>

                  {/* 4 KPIs em Grid Desktop */}
                  <div className="kpi-grid">
                    <div className="kpi-box">
                      <span className="kpi-label">Volume Estimado</span>
                      <span className="kpi-value">R$ 48.250</span>
                      <span className="kpi-growth positive">
                        <TrendingUp size={14} />
                        +12.4% vs mês ant.
                      </span>
                    </div>

                    <div className="kpi-box">
                      <span className="kpi-label">Clientes Atendidos</span>
                      <span className="kpi-value">1.420</span>
                      <span className="kpi-growth positive">
                        <TrendingUp size={14} />
                        +8.1% vs mês ant.
                      </span>
                    </div>

                    <div className="kpi-box">
                      <span className="kpi-label">Visualizações no Guia</span>
                      <span className="kpi-value">9.840</span>
                      <span className="kpi-growth positive">
                        <Eye size={14} />
                        +23.0% este mês
                      </span>
                    </div>

                    <div className="kpi-box">
                      <span className="kpi-label">Avaliação do Estabelecimento</span>
                      <span className="kpi-value">4.8 / 5.0</span>
                      <span className="kpi-growth">
                        <Star size={14} />
                        455 avaliações
                      </span>
                    </div>
                  </div>
                </div>

                <div className="company-card">
                  <div className="card-header">
                    <span className="card-title">
                      <MapPin size={20} className="card-title-icon" />
                      Presença no Mapa & Visibilidade
                    </span>
                  </div>
                  <p className="card-description">
                    Seu estabelecimento está indexado na base do Voyage e acessível nas buscas por categoria e raio de proximidade.
                  </p>
                  <div className="kpi-actions-row">
                    <button className="primary-btn" onClick={() => setActiveTab('profile')}>
                      <Building size={16} />
                      <span>Atualizar Dados Cadastrais</span>
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/map')}>
                      <ExternalLink size={16} />
                      <span>Ver Visualização no Mapa</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: PERFIL CORPORATIVO */}
            {activeTab === 'profile' && (
              <div className="tab-pane-content">
                <div className="company-card">
                  <div className="card-header">
                    <span className="card-title">
                      <Building size={20} className="card-title-icon" />
                      Dados Cadastrais da Organização
                    </span>
                  </div>

                  {statusMessage && (
                    <div className={`status-banner ${statusMessage.type}`}>
                      <span>{statusMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="company-profile-form">
                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="company-name-input">Nome Fantasia *</label>
                        <div className="form-input-wrapper">
                          <Building className="input-icon" size={18} />
                          <input
                            id="company-name-input"
                            className="form-input"
                            type="text"
                            name="nomeFantasia"
                            value={formData.nomeFantasia}
                            onChange={handleInputChange}
                            placeholder="Nome para exibição pública"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="company-razao-input">Razão Social</label>
                        <div className="form-input-wrapper">
                          <FileText className="input-icon" size={18} />
                          <input
                            id="company-razao-input"
                            className="form-input"
                            type="text"
                            name="razaoSocial"
                            value={formData.razaoSocial}
                            onChange={handleInputChange}
                            placeholder="Razão Social registrada"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="company-cnpj-input">CNPJ *</label>
                        <div className="form-input-wrapper">
                          <FileText className="input-icon" size={18} />
                          <input
                            id="company-cnpj-input"
                            className="form-input"
                            type="text"
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleInputChange}
                            placeholder="00.000.000/0000-00"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="company-cat-select">Categoria *</label>
                        <div className="form-input-wrapper">
                          <select
                            id="company-cat-select"
                            className="form-input form-select"
                            name="categoria"
                            value={formData.categoria}
                            onChange={handleInputChange}
                          >
                            <option value="Lanchonete">Lanchonete</option>
                            <option value="Restaurante">Restaurante</option>
                            <option value="Pizzaria">Pizzaria</option>
                            <option value="Churrascaria">Churrascaria</option>
                            <option value="Supermercado">Supermercado</option>
                            <option value="Farmácia">Farmácia</option>
                            <option value="Serviços">Serviços</option>
                            <option value="Hospital">Hospital</option>
                            <option value="Bar">Bar</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="company-phone-input">Telefone Comercial</label>
                        <div className="form-input-wrapper">
                          <Phone className="input-icon" size={18} />
                          <input
                            id="company-phone-input"
                            className="form-input"
                            type="text"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleInputChange}
                            placeholder="(00) 0000-0000"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="company-places-input">Endereço Principal *</label>
                        <div className="form-input-wrapper">
                          <MapPin className="input-icon" size={18} />
                          <input
                            id="company-places-input"
                            className="form-input"
                            type="text"
                            name="places"
                            value={formData.places}
                            onChange={handleInputChange}
                            placeholder="Rua, número, bairro e cidade"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="company-about-input">Descrição / Sobre a Empresa</label>
                      <textarea
                        id="company-about-input"
                        className="form-textarea"
                        name="sobre"
                        value={formData.sobre}
                        onChange={handleInputChange}
                        placeholder="Descreva seu estabelecimento, diferenciais, horário de funcionamento..."
                        rows={4}
                      />
                    </div>

                    <div className="form-submit-row">
                      <button type="submit" className="primary-btn" disabled={saving}>
                        {saving ? (
                          <span>Salvando dados...</span>
                        ) : (
                          <>
                            <Save size={18} />
                            <span>{companyId ? 'Salvar Alterações' : 'Cadastrar Empresa'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ABA 3: EQUIPE & ACESSOS */}
            {activeTab === 'team' && (
              <div className="tab-pane-content">
                <div className="company-card">
                  <div className="card-header">
                    <span className="card-title">
                      <Users size={20} className="card-title-icon" />
                      Gestão de Equipe & Permissões
                    </span>
                    <button className="secondary-btn small">
                      <PlusCircle size={15} />
                      <span>Convidar Membro</span>
                    </button>
                  </div>

                  <p className="card-description">
                    Controle quem pode gerenciar produtos, visualizar faturamento e responder clientes da sua organização.
                  </p>

                  <div className="team-list">
                    <div className="team-item">
                      <div className="team-member-info">
                        <div className="team-avatar">
                          {currentUser?.name
                            ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                            : 'EU'}
                        </div>
                        <div>
                          <div className="team-name">{currentUser?.name || 'Você'}</div>
                          <div className="team-role">{currentUser?.email || 'proprietario@empresa.com'}</div>
                        </div>
                      </div>
                      <span className="badge-role admin">Proprietário</span>
                    </div>

                    <div className="team-item">
                      <div className="team-member-info">
                        <div className="team-avatar">LC</div>
                        <div>
                          <div className="team-name">Luana Cardoso</div>
                          <div className="team-role">luana.cardoso@email.com</div>
                        </div>
                      </div>
                      <span className="badge-role manager">Gerente</span>
                    </div>

                    <div className="team-item">
                      <div className="team-member-info">
                        <div className="team-avatar">MS</div>
                        <div>
                          <div className="team-name">Marcos Souza</div>
                          <div className="team-role">marcos.op@email.com</div>
                        </div>
                      </div>
                      <span className="badge-role operator">Operacional</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 4: ASSINATURA & PLANO */}
            {activeTab === 'billing' && (
              <div className="tab-pane-content">
                <div className="plan-card">
                  <div className="plan-header-row">
                    <div>
                      <span className="plan-badge">Plano Atual Ativo</span>
                      <h2 className="plan-title">Voyage Business PRO</h2>
                    </div>
                    <div className="plan-price-block">
                      <span className="plan-price">R$ 149,90</span>
                      <span className="plan-period">/ mês</span>
                    </div>
                  </div>

                  <ul className="plan-features-list">
                    <li className="plan-feature-item">
                      <CheckCircle2 size={16} className="feature-check-icon" />
                      Destaque semanal nas buscas do catálogo e mapa
                    </li>
                    <li className="plan-feature-item">
                      <CheckCircle2 size={16} className="feature-check-icon" />
                      Até 5 colaboradores com perfis dedicados
                    </li>
                    <li className="plan-feature-item">
                      <CheckCircle2 size={16} className="feature-check-icon" />
                      Painel com métricas avançadas e exportação
                    </li>
                    <li className="plan-feature-item">
                      <CheckCircle2 size={16} className="feature-check-icon" />
                      Selo oficial de "Empresa Verificada"
                    </li>
                  </ul>

                  <div className="plan-actions-row">
                    <button className="primary-btn" onClick={() => navigate('/payment')}>
                      <CreditCard size={18} />
                      <span>Gerenciar Planos & Pagamentos</span>
                    </button>
                  </div>
                </div>

                <div className="company-card">
                  <div className="card-header">
                    <span className="card-title">Histórico de Faturas</span>
                  </div>
                  <div className="invoice-list">
                    <div className="invoice-row">
                      <span className="invoice-period">Competência 08/2026</span>
                      <span className="invoice-status paid">Pago (R$ 149,90)</span>
                    </div>
                    <div className="invoice-row">
                      <span className="invoice-period">Competência 07/2026</span>
                      <span className="invoice-status paid">Pago (R$ 149,90)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 5: SEGURANÇA */}
            {activeTab === 'security' && (
              <div className="tab-pane-content">
                <div className="company-card">
                  <div className="card-header">
                    <span className="card-title">
                      <ShieldCheck size={20} className="card-title-icon" />
                      Políticas de Segurança & Logs
                    </span>
                  </div>

                  <div className="security-box">
                    <div>
                      <div className="security-title">Autenticação em Duas Etapas (2FA)</div>
                      <div className="security-desc">Camada extra de proteção para o login corporativo</div>
                    </div>
                    <span className="security-status-badge">ATIVO</span>
                  </div>

                  <span className="section-subheading">Logs Recentes de Auditoria</span>
                  <div className="audit-log-list">
                    <div className="audit-log-item">
                      <div>
                        <div className="audit-desc">Alteração de horário de funcionamento</div>
                        <div className="audit-author">Por: Luana Cardoso (Gerente)</div>
                      </div>
                      <div className="audit-date">Hoje, 14:32</div>
                    </div>

                    <div className="audit-log-item">
                      <div>
                        <div className="audit-desc">Acesso com novo dispositivo corporativo</div>
                        <div className="audit-author">Por: {currentUser?.name || 'Dono'}</div>
                      </div>
                      <div className="audit-date">Ontem, 09:15</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* Coluna Lateral: Resumo / Snapshot da Empresa (Desktop) */}
          <aside className="company-sidebar-snapshot">
            <div className="snapshot-card">
              <div className="snapshot-header">
                <span className="snapshot-title">Resumo do Estabelecimento</span>
                <span className="voyage-demo-badge">Ativo</span>
              </div>

              <div className="snapshot-body">
                <div className="snapshot-item">
                  <span className="snapshot-label">Categoria</span>
                  <span className="snapshot-val">{formData.categoria}</span>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-label">Localização</span>
                  <span className="snapshot-val">{formData.places || 'Não informada'}</span>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-label">Telefone</span>
                  <span className="snapshot-val">{formData.telefone || 'Não informado'}</span>
                </div>
                <div className="snapshot-item">
                  <span className="snapshot-label">Status do Perfil</span>
                  <span className="snapshot-val text-success">Verificado ✓</span>
                </div>
              </div>

              <div className="snapshot-actions">
                <button className="snapshot-btn" onClick={() => navigate('/map')}>
                  <MapPin size={16} />
                  <span>Explorar no Mapa</span>
                </button>
                <button className="snapshot-btn" onClick={() => navigate('/payment')}>
                  <CreditCard size={16} />
                  <span>Gerenciar Assinatura</span>
                </button>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
}

export default Company;
