import React, { useState } from 'react';
import {
  Pizza,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  X,
  Layers,
  Sparkles,
  Flame,
  Search,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  PizzaCatalog,
  PizzaSize,
  PizzaCrust,
  PizzaFlavor,
  MenuItemAddon
} from '../../../types/catalog';

interface PizzaManagerProps {
  initialData?: PizzaCatalog;
  onSave: (data: PizzaCatalog) => void;
  isLoading?: boolean;
}

const DEFAULT_PIZZA_DATA: PizzaCatalog = {
  sizes: [
    { id: 'size_broto', name: 'Broto', slices: 4, basePrice: 32.0, maxFlavors: 1 },
    { id: 'size_media', name: 'Média', slices: 6, basePrice: 48.0, maxFlavors: 2 },
    { id: 'size_grande', name: 'Grande', slices: 8, basePrice: 62.0, maxFlavors: 3 },
    { id: 'size_familia', name: 'Família / Gigante', slices: 12, basePrice: 79.0, maxFlavors: 4 }
  ],
  crusts: [
    { id: 'crust_trad', name: 'Borda Tradicional (Sem recheio)', additionalPrice: 0 },
    { id: 'crust_catupiry', name: 'Catupiry Original', additionalPrice: 12.0 },
    { id: 'crust_cheddar', name: 'Cheddar Cremoso', additionalPrice: 12.0 },
    { id: 'crust_choc', name: 'Borda de Chocolate com Avelã', additionalPrice: 15.0 },
    { id: 'crust_vulcao', name: 'Borda Vulcão Quatro Queijos', additionalPrice: 18.0 }
  ],
  flavors: [
    {
      id: 'flav_1',
      name: 'Calabresa Especial',
      description: 'Molho de tomate pelado, mussarela premium, calabresa artesanal fatiada, cebola roxa e orégano.',
      category: 'tradicional',
      ingredients: ['Molho artesanal', 'Mussarela', 'Calabresa fatiada', 'Cebola roxa', 'Azeitonas pretas'],
      photoUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=60',
      isAvailable: true
    },
    {
      id: 'flav_2',
      name: 'Quatro Queijos',
      description: 'Mussarela, provolone curado, parmesão ralado e catupiry legítimo sobre molho de tomate.',
      category: 'especial',
      ingredients: ['Mussarela', 'Provolone', 'Parmesão', 'Catupiry original'],
      photoUrl: 'https://images.unsplash.com/photo-1573821663912-569905455b1a?w=500&auto=format&fit=crop&q=60',
      isAvailable: true
    },
    {
      id: 'flav_3',
      name: 'Parma com Rúcula & Grana Padano',
      description: 'Presunto cru tipo Parma maturado, folhas frescas de rúcula, lascas de Grana Padano e redução balsâmica.',
      category: 'premium',
      ingredients: ['Molho de tomate', 'Mussarela de búfala', 'Presunto de Parma', 'Rúcula fresca', 'Grana Padano'],
      photoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60',
      isAvailable: true
    },
    {
      id: 'flav_4',
      name: 'Sensação com Morangos',
      description: 'Chocolate ao leite artesanal derretido, pedaços de morangos selecionados e raspas de chocolate branco.',
      category: 'doce',
      ingredients: ['Ganache de chocolate ao leite', 'Morangos frescos', 'Raspas de chocolate branco'],
      isAvailable: true
    }
  ],
  commonAddons: [
    { id: 'add_bacon', name: 'Bacon em cubos crocante', price: 6.5, isAvailable: true },
    { id: 'add_cebola', name: 'Cebola caramelizada', price: 4.0, isAvailable: true },
    { id: 'add_manjericao', name: 'Manjericão Basílico fresco', price: 2.5, isAvailable: true }
  ]
};

