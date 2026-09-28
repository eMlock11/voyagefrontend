import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Clock,
  CreditCard,
  Image,
  Utensils,
  BarChart3,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Menu,
  Info,
  AlertTriangle
} from 'lucide-react';
import type { MerchantData, SaveMerchantResult } from '../../types/merchant';
import { merchantService } from '../../services/merchantService';
import { BusinessInfoForm } from './BusinessInfoForm';
import { BusinessHoursEditor } from './BusinessHoursEditor';
import { PaymentMethodsEditor } from './PaymentMethodsEditor';
import { MediaGalleryEditor } from './MediaGalleryEditor';
import { DynamicCatalogManager } from './Catalog/DynamicCatalogManager';
import { MerchantOverview } from './MerchantOverview';
import PerformanceCharts from '../../pages/Company/PerformanceCharts';

interface MerchantPanelProps {
  companyId: string | number;
  userId?: string | number;
  fallbackCompany?: any;
  initialTab?: string;
  onCompanyUpdated?: (name: string, category: string) => void;
}

export const MerchantPanel: React.FC<MerchantPanelProps> = ({
  companyId,
  userId,
  fallbackCompany,
  initialTab = 'visao-geral',
  onCompanyUpdated
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [data, setData] = useState<MerchantData>(() =>
    merchantService.getMerchantData(companyId, userId, fallbackCompany)
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    details?: string;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Snapshot para rastreamento de alterações pendentes (hasUnsavedChanges)
  const initialSnapshotRef = useRef<string>(JSON.stringify(data));
  const isDirty = JSON.stringify(data) !== initialSnapshotRef.current;

  // Sincroniza ou reinicializa dados quando mudar a empresa ou usuário
  useEffect(() => {
    if (companyId && companyId !== 'company-default') {
      const loaded = merchantService.getMerchantData(companyId, userId, fallbackCompany);
      setData(loaded);
      initialSnapshotRef.current = JSON.stringify(loaded);
    }
  }, [companyId, userId, fallbackCompany]);

  // Alerta antes de fechar a aba/janela se houver alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSaveAll = async () => {
    // Evita requisições duplicadas enquanto o salvamento estiver em andamento
    if (saving) return;

    // Bloqueia atualizações sem ID válido
    if (!companyId || companyId === 'company-default') {
      setFeedback({
        type: 'error',
        title: 'Operação não permitida',
        details: 'Nenhuma empresa válida selecionada. Cadastre ou selecione uma empresa real antes de salvar.'
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      // Chama o serviço: primeiro envia campos suportados à API real; se falhar, propaga o erro
      const result: SaveMerchantResult = await merchantService.saveMerchantData(data);

      // Sucesso confirmado: atualiza o estado com os dados consolidados e atualiza o snapshot
      setData(result.data);
      initialSnapshotRef.current = JSON.stringify(result.data);

      if (onCompanyUpdated) {
        onCompanyUpdated(result.data.profile.name, result.data.profile.primaryCategory);
      }

      setFeedback({
        type: 'success',
        title: 'Salvamento concluído!',
        details: `${result.message} Sincronizados com o servidor: ${result.syncedFields.join(', ')}. Salvos como rascunho local: ${result.localDraftFields.join(', ')}.`
      });

      setTimeout(() => {
        setFeedback((prev) => (prev?.type === 'success' ? null : prev));
      }, 7000);
    } catch (err: any) {
      // Falha da API: propaga o erro para a interface SEM apagar nem resetar o formulário do usuário
      console.error('Falha ao salvar dados do lojista:', err);
      setFeedback({
        type: 'error',
        title: 'Falha ao salvar no servidor remoto',
        details: `${err.message || 'Erro de comunicação com a API.'} Suas alterações foram preservadas no formulário para você tentar novamente.`
      });
    } finally {
      setSaving(false);
    }
  };

  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Store, badge: null },
    { id: 'perfil', label: 'Informações Gerais', icon: Building, badge: null },
    { id: 'horarios', label: 'Horários', icon: Clock, badge: 'Ao vivo' },
    { id: 'pagamentos', label: 'Formas de Pagamento', icon: CreditCard, badge: null },
    { id: 'midia', label: 'Fotos & Mídia', icon: Image, badge: data.media?.length > 0 ? String(data.media.length) : null },
    { id: 'catalogo', label: 'Catálogo & Cardápio', icon: Utensils, badge: 'Modular' },
    { id: 'desempenho', label: 'Analytics & Gráficos', icon: BarChart3, badge: 'Demo' }
  ];

  return (
    <div className="w-full">
      {/* Barra de Ações Superior / Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <span>Painel do Comerciante Voyage</span>
            <span>•</span>
            <span>{data.profile.primaryCategory || 'Categoria não informada'}</span>
            {isDirty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                <AlertTriangle className="w-3 h-3" /> Alterações pendentes
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {data.profile.name || 'Gerenciamento do Estabelecimento'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/map"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <span>Ver no Mapa</span>
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Save size={15} />
            <span>{saving ? 'Salvando na API...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Banner Informativo de Arquitetura e Rascunho */}
      <div className="mb-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Status de Sincronização:</span> Dados cadastrais básicos (Nome, Categoria, CNPJ e Endereço) são confirmados diretamente na API remota. Horários, formas de pagamento, fotos e catálogo ficam salvos com segurança como <strong>rascunho local neste navegador</strong> enquanto não houver endpoint remoto dedicado no backend.
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-medium mb-6 flex items-start gap-3 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
              : feedback.type === 'warning'
              ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300'
              : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
          )}
          <div>
            <div className="font-bold text-sm text-white">{feedback.title}</div>
            {feedback.details && <div className="mt-1 text-slate-300">{feedback.details}</div>}
          </div>
        </div>
      )}

      {/* Navegação por Abas em Desktop e Menu Mobile */}
      <div className="mb-6">
        {/* Mobile Dropdown Button */}
        <div className="sm:hidden mb-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-white"
          >
            <div className="flex items-center gap-2">
              <Menu size={16} className="text-indigo-400" />
              <span>Seção: {navItems.find((n) => n.id === activeTab)?.label}</span>
            </div>
            <ChevronRight size={16} className={`transform transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} />
          </button>

          {mobileMenuOpen && (
            <div className="mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl animate-fadeIn">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs text-left border-b border-white/5 last:border-none ${
                    activeTab === item.id
                      ? 'bg-indigo-600/20 text-indigo-400 font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={15} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Tabs Horizontal */}
        <div className="hidden sm:flex flex-wrap gap-1.5 p-1.5 bg-slate-900/90 rounded-2xl border border-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Dinâmico da Aba Ativa */}
      <div className="bg-slate-950/40 p-4 sm:p-6 rounded-2xl border border-white/5">
        {activeTab === 'visao-geral' && (
          <MerchantOverview data={data} onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'perfil' && (
          <BusinessInfoForm
            profile={data.profile}
            onChange={(profile) => setData({ ...data, profile })}
          />
        )}

        {activeTab === 'horarios' && (
          <BusinessHoursEditor
            hours={data.hours}
            timeZone={data.timeZone}
            onChange={(hours) => setData({ ...data, hours })}
          />
        )}

        {activeTab === 'pagamentos' && (
          <PaymentMethodsEditor
            payments={data.payments}
            onChange={(payments) => setData({ ...data, payments })}
          />
        )}

        {activeTab === 'midia' && (
          <MediaGalleryEditor
            media={data.media}
            onChange={(media) => setData({ ...data, media })}
          />
        )}

        {activeTab === 'catalogo' && (
          <DynamicCatalogManager
            initialData={data.catalog}
            companyCategory={data.profile.primaryCategory}
            onSave={(catalog) => setData({ ...data, catalog })}
          />
        )}

        {activeTab === 'desempenho' && (
          <PerformanceCharts />
        )}
      </div>
    </div>
  );
};
