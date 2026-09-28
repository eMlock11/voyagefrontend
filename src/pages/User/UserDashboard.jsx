import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { userService } from '../../services/userService';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  Compass,
  Menu,
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => userService.getCurrentUser());

  useEffect(() => {
    const handlePlanUpdate = () => {
      setCurrentUser(userService.getCurrentUser());
    };

    window.addEventListener('storage', handlePlanUpdate);
    window.addEventListener('userPlanUpdated', handlePlanUpdate);

    return () => {
      window.removeEventListener('storage', handlePlanUpdate);
      window.removeEventListener('userPlanUpdated', handlePlanUpdate);
    };
  }, []);

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

      <div className="user-dashboard-container p-4 md:p-8 max-w-7xl mx-auto space-y-6">
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
            <span className="hidden md:inline-block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meu Resumo</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/map')}
              className="gap-1.5"
            >
              <MapPin size={15} />
              <span className="hidden sm:inline">Explorar Mapa</span>
            </Button>
            <ThemeToggle className="h-9 w-9 rounded-xl border border-input bg-background/60 hover:bg-accent flex items-center justify-center" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/configuracoes')}
              title="Configurações da Conta"
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

        {/* Hero do Usuário / Boas-vindas (Harmônico com Modo Claro e Escuro) */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-6 md:p-8 shadow-sm dark:bg-gradient-to-r dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-slate-950/50 dark:border-indigo-500/20 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white/20 overflow-hidden">
                {currentUser?.avatar || currentUser?.foto ? (
                  <img
                    src={currentUser.avatar || currentUser.foto}
                    alt={currentUser.name || 'Foto de perfil'}
                    className="w-full h-full object-cover"
                  />
                ) : currentUser?.name ? (
                  currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                ) : (
                  'U'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight text-foreground">
                    Olá, {currentUser?.name || 'Viajante'}!
                  </h1>
                  <Badge variant="brand" className="text-xs">
                    {currentUser?.plan ? currentUser.plan : (currentUser?.type === 'owner' ? 'Comerciante' : 'Usuário')}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{currentUser?.email || 'usuario@voyage.com'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button variant="default" size="sm" onClick={() => navigate('/map')} className="gap-1.5">
                <MapPin size={15} /> Abrir Mapa Interativo
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/editar-perfil')} className="gap-1.5">
                <User size={15} /> Editar Perfil
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Métricas do Usuário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rotas Criadas</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Navigation size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">12</div>
              <p className="text-xs text-muted-foreground mt-1">Última rota hoje</p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Favoritos</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Heart size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">8</div>
              <p className="text-xs text-muted-foreground mt-1">Locais salvos para visitar</p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avaliações</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Star size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">5</div>
              <p className="text-xs text-muted-foreground mt-1">Média 4.9 ⭐ dada</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:border-purple-500/50 cursor-pointer transition-all duration-200 bg-gradient-to-br from-card to-purple-500/5"
            onClick={() => navigate('/payment')}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plano Voyage</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight text-purple-600 dark:text-purple-400">
                {currentUser?.plan || 'Gratuito'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentUser?.planId === 'plus' 
                  ? 'VIP Completo • Ativo' 
                  : currentUser?.planId === 'intermediary' 
                  ? 'Intermediário • Ativo' 
                  : 'Clique para desbloquear o Voyage+'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grid de 2 Colunas com shadcn Card (Fundo Branco no Light Mode, Dark elegante no Dark Mode) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Locais Favoritos / Recentes */}
          <Card className="lg:col-span-2 border border-border/60 shadow-sm bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart size={18} className="text-rose-500 fill-rose-500/20" />
                Lugares Salvos & Recentes
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary hover:text-primary gap-1 h-8"
                onClick={() => navigate('/map')}
              >
                <span>Ver no Mapa</span>
                <ExternalLink size={13} />
              </Button>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ExploreIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Pará Lanches</h3>
                    <p className="text-xs text-muted-foreground">Lanchonete • 1.2 km de você</p>
                  </div>
                </div>
                <Badge variant="warning" className="gap-1 font-bold text-xs py-0.5">
                  <Star size={12} fill="currentColor" />
                  4.8
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ExploreIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Pizzaria Bella Napoli</h3>
                    <p className="text-xs text-muted-foreground">Pizzaria • 2.5 km de você</p>
                  </div>
                </div>
                <Badge variant="warning" className="gap-1 font-bold text-xs py-0.5">
                  <Star size={12} fill="currentColor" />
                  4.9
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ExploreIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Drogaria São Paulo</h3>
                    <p className="text-xs text-muted-foreground">Farmácia • 800 m de você</p>
                  </div>
                </div>
                <Badge variant="warning" className="gap-1 font-bold text-xs py-0.5">
                  <Star size={12} fill="currentColor" />
                  4.7
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Lateral: Card do Plano Voyage+ & Atividade */}
          <div className="flex flex-col gap-4">
            {currentUser?.planId === 'plus' ? (
              <Card className="border border-purple-500/30 bg-card text-card-foreground shadow-sm overflow-hidden relative">
                <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" className="text-[10px]">VIP Ativo</Badge>
                    <Sparkles size={16} className="text-purple-500" />
                  </div>
                  <CardTitle className="text-base text-foreground mt-2">Você é Membro Voyage+</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Seu plano VIP está 100% ativo! Aproveite cupons de desconto ilimitados, sem anúncios e suporte 24/7.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                    onClick={() => navigate('/payment')}
                  >
                    <Sparkles size={14} className="mr-1.5" />
                    Gerenciar Assinatura
                  </Button>
                </CardContent>
              </Card>
            ) : currentUser?.planId === 'intermediary' ? (
              <Card className="border border-blue-500/30 bg-card text-card-foreground shadow-sm overflow-hidden relative">
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">Plano Intermediário</Badge>
                    <Sparkles size={16} className="text-blue-500" />
                  </div>
                  <CardTitle className="text-base text-foreground mt-2">Migre para o Voyage+ VIP</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Desbloqueie cupons ilimitados e o selo VIP exclusivo com suporte prioritário a qualquer momento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/payment')}
                  >
                    <Sparkles size={14} className="mr-1.5" />
                    Fazer Upgrade para Voyage+
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border/60 bg-card text-card-foreground shadow-sm overflow-hidden relative">
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">Experiência Completa</Badge>
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <CardTitle className="text-base text-foreground mt-2">Experimente o Voyage+</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    Navegação sem anúncios, rotas inteligentes em tempo real e cupons de desconto exclusivos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/payment')}
                  >
                    <Sparkles size={14} className="mr-1.5" />
                    Conhecer Planos Voyage+
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Atividade Recente */}
            <Card className="border border-border/60 bg-card text-card-foreground shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock size={14} />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground leading-relaxed">
                  Você pesquisou <strong className="text-primary font-semibold">Lanchonetes em Belém</strong> hoje às 15:20.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