export const PizzaManager: React.FC<PizzaManagerProps> = ({
  initialData,
  onSave,
  isLoading = false
}) => {
  const [catalog, setCatalog] = useState<PizzaCatalog>(initialData || DEFAULT_PIZZA_DATA);
  const [activeTab, setActiveTab] = useState<'flavors' | 'sizes' | 'crusts' | 'addons'>('flavors');
  const [flavorSearch, setFlavorSearch] = useState('');
  const [flavorFilter, setFlavorFilter] = useState<'all' | 'tradicional' | 'especial' | 'premium' | 'doce'>('all');

  // Modal / Edição de Sabor
  const [editingFlavor, setEditingFlavor] = useState<PizzaFlavor | null>(null);
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [tempIngredients, setTempIngredients] = useState('');

  // Edição inline de Tamanho
  const [newSize, setNewSize] = useState<Partial<PizzaSize>>({ name: '', slices: 8, basePrice: 50, maxFlavors: 2 });
  const [isAddingSize, setIsAddingSize] = useState(false);

  // Edição inline de Borda
  const [newCrust, setNewCrust] = useState<Partial<PizzaCrust>>({ name: '', additionalPrice: 10 });
  const [isAddingCrust, setIsAddingCrust] = useState(false);

  // Edição inline de Adicional
  const [newAddon, setNewAddon] = useState<Partial<MenuItemAddon>>({ name: '', price: 5 });
  const [isAddingAddon, setIsAddingAddon] = useState(false);

  // Feedback de salvamento
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Handlers de Sabores ---
  const handleOpenFlavorModal = (flavor?: PizzaFlavor) => {
    if (flavor) {
      setEditingFlavor({ ...flavor });
      setTempIngredients(flavor.ingredients.join(', '));
    } else {
      setEditingFlavor({
        id: `flav_${Date.now()}`,
        name: '',
        description: '',
        category: 'tradicional',
        ingredients: [],
        photoUrl: '',
        isAvailable: true
      });
      setTempIngredients('');
    }
    setIsFlavorModalOpen(true);
  };

  const handleSaveFlavorModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlavor || !editingFlavor.name.trim()) return;

    const parsedIngredients = tempIngredients
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);

    const updated: PizzaFlavor = {
      ...editingFlavor,
      ingredients: parsedIngredients
    };

    setCatalog(prev => {
      const exists = prev.flavors.some(f => f.id === updated.id);
      return {
        ...prev,
        flavors: exists
          ? prev.flavors.map(f => (f.id === updated.id ? updated : f))
          : [...prev.flavors, updated]
      };
    });

    setIsFlavorModalOpen(false);
    setEditingFlavor(null);
  };

  const handleDeleteFlavor = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este sabor?')) {
      setCatalog(prev => ({
        ...prev,
        flavors: prev.flavors.filter(f => f.id !== id)
      }));
    }
  };

  const handleToggleFlavorAvailability = (id: string) => {
    setCatalog(prev => ({
      ...prev,
      flavors: prev.flavors.map(f => (f.id === id ? { ...f, isAvailable: !f.isAvailable } : f))
    }));
  };

  // --- Handlers de Tamanhos ---
  const handleAddSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSize.name?.trim()) return;
    const sizeToAdd: PizzaSize = {
      id: `size_${Date.now()}`,
      name: newSize.name,
      slices: Number(newSize.slices) || 8,
      basePrice: Number(newSize.basePrice) || 0,
      maxFlavors: Number(newSize.maxFlavors) || 1
    };
    setCatalog(prev => ({ ...prev, sizes: [...prev.sizes, sizeToAdd] }));
    setNewSize({ name: '', slices: 8, basePrice: 50, maxFlavors: 2 });
    setIsAddingSize(false);
  };

  const handleDeleteSize = (id: string) => {
    setCatalog(prev => ({ ...prev, sizes: prev.sizes.filter(s => s.id !== id) }));
  };

  // --- Handlers de Bordas ---
  const handleAddCrust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrust.name?.trim()) return;
    const crustToAdd: PizzaCrust = {
      id: `crust_${Date.now()}`,
      name: newCrust.name,
      additionalPrice: Number(newCrust.additionalPrice) || 0
    };
    setCatalog(prev => ({ ...prev, crusts: [...prev.crusts, crustToAdd] }));
    setNewCrust({ name: '', additionalPrice: 10 });
    setIsAddingCrust(false);
  };

  const handleDeleteCrust = (id: string) => {
    setCatalog(prev => ({ ...prev, crusts: prev.crusts.filter(c => c.id !== id) }));
  };

  // --- Handlers de Adicionais ---
  const handleAddAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddon.name?.trim()) return;
    const addonToAdd: MenuItemAddon = {
      id: `add_${Date.now()}`,
      name: newAddon.name,
      price: Number(newAddon.price) || 0,
      isAvailable: true
    };
    setCatalog(prev => ({ ...prev, commonAddons: [...prev.commonAddons, addonToAdd] }));
    setNewAddon({ name: '', price: 5 });
    setIsAddingAddon(false);
  };

  const handleDeleteAddon = (id: string) => {
    setCatalog(prev => ({ ...prev, commonAddons: prev.commonAddons.filter(a => a.id !== id) }));
  };

  // Submissão Global
  const handleGlobalSave = () => {
    onSave(catalog);
    setFeedback('Cardápio da Pizzaria salvo com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Filtro de sabores
  const filteredFlavors = catalog.flavors.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(flavorSearch.toLowerCase()) ||
      f.description.toLowerCase().includes(flavorSearch.toLowerCase()) ||
      f.ingredients.some(i => i.toLowerCase().includes(flavorSearch.toLowerCase()));
    const matchesCat = flavorFilter === 'all' || f.category === flavorFilter;
    return matchesSearch && matchesCat;
  });

  const getCategoryBadgeClass = (category: PizzaFlavor['category']) => {
    switch (category) {
      case 'tradicional':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'especial':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'premium':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'doce':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Resumo da Pizzaria */}
      <div className="bg-gradient-to-r from-orange-950/40 via-red-950/20 to-neutral-900 border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-900/20">
              <Pizza className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Módulo Especializado: Pizzaria</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Forno & Sabores
                </span>
              </div>
              <p className="text-sm text-neutral-400 mt-1">
                Configure tamanhos com frações de sabores, bordas recheadas e catálogo categorizado de coberturas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGlobalSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Salvando...' : 'Salvar Pizzaria'}
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            {feedback}
          </div>
        )}

        {/* Mini stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80">
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Sabores Ativos</span>
            <div className="text-xl font-bold text-white mt-0.5">
              {catalog.flavors.filter(f => f.isAvailable).length}
              <span className="text-xs font-normal text-neutral-500 ml-1">/ {catalog.flavors.length}</span>
            </div>
          </div>
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Tamanhos</span>
            <div className="text-xl font-bold text-white mt-0.5">{catalog.sizes.length}</div>
          </div>
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Bordas Recheadas</span>
            <div className="text-xl font-bold text-white mt-0.5">{catalog.crusts.length}</div>
          </div>
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Ingredientes Extras</span>
            <div className="text-xl font-bold text-white mt-0.5">{catalog.commonAddons.length}</div>
          </div>
        </div>
      </div>

      {/* Sub-navegação interna */}
      <div className="flex border-b border-neutral-800 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('flavors')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'flavors'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Pizza className="w-4 h-4" /> Sabores de Pizza ({catalog.flavors.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sizes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sizes'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Tamanhos & Fatias ({catalog.sizes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('crusts')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'crusts'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Bordas Recheadas ({catalog.crusts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('addons')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'addons'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" /> Adicionais Extras ({catalog.commonAddons.length})
        </button>
      </div>

      {/* ABA 1: SABORES DE PIZZA */}
      {activeTab === 'flavors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar sabor ou ingrediente..."
                  value={flavorSearch}
                  onChange={e => setFlavorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              {/* Filtro por categoria */}
              <select
                value={flavorFilter}
                onChange={e => setFlavorFilter(e.target.value as any)}
                aria-label="Filtrar por categoria"
                className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500/50"
              >
                <option value="all">Todas as Categorias</option>
                <option value="tradicional">Tradicionais</option>
                <option value="especial">Especiais</option>
                <option value="premium">Premium</option>
                <option value="doce">Doces</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleOpenFlavorModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Sabor
            </button>
          </div>

          {/* Grid de Sabores */}
          {filteredFlavors.length === 0 ? (
            <div className="p-8 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl text-neutral-400">
              <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              Nenhum sabor encontrado para o filtro atual.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFlavors.map(flavor => (
                <div
                  key={flavor.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    flavor.isAvailable
                      ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                      : 'bg-neutral-950/40 border-neutral-800/40 opacity-70'
                  }`}
                >
                  <div className="flex gap-4">
                    {flavor.photoUrl ? (
                      <img
                        src={flavor.photoUrl}
                        alt={flavor.name}
                        className="w-20 h-20 rounded-xl object-cover border border-neutral-800 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-neutral-800/60 border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-500">
                        <Pizza className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                              flavor.category
                            )}`}
                          >
                            {flavor.category}
                          </span>
                          <h4 className="text-base font-semibold text-white mt-1 truncate">
                            {flavor.name}
                          </h4>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleFlavorAvailability(flavor.id)}
                            title={flavor.isAvailable ? 'Disponível no cardápio' : 'Indisponível hoje'}
                            className={`p-1.5 rounded-lg border transition-all ${
                              flavor.isAvailable
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            {flavor.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenFlavorModal(flavor)}
                            title="Editar sabor"
                            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFlavor(flavor.id)}
                            title="Excluir sabor"
                            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {flavor.description || 'Sem descrição cadastrada.'}
                      </p>

                      {flavor.ingredients && flavor.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {flavor.ingredients.map((ing, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-neutral-800/90 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-700/50"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: TAMANHOS & FATIAS */}
      {activeTab === 'sizes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Tamanhos de Pizza e Frações</h3>
              <p className="text-xs text-neutral-400">
                Defina o número de fatias, preço base inicial e quantos sabores o cliente pode escolher por tamanho (ex: meia a meia).
              </p>
            </div>
            {!isAddingSize && (
              <button
                type="button"
                onClick={() => setIsAddingSize(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" /> Adicionar Tamanho
              </button>
            )}
          </div>

          {/* Form inline para adicionar tamanho */}
          {isAddingSize && (
            <form onSubmit={handleAddSize} className="p-4 bg-neutral-900 border border-orange-500/30 rounded-2xl space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Nome do Tamanho *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gigante (12 Fatias)"
                    value={newSize.name || ''}
                    onChange={e => setNewSize({ ...newSize, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Número de Fatias</label>
                  <input
                    type="number"
                    min="1"
                    value={newSize.slices || 8}
                    onChange={e => setNewSize({ ...newSize, slices: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Preço Base (R$)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newSize.basePrice || 0}
                    onChange={e => setNewSize({ ...newSize, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Máx. Sabores Permitidos</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSize.maxFlavors || 2}
                    onChange={e => setNewSize({ ...newSize, maxFlavors: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSize(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
                >
                  Salvar Tamanho
                </button>
              </div>
            </form>
          )}

          {/* Lista de Tamanhos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {catalog.sizes.map(size => (
              <div
                key={size.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white">{size.name}</h4>
                    <button
                      type="button"
                      onClick={() => handleDeleteSize(size.id)}
                      className="text-neutral-500 hover:text-red-400 p-1 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-neutral-300">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Fatias:</span>
                      <span className="font-semibold">{size.slices} fatias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Sabores permitidos:</span>
                      <span className="font-semibold text-orange-400">Até {size.maxFlavors} sabores</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">A partir de</span>
                  <span className="text-base font-extrabold text-white">
                    R$ {size.basePrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: BORDAS RECHEADAS */}
      {activeTab === 'crusts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Bordas Recheadas</h3>
              <p className="text-xs text-neutral-400">
                Configure as opções de borda e valor adicional cobrado por personalização.
              </p>
            </div>
            {!isAddingCrust && (
              <button
                type="button"
                onClick={() => setIsAddingCrust(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" /> Nova Borda
              </button>
            )}
          </div>

          {isAddingCrust && (
            <form onSubmit={handleAddCrust} className="p-4 bg-neutral-900 border border-orange-500/30 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Nome da Borda *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Borda Philadelphia"
                    value={newCrust.name || ''}
                    onChange={e => setNewCrust({ ...newCrust, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Preço Adicional (R$)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newCrust.additionalPrice || 0}
                    onChange={e => setNewCrust({ ...newCrust, additionalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCrust(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
                >
                  Salvar Borda
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {catalog.crusts.map(crust => (
              <div
                key={crust.id}
                className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between hover:border-neutral-700"
              >
                <div>
                  <span className="font-semibold text-white text-sm block">{crust.name}</span>
                  <span className="text-xs text-neutral-400 mt-0.5 block">
                    {crust.additionalPrice > 0
                      ? `+ R$ ${crust.additionalPrice.toFixed(2).replace('.', ',')}`
                      : 'Sem acréscimo (Grátis)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCrust(crust.id)}
                  className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: ADICIONAIS EXTRAS */}
      {activeTab === 'addons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Adicionais Extras</h3>
              <p className="text-xs text-neutral-400">
                Itens avulsos que podem ser acrescentados à pizza (ex: bacon extra, alho frito, manjericão fresco).
              </p>
            </div>
            {!isAddingAddon && (
              <button
                type="button"
                onClick={() => setIsAddingAddon(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/30 text-xs font-semibold"
              >
                <Plus className="w-4 h-4" /> Novo Adicional
              </button>
            )}
          </div>

          {isAddingAddon && (
            <form onSubmit={handleAddAddon} className="p-4 bg-neutral-900 border border-orange-500/30 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Nome do Adicional *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alho frito dourado"
                    value={newAddon.name || ''}
                    onChange={e => setNewAddon({ ...newAddon, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={newAddon.price || 0}
                    onChange={e => setNewAddon({ ...newAddon, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddon(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
                >
                  Salvar Adicional
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {catalog.commonAddons.map(addon => (
              <div
                key={addon.id}
                className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between hover:border-neutral-700"
              >
                <div>
                  <span className="font-semibold text-white text-sm block">{addon.name}</span>
                  <span className="text-xs text-orange-400 mt-0.5 block">
                    + R$ {addon.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddon(addon.id)}
                  className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: EDITAR / CRIAR SABOR */}
      {isFlavorModalOpen && editingFlavor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pizza className="w-5 h-5 text-orange-500" />
                {editingFlavor.name ? `Editar: ${editingFlavor.name}` : 'Novo Sabor de Pizza'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFlavorModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFlavorModal} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nome do Sabor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Frango com Catupiry Supremo"
                    value={editingFlavor.name}
                    onChange={e => setEditingFlavor({ ...editingFlavor, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Categoria da Pizza *
                  </label>
                  <select
                    value={editingFlavor.category}
                    onChange={e =>
                      setEditingFlavor({ ...editingFlavor, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="tradicional">Tradicional</option>
                    <option value="especial">Especial</option>
                    <option value="premium">Premium / Gourmet</option>
                    <option value="doce">Doce / Sobremesa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Disponibilidade Imediata
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingFlavor.isAvailable}
                        onChange={e =>
                          setEditingFlavor({ ...editingFlavor, isAvailable: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                    <span className="text-xs text-neutral-300">
                      {editingFlavor.isAvailable ? 'Disponível no app' : 'Pausado / Esgotado'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Descrição Detalhada
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Conte sobre os ingredientes nobres, método de preparo..."
                    value={editingFlavor.description}
                    onChange={e =>
                      setEditingFlavor({ ...editingFlavor, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Ingredientes (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Molho artesanal, Mussarela, Peito de frango desfiado, Catupiry original"
                    value={tempIngredients}
                    onChange={e => setTempIngredients(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Os ingredientes aparecem em etiquetas visuais para o cliente conferir.
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    URL da Foto da Pizza
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editingFlavor.photoUrl || ''}
                    onChange={e => setEditingFlavor({ ...editingFlavor, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsFlavorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-600/20"
                >
                  Confirmar Sabor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
