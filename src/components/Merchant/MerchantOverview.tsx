import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye,
  Navigation,
  MessageCircle,
  Phone,
  Globe,
  Image,
  Clock,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';
import type { MerchantData } from '../../types/merchant';
import { merchantService } from '../../services/merchantService';

interface MerchantOverviewProps {
  data: MerchantData;
  onNavigateTab: (tabKey: string) => void;
}

export const MerchantOverview: React.FC<MerchantOverviewProps> = ({ data, onNavigateTab }) => {
  // Timer periódico para manter o status de funcionamento atualizado a cada 30 segundos
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const openStatus = useMemo(() => {
    return merchantService.isEstablishmentOpen(data.hours, [], undefined, data.timeZone);
  }, [data.hours, data.timeZone, tick]);

  // Cálculo da completude do perfil
  const profileCompletion = useMemo(() => {
    let score = 0;
    if (data.profile.name) score += 20;
    if (data.profile.logoUrl) score += 15;
    if (data.profile.coverUrl) score += 15;
    if (data.profile.address?.street) score += 15;
    if (data.profile.contact?.phone || data.profile.contact?.whatsapp) score += 15;
    if (Object.values(data.hours || {}).some((h) => h.isOpen && h.shifts.length > 0)) score += 10;
    if (data.media?.length > 0) score += 10;
    return Math.min(score, 100);
  }, [data]);

  return (
    <div className="space-y-6">
      {/* 1. Card de Boas-Vindas e Status Operacional */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
            {data.profile.logoUrl ? (
              <img src={data.profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Sparkles className="text-indigo-400" size={28} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white">
                {data.profile.name || 'Meu Estabelecimento'}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  openStatus.isOpen
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : openStatus.isUnspecified
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    openStatus.isOpen
                      ? 'bg-emerald-400'
                      : openStatus.isUnspecified
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                />
                {openStatus.isOpen
                  ? 'Aberto Agora'
                  : openStatus.isUnspecified
                  ? 'Horário não informado'
                  : 'Fechado Agora'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin size={13} className="text-slate-500" />
              <span>
                {data.profile.address?.street
                  ? `${data.profile.address.street}, ${data.profile.address.number || 'S/N'} - ${data.profile.address.city || ''}`
                  : 'Endereço ainda não configurado'}
              </span>
            </p>
          </div>
        </div>

        {/* Barra de Progresso do Perfil */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 min-w-[240px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-medium">Completude do Perfil</span>
            <span className="text-indigo-400 font-bold">{profileCompletion}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {profileCompletion === 100
              ? 'Perfil com informações completas no Voyage!'
              : 'Complete todos os dados para melhor apresentação aos clientes.'}
          </p>
        </div>
      </div>

      {/* 2. Grid de Métricas de Engajamento */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            <span>Métricas de Acesso e Contato dos Clientes</span>
          </h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
            <Info size={12} className="text-amber-400" /> Dados ainda indisponíveis (sem telemetria integrada)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: 'Visualizações', icon: Eye, color: 'text-indigo-400' },
            { label: 'Rotas no Mapa', icon: Navigation, color: 'text-sky-400' },
            { label: 'Cliques WhatsApp', icon: MessageCircle, color: 'text-emerald-400' },
            { label: 'Ligações', icon: Phone, color: 'text-amber-400' },
            { label: 'Acessos ao Site', icon: Globe, color: 'text-purple-400' },
            { label: 'Fotos Vistas', icon: Image, color: 'text-pink-400' }
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/80 p-4 rounded-xl border border-white/5 hover:border-white/15 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon size={18} className={m.color} />
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-800/80 px-1.5 py-0.5 rounded">
                    Aguardando API
                  </span>
                </div>
                <div className="text-base font-bold text-slate-400">--</div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Origem dos Clientes & Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Origens de Descoberta */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Canais de Descoberta
            </h4>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              📊 Amostragem Ilustrativa
            </span>
          </div>

          <div className="space-y-3">
            {[
              { source: 'Busca Direta no Mapa', pct: 45, color: 'bg-indigo-500' },
              { source: 'Raio de Proximidade (GPS)', pct: 28, color: 'bg-sky-500' },
              { source: 'Filtro por Categorias', pct: 15, color: 'bg-emerald-500' },
              { source: 'Link Direto / Compartilhamento', pct: 12, color: 'bg-amber-500' }
            ].map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{s.source}</span>
                  <span className="text-slate-400">Dados reais em integração ({s.pct}% est.)</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`${s.color} h-full rounded-full`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            * Gráfico de canais demonstrativo para visualização da interface. A telemetria real de acessos será integrada no backend em versão futura.
          </p>
        </div>

        {/* Atalhos Rápidos de Configuração */}
        <div className="bg-slate-900/80 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Atalhos de Configuração Operacional
            </h4>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigateTab('horarios')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left border border-white/5 hover:border-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-indigo-400" />
                  <div>
                    <div className="font-semibold text-white">Horários de Funcionamento</div>
                    <div className="text-[11px] text-slate-400">
                      {openStatus.isOpen ? openStatus.statusText : 'Defina abertura, turnos e pausas'}
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('pagamentos')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left border border-white/5 hover:border-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-teal-400" />
                  <div>
                    <div className="font-semibold text-white">Formas de Pagamento</div>
                    <div className="text-[11px] text-slate-400">Pix, Dinheiro, Cartões e Vales Alimentação</div>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('midia')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-left border border-white/5 hover:border-white/10 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Image size={16} className="text-pink-400" />
                  <div>
                    <div className="font-semibold text-white">Fotos e Fachada</div>
                    <div className="text-[11px] text-slate-400">
                      {data.media?.length || 0} foto(s) cadastrada(s)
                    </div>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 mt-3">
            Alterações cadastrais básicas sincronizam com a API do Voyage; catálogo, fotos e horários são salvos como rascunho local neste navegador.
          </div>
        </div>
      </div>
    </div>
  );
};
