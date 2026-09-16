import React, { useState } from 'react';
import './Company.css';

function Company() {
  // Estado para controlar a aba selecionada (Opção A)
  const [activeTab, setActiveTab] = useState('kpis');

  // Estado local para os dados do perfil corporativo (Etapa 1: Front-end demonstrativo)
  const [formData, setFormData] = useState({
    razaoSocial: 'Pará Lanches Comércio de Alimentos LTDA',
    nomeFantasia: 'Pará Lanches',
    cnpj: '34.567.890/0001-12',
    categoria: 'Lanchonete',
    telefone: '(16) 3376-9659',
    places: 'Av. Dr. Carlos Botelho, 1551 - Centro, São Carlos - SP',
    sobre: 'O Pará Lanches é referência em lanches artesanais, atendimento acolhedor e refeições rápidas de qualidade na região central.'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div id="company-page">
      <div className="company-container">
        
        {/* 1. Header Bar com Marca Voyage e Ações */}
        <header className="company-header-bar">
          <div className="company-logo-area">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 4L12 20L20 4L15 4L12 11L9 4L4 4Z" fill="#5c4df2" />
            </svg>
            <span className="company-logo-text">Voyage<span>.</span></span>
          </div>

          <div className="company-header-actions">
            <button className="header-icon-btn" title="Notificações" aria-label="Notificações">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button className="header-icon-btn" title="Configurações" aria-label="Configurações">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </header>

        {/* 2. Hero da Organização / Foto / Título e Selo Verificado */}
        <section className="company-hero">
          <div className="avatar-wrapper">
            <div className="company-avatar">
              <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="avatar-badge-edit" title="Alterar Logotipo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>

          <div className="company-title-area">
            <h1 className="company-name">{formData.nomeFantasia}</h1>
            <span className="verified-badge" title="Empresa Verificada">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </span>
          </div>

          <p className="company-subtitle">{formData.razaoSocial}</p>

          <div className="company-meta-tags">
            <span className="meta-tag">{formData.categoria}</span>
            <div className="meta-rating">
              <span className="star">★</span>
              <span>4.8/5</span>
            </div>
            <span className="meta-tag">ID: #0042</span>
          </div>
        </section>

        {/* 3. Navegação em Abas no Padrão Voyage (Sushifan / Tabajara) */}
        <nav className="company-tabs-nav" aria-label="Navegação do Módulo Empresa">
          <button
            className={`tab-btn ${activeTab === 'kpis' ? 'active' : ''}`}
            onClick={() => setActiveTab('kpis')}
          >
            Visão Geral & KPIs
          </button>
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Perfil Corporativo
          </button>
          <button
            className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Equipe & Acessos
          </button>
          <button
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Assinatura & Plano
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Segurança
          </button>
        </nav>

        {/* 4. Conteúdo Dinâmico por Aba */}
        <main className="company-tab-content">
          
          {/* ABA 1: VISÃO GERAL & KPIS */}
          {activeTab === 'kpis' && (
            <>
              <div className="company-card">
                <div className="card-header">
                  <span className="card-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Painel Executivo da Empresa
                  </span>
                  <span className="card-action-link">Este mês</span>
                </div>

                <div className="kpi-grid">
                  <div className="kpi-box">
                    <span className="kpi-label">Volume de Operações</span>
                    <span className="kpi-value">R$ 48.250</span>
                    <span className="kpi-growth positive">▲ +12.4% vs mês ant.</span>
                  </div>

                  <div className="kpi-box">
                    <span className="kpi-label">Clientes Atendidos</span>
                    <span className="kpi-value">1.420</span>
                    <span className="kpi-growth positive">▲ +8.1% vs mês ant.</span>
                  </div>

                  <div className="kpi-box">
                    <span className="kpi-label">Visualizações no Guia</span>
                    <span className="kpi-value">9.840</span>
                    <span className="kpi-growth positive">▲ +23.0% este mês</span>
                  </div>

                  <div className="kpi-box">
                    <span className="kpi-label">Avaliação Geral</span>
                    <span className="kpi-value">4.8 / 5</span>
                    <span className="kpi-label">455 avaliações</span>
                  </div>
                </div>
              </div>

              <div className="company-card">
                <div className="card-header">
                  <span className="card-title">Status da Conta Corporativa</span>
                </div>
                <p style={{ fontSize: '13px', color: '#9fa8c7', lineHeight: '1.5' }}>
                  Sua empresa possui todos os dados cadastrais atualizados e está visível para milhares de clientes na rede Voyage.
                </p>
                <button className="primary-btn" onClick={() => setActiveTab('profile')}>
                  Editar Informações Cadastrais
                </button>
              </div>
            </>
          )}

          {/* ABA 2: PERFIL CORPORATIVO */}
          {activeTab === 'profile' && (
            <div className="company-card">
              <div className="card-header">
                <span className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Dados Cadastrais da Organização
                </span>
              </div>

              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nome Fantasia</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </span>
                    <input
                      className="form-input"
                      type="text"
                      name="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={handleInputChange}
                      placeholder="Nome de exibição para clientes"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Razão Social</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </span>
                    <input
                      className="form-input"
                      type="text"
                      name="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={handleInputChange}
                      placeholder="Razão Social registrada"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">CNPJ</label>
                    <div className="form-input-wrapper">
                      <input
                        className="form-input"
                        type="text"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleInputChange}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Categoria</label>
                    <div className="form-input-wrapper">
                      <input
                        className="form-input"
                        type="text"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        placeholder="Ex: Lanchonete"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone / WhatsApp Comercial</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
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
                  <label className="form-label">Endereço Principal (Places)</label>
                  <div className="form-input-wrapper">
                    <span className="form-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <input
                      className="form-input"
                      type="text"
                      name="places"
                      value={formData.places}
                      onChange={handleInputChange}
                      placeholder="Endereço da unidade principal"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sobre a Empresa</label>
                  <textarea
                    className="form-textarea"
                    name="sobre"
                    value={formData.sobre}
                    onChange={handleInputChange}
                    placeholder="Breve descrição da sua empresa..."
                  />
                </div>

                <button type="submit" className="primary-btn">
                  Salvar Alterações
                </button>
              </form>
            </div>
          )}

          {/* ABA 3: EQUIPE & NÍVEIS DE ACESSO */}
          {activeTab === 'team' && (
            <div className="company-card">
              <div className="card-header">
                <span className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Gestão de Equipe & Permissões
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#9fa8c7' }}>
                Controle quem pode gerenciar produtos, visualizar faturamento e responder clientes da sua organização.
              </p>

              <div className="team-list">
                <div className="team-item">
                  <div className="team-member-info">
                    <div className="team-avatar">JJ</div>
                    <div>
                      <div className="team-name">João Junior (Você)</div>
                      <div className="team-role">joao00@hotmail.com</div>
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

              <button className="primary-btn">
                + Convidar Novo Colaborador
              </button>
            </div>
          )}

          {/* ABA 4: ASSINATURA & PLANO */}
          {activeTab === 'billing' && (
            <>
              <div className="plan-card">
                <span className="plan-badge">Plano Atual Ativo</span>
                <h2 className="plan-title">Voyage Business PRO</h2>
                <div className="plan-price">R$ 149,90 <span>/ mês</span></div>

                <ul className="plan-features-list">
                  <li className="plan-feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Destaque semanal nas buscas do catálogo
                  </li>
                  <li className="plan-feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Até 5 colaboradores com perfis dedicados
                  </li>
                  <li className="plan-feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Painel com métricas e exportação de relatórios
                  </li>
                  <li className="plan-feature-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Selo oficial de "Empresa Verificada"
                  </li>
                </ul>

                <button className="primary-btn" style={{ marginTop: '10px' }}>
                  Fazer Upgrade para ENTERPRISE
                </button>
              </div>

              <div className="company-card">
                <div className="card-header">
                  <span className="card-title">Faturas Recentes</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #1a2040' }}>
                    <span>Competência 08/2026</span>
                    <span style={{ color: '#4ade80', fontWeight: 600 }}>Pago (R$ 149,90)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #1a2040' }}>
                    <span>Competência 07/2026</span>
                    <span style={{ color: '#4ade80', fontWeight: 600 }}>Pago (R$ 149,90)</span>
                  </div>
                </div>
                <button className="secondary-btn">
                  Gerenciar Meios de Pagamento
                </button>
              </div>
            </>
          )}

          {/* ABA 5: SEGURANÇA & AUDITORIA */}
          {activeTab === 'security' && (
            <div className="company-card">
              <div className="card-header">
                <span className="card-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Políticas de Segurança & Logs
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#171d3d', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Autenticação em 2 Etapas (2FA)</div>
                    <div style={{ fontSize: '12px', color: '#9fa8c7' }}>Exigir 2FA para todos os membros da equipe</div>
                  </div>
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 700 }}>ATIVO</span>
                </div>

                <span className="card-title" style={{ marginTop: '10px' }}>Logs Recentes de Auditoria</span>
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
                      <div className="audit-author">Por: João Junior (Dono)</div>
                    </div>
                    <div className="audit-date">Ontem, 09:15</div>
                  </div>

                  <div className="audit-log-item">
                    <div>
                      <div className="audit-desc">Pagamento da assinatura confirmado</div>
                      <div className="audit-author">Sistema Automático</div>
                    </div>
                    <div className="audit-date">10/09/2026</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* 5. Rodapé de Saída no Padrão do Menu Lateral */}
        <footer className="company-footer">
          <button className="header-icon-btn" title="Voltar ao Catálogo" aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
          <button className="logout-btn">
            Sair
          </button>
        </footer>

      </div>
    </div>
  );
}

export default Company;
