import React, { useState, useEffect } from 'react';
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
  Menu
} from 'lucide-react';
import type { MerchantData } from '../../types/merchant';
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
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Carrega os dados persistidos
  useEffect(() => {
    if (companyId) {
      const loaded = merchantService.getMerchantData(companyId, userId, fallbackCompany);
      setData(loaded);
    }
  }, [companyId, userId]);

  const handleSaveAll = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await merchantService.saveMerchantData(data);
      setData(saved);
      if (onCompanyUpdated) {
        onCompanyUpdated(saved.profile.name, saved.profile.primaryCategory);
      }
      setFeedback({
        type: 'success',
        message: 'Todas as informações do estabelecimento foram salvas com sucesso!'
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Erro ao salvar os dados do estabelecimento.'
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
    { id: 'midia', label: 'Fotos & Mídia', icon: Image, badge: data.media.length > 0 ? String(data.media.length) : null },
    { id: 'catalogo', label: 'Catálogo & Cardápio', icon: Utensils, badge: 'Fase 2' },
    { id: 'desempenho', label: 'Analytics & Gráficos', icon: BarChart3, badge: null }
  ];

  return (
    <div className="w-full">
      {/* Barra de Ações Superior / Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <span>Painel do Comerciante Voyage</span>
            <span>•</span>
            <span>{data.profile.primaryCategory}</span>
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save size={15} />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
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
