import React from 'react';
import {
  Utensils,
  Store,
  Scissors,
  Wrench,
  Hotel,
  Shirt,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface CatalogPlaceholderProps {
  currentCategory: string;
}

export const CatalogPlaceholder: React.FC<CatalogPlaceholderProps> = ({ currentCategory }) => {
  const verticals = [
    {
      id: 'gastronomia',
      title: 'Restaurante / Cardápio Digital',
      desc: 'Categorias (Entradas, Pratos, Bebidas), adicionais pagos (Bacon, Queijo), ingredientes e opções à la carte/delivery.',
      icon: Utensils,
      color: 'text-amber-400',
      badge: 'Fase 2 - Próxima Etapa',
      active: currentCategory.toLowerCase().includes('lanchonete') || currentCategory.toLowerCase().includes('aliment')
    },
    {
      id: 'mercado',
      title: 'Supermercado & Mercearia',
      desc: 'Catálogo de produtos por setor (Açougue, Hortifruti, Mercearia), controle de ofertas e upload de encarte/folheto PDF.',
      icon: Store,
      color: 'text-emerald-400',
      badge: 'Fase 2 - Próxima Etapa',
      active: currentCategory.toLowerCase().includes('mercado')
    },
    {
      id: 'servicos',
      title: 'Salão, Barbearia & Estética',
      desc: 'Tabela de serviços com tempo estimado, valor (R$ ou a partir de) e cadastro de profissionais especialistas.',
      icon: Scissors,
      color: 'text-indigo-400',
      badge: 'Fase 2 - Próxima Etapa',
      active: currentCategory.toLowerCase().includes('barbearia') || currentCategory.toLowerCase().includes('beleza')
    },
    {
      id: 'oficina',
      title: 'Oficina Mecânica & Auto Center',
      desc: 'Serviços especializados (Revisão, Freios, Alinhamento), marcas atendidas e suporte a guincho / socorro 24h.',
      icon: Wrench,
      color: 'text-sky-400',
      badge: 'Fase 2 - Próxima Etapa',
      active: currentCategory.toLowerCase().includes('oficina') || currentCategory.toLowerCase().includes('auto')
    },
    {
      id: 'hospedagem',
      title: 'Hotel & Pousada',
      desc: 'Quartos, capacidades, comodidades inclusas (ar, Wi-Fi, café) e regras de diárias.',
      icon: Hotel,
      color: 'text-purple-400',
      badge: 'Fase 2 - Próxima Etapa',
      active: currentCategory.toLowerCase().includes('hotel') || currentCategory.toLowerCase().includes('pousada')
    },
    {
      id: 'varejo',
      title: 'Varejo & Vestuário',
      desc: 'Grade com tamanhos (P, M, G, GG), variações de cores, marcas e fotos do produto.',
      icon: Shirt,
      color: 'text-rose-400',
      badge: 'Fase 2 - Próxima Etapa',
      active: currentCategory.toLowerCase().includes('roupa') || currentCategory.toLowerCase().includes('varejo')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Apresentação da Engine Dinâmica */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3">
            <Sparkles size={14} />
            <span>Módulo de Catálogo Inteligente por Categoria</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Catálogo Personalizado para o seu Ramo de Atividade
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Diferente de formulários genéricos, o Voyage disponibiliza ferramentas exclusivas adaptadas ao seu nicho.
            A sua categoria atual é <span className="text-indigo-400 font-semibold">{currentCategory}</span>.
          </p>
        </div>
      </div>

      {/* Grid de Verticais Mapeadas */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Módulos Dinâmicos Estruturados para o Estabelecimento
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.id}
                className={`p-5 rounded-xl border transition-all ${
                  v.active
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-white/5 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl bg-slate-800 ${v.color}`}>
                    <Icon size={22} />
                  </div>
                  {v.active ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={12} />
                      Sugerido para Você
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                      Disponível
                    </span>
                  )}
                </div>

                <h5 className="text-sm font-bold text-white mb-1.5">{v.title}</h5>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{v.desc}</p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-indigo-400 font-medium">
                  <span>{v.badge}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
