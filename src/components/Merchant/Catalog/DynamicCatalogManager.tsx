import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Pizza,
  ShoppingCart,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import {
  MerchantCatalogData,
  CatalogVertical,
  RestaurantCatalog,
  PizzaCatalog,
  SupermarketCatalog
} from '../../../types/catalog';
import { RestaurantMenuManager } from './RestaurantMenuManager';
import { PizzaManager } from './PizzaManager';
import { SupermarketCatalogManager } from './SupermarketCatalogManager';

interface DynamicCatalogManagerProps {
  initialData?: MerchantCatalogData;
  companyCategory?: string;
  onSave: (catalog: MerchantCatalogData) => void;
  isLoading?: boolean;
}

export const DynamicCatalogManager: React.FC<DynamicCatalogManagerProps> = ({
  initialData,
  companyCategory = '',
  onSave,
  isLoading = false
}) => {
  // Inferir vertical inicial a partir de categoria ou dado inicial
  const inferInitialVertical = (): CatalogVertical => {
    if (initialData?.vertical) return initialData.vertical;
    const cat = companyCategory.toLowerCase();
    if (cat.includes('pizza')) return 'pizzaria';
    if (cat.includes('mercado') || cat.includes('supermercado') || cat.includes('mercearia'))
      return 'mercado';
    return 'restaurante';
  };

  const [activeVertical, setActiveVertical] = useState<CatalogVertical>(inferInitialVertical);
  const [catalogState, setCatalogState] = useState<MerchantCatalogData>(
    initialData || { vertical: inferInitialVertical() }
  );

  const handleVerticalChange = (vertical: CatalogVertical) => {
    setActiveVertical(vertical);
    const updated = { ...catalogState, vertical };
    setCatalogState(updated);
    onSave(updated);
  };

  const handleSaveRestaurant = (restaurantData: RestaurantCatalog) => {
    const updated: MerchantCatalogData = {
      ...catalogState,
      vertical: 'restaurante',
      restaurant: restaurantData
    };
    setCatalogState(updated);
    onSave(updated);
  };

  const handleSavePizza = (pizzaData: PizzaCatalog) => {
    const updated: MerchantCatalogData = {
      ...catalogState,
      vertical: 'pizzaria',
      pizza: pizzaData
    };
    setCatalogState(updated);
    onSave(updated);
  };

  const handleSaveSupermarket = (supermarketData: SupermarketCatalog) => {
    const updated: MerchantCatalogData = {
      ...catalogState,
      vertical: 'mercado',
      supermarket: supermarketData
    };
    setCatalogState(updated);
    onSave(updated);
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Tipo de Catálogo / Vertical */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Segmento & Modelo de Catálogo</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Modular Dinâmico
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Personalize a experiência com ferramentas específicas para o seu ramo de atuação.
            </p>
          </div>

          {/* Botões seletores */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleVerticalChange('restaurante')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeVertical === 'restaurante'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Restaurante / Bar
            </button>

            <button
              type="button"
              onClick={() => handleVerticalChange('pizzaria')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeVertical === 'pizzaria'
                  ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Pizza className="w-3.5 h-3.5" />
              Pizzaria
            </button>

            <button
              type="button"
              onClick={() => handleVerticalChange('mercado')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeVertical === 'mercado'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Supermercado & Varejo
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-800/70 flex items-center gap-2 text-xs text-neutral-400">
          <Info className="w-4 h-4 text-neutral-500 shrink-0" />
          <span>
            {activeVertical === 'restaurante' &&
              'Modo Restaurante ativo: Cardápio com categorias, adicionais e modalidades de serviço (rodízio, buffet, à la carte).'}
            {activeVertical === 'pizzaria' &&
              'Modo Pizzaria ativo: Gestão de múltiplos sabores por fatia, bordas especiais recheadas e tamanhos proporcionais.'}
            {activeVertical === 'mercado' &&
              'Modo Supermercado ativo: Gôndolas por departamento, ofertas da semana com vigência e encarte digital.'}
          </span>
        </div>
      </div>

      {/* Renderização do Módulo Selecionado */}
      <div>
        {activeVertical === 'restaurante' && (
          <RestaurantMenuManager
            initialData={catalogState.restaurant}
            onSave={handleSaveRestaurant}
            isLoading={isLoading}
          />
        )}

        {activeVertical === 'pizzaria' && (
          <PizzaManager
            initialData={catalogState.pizza}
            onSave={handleSavePizza}
            isLoading={isLoading}
          />
        )}

        {activeVertical === 'mercado' && (
          <SupermarketCatalogManager
            initialData={catalogState.supermarket}
            onSave={handleSaveSupermarket}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};
