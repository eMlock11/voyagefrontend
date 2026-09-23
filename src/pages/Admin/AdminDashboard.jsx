import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { userService } from '../../services/userService';
import { companyService } from '../../services/companyService';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import {
  ShieldAlert,
  Compass,
  Menu,
  Bell,
  Settings,
  Users,
  Building,
  Activity,
  CheckCircle,
  Clock,
  LogOut,
  MapPin,
  FileText
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = userService.getCurrentUser();

  const handleLogout = () => {
    userService.logout();
    navigate('/login');
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await companyService.getCompanies();
        if (Array.isArray(data)) {
          setCompanies(data);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados admin:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div id="admin-dashboard-page">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeItem="resumo"
      />

      <div className="admin-dashboard-container">
        {/* Header Bar */}
        <header className="admin-header-bar">
          <div className="admin-header-left">
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
            <span className="header-module-name">Painel Geral de Administração</span>
          </div>

          <div className="admin-header-actions">
            <button
              className="btn-quick-map"
              onClick={() => navigate('/map')}
              title="Abrir Mapa"
            >
              <MapPin size={16} />
              <span>Mapa do Sistema</span>
            </button>
            <button className="header-icon-btn" title="Notificações" aria-label="Notificações">
              <Bell size={19} />
            </button>
            <button
              className="header-icon-btn"
              onClick={() => navigate('/editar-perfil')}
              title="Configurações"
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

        {/* Hero Admin */}
        <section className="admin-hero-banner">
          <div className="admin-banner-info">
            <div className="admin-stat-icon" style={{ width: '60px', height: '60px' }}>
              <ShieldAlert size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">Painel do Administrador</h1>
                <span className="admin-badge-role">Acesso Root / Admin</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Logado como: <strong>{currentUser?.name || 'Administrador'}</strong> ({currentUser?.email || 'admin@voyage.com'})
              </p>
            </div>
          </div>
        </section>

        {/* Métricas Globais da Plataforma */}
        <section className="admin-grid-section">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div className="admin-stat-icon">
                <Building size={22} />
              </div>
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <div className="admin-stat-val">{loading ? '...' : companies.length || '18'}</div>
            <span className="text-xs text-gray-400">Empresas Cadastradas</span>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div className="admin-stat-icon">
                <Users size={22} />
              </div>
              <span className="text-xs text-gray-400">Ativos</span>
            </div>
            <div className="admin-stat-val">1.240</div>
            <span className="text-xs text-gray-400">Usuários na Plataforma</span>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div className="admin-stat-icon">
                <Activity size={22} />
              </div>
              <span className="text-xs text-gray-400">Online</span>
            </div>
            <div className="admin-stat-val">99.98%</div>
            <span className="text-xs text-gray-400">SLA dos Serviços GIS</span>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div className="admin-stat-icon">
                <CheckCircle size={22} />
              </div>
              <span className="text-xs text-gray-400">Segurança</span>
            </div>
            <div className="admin-stat-val">OK</div>
            <span className="text-xs text-gray-400">Zero incidentes</span>
          </div>
        </section>

        {/* Tabela de Estabelecimentos Cadastrados */}
        <div className="admin-table-panel">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText size={20} className="text-red-400" />
              Empresas na Base de Dados
            </h2>
            <span className="text-xs text-gray-400">Sincronizado com API</span>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Estabelecimento</th>
                <th>Categoria</th>
                <th>CNPJ / Localização</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">Carregando dados...</td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">Nenhum estabelecimento encontrado.</td>
                </tr>
              ) : (
                companies.slice(0, 10).map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td className="font-semibold text-white">{c.name}</td>
                    <td>{c.category || 'Geral'}</td>
                    <td>{c.places || c.cnpj || 'Endereço não informado'}</td>
                    <td>
                      <span className="badge-status active">Ativo</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
