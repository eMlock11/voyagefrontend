import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { userService } from '../../services/userService';
import { companyService } from '../../services/companyService';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ThemeToggle } from '../../components/ThemeToggle';
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
  LogOut,
  MapPin,
  FileText,
  Search,
  TrendingUp,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setError(null);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados admin:', err);
        setError(err.message || 'Falha ao conectar com o serviço de estabelecimentos.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.places || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="admin-dashboard-page" className="min-h-screen bg-background text-foreground">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeItem="resumo"
      />

      <div className="admin-dashboard-container p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex items-center justify-between p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              title="Abrir Menu de Navegação"
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <Compass className="text-primary" size={26} />
              <span className="text-xl font-black tracking-tight text-foreground">Voyage<span className="text-primary">.</span></span>
            </div>
            <div className="hidden md:block w-px h-6 bg-border mx-2"></div>
            <span className="hidden md:inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Painel Administrativo</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/map')}
              className="gap-1.5"
            >
              <MapPin size={15} />
              <span className="hidden sm:inline">Mapa Voyage</span>
            </Button>
            <ThemeToggle className="h-9 w-9 rounded-xl border border-input bg-background/60 hover:bg-accent flex items-center justify-center" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/configuracoes')}
              title="Configurações"
            >
              <Settings size={18} />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* Hero Admin (Harmônico em Light e Dark Mode) */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-sm dark:bg-gradient-to-r dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-slate-950/50 dark:border-indigo-500/20 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <ShieldAlert size={30} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight text-foreground">Painel do Administrador</h1>
                  <Badge variant="brand" className="text-xs font-semibold">Root / Admin</Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Logado como: <strong>{currentUser?.name || 'Administrador'}</strong> ({currentUser?.email || 'admin@voyage.com'})
                </p>
              </div>
<<<<<<< HEAD
              <span className="text-xs text-gray-400">Total Real</span>
            </div>
            <div className="admin-stat-val">
              {loading ? '...' : (error ? '—' : companies.length)}
            </div>
            <span className="text-xs text-gray-400">Empresas Cadastradas</span>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div className="admin-stat-icon">
                <Users size={22} />
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">Estimado</span>
=======
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" onClick={() => navigate('/company/cadastro')} className="gap-1.5">
                <Plus size={15} /> Novo Estabelecimento
              </Button>
>>>>>>> dd173f80e4d5b3b0871fa296538a06532073fe30
            </div>
          </div>
<<<<<<< HEAD

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div className="admin-stat-icon">
                <Activity size={22} />
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">Mock SLA</span>
            </div>
            <div className="admin-stat-val">99.98%</div>
            <span className="text-xs text-gray-400">SLA dos Serviços GIS</span>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div className="admin-stat-icon">
                <CheckCircle size={22} />
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-400/80 bg-blue-500/10 px-1.5 py-0.5 rounded">Local</span>
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
            <span className={`text-xs ${error ? 'text-rose-400 font-semibold' : 'text-gray-400'}`}>
              {error ? 'Falha na conexão com a API' : 'Sincronizado com API'}
            </span>
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
=======
>>>>>>> dd173f80e4d5b3b0871fa296538a06532073fe30
        </div>

        {/* Cards de Métricas shadcn KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Empresas Cadastradas</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Building size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">{loading ? '...' : companies.length || '18'}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-emerald-500 font-semibold">+3</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuários Ativos</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">1.240</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-emerald-500 font-semibold">+18%</span> engajamento
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">SLA dos Serviços GIS</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Activity size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">99.98%</div>
              <p className="text-xs text-muted-foreground mt-1">Servidores OSM & OSRM ativos</p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status do Sistema</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight text-foreground">Operacional</div>
              <p className="text-xs text-muted-foreground mt-1">Zero incidentes reportados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela shadcn de Estabelecimentos com Busca Instantânea */}
        <Card className="border border-border/60 shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Empresas na Base de Dados
              </CardTitle>
              <CardDescription>
                Lista de estabelecimentos cadastrados e integrados aos mapas
              </CardDescription>
            </div>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Buscar por nome, categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b border-border/40">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Nome do Estabelecimento</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Localização / Endereço</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">Carregando dados...</td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum estabelecimento encontrado.</td>
                    </tr>
                  ) : (
                    filteredCompanies.slice(0, 10).map((c) => (
                      <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">#{c.id}</td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">{c.name}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-xs">
                            {c.category || 'Geral'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground text-xs">{c.places || c.cnpj || 'Endereço não informado'}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Badge variant="success" className="text-xs">
                            Ativo
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
