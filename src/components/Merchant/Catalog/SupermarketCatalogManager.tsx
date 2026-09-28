import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  X,
  Tag,
  Calendar,
  FileText,
  Search,
  AlertCircle,
  PackageCheck,
  Sparkles
} from 'lucide-react';
import {
  SupermarketCatalog,
  SupermarketProduct,
  WeeklyOffer,
  ProductUnit
} from '../../../types/catalog';
import {
  isOfferActive,
  calculateDiscountPct,
  validatePrice,
  validatePromoPrice,
  validateDateRange,
  getTodayDateString
} from '../../../utils/catalogValidators';

interface SupermarketCatalogManagerProps {
  initialData?: SupermarketCatalog;
  onSave: (data: SupermarketCatalog) => void;
  isLoading?: boolean;
}

const EMPTY_SUPERMARKET_DATA: SupermarketCatalog = {
  categories: ['Geral'],
  products: [],
  offers: [],
  flyers: []
};

const DEMO_SUPERMARKET_DATA: SupermarketCatalog = {
  categories: [
    'Hortifrúti',
    'Açougue & Aves',
    'Padaria & Confeitaria',
    'Laticínios & Queijos',
    'Bebidas & Adega',
    'Mercearia & Matinais',
    'Higiene & Beleza',
    'Limpeza'
  ],
  products: [
    {
      id: 'prod_demo_1',
      name: 'Café Torrado e Moído Tradicional 500g',
      brand: 'Pilão',
      category: 'Mercearia & Matinais',
      unit: 'pacote',
      price: 19.9,
      promoPrice: 16.49,
      isAvailable: true,
      description: 'Café forte e encorpado com grãos selecionados.'
    },
    {
      id: 'prod_demo_2',
      name: 'Leite Integral UHT 1L',
      brand: 'Piracanjuba',
      category: 'Laticínios & Queijos',
      unit: 'l',
      price: 5.89,
      isAvailable: true,
      description: 'Leite integral homogeneizado enriquecido com vitaminas.'
    },
    {
      id: 'prod_demo_3',
      name: 'Alcatra Bovina Resfriada',
      brand: 'Friboi',
      category: 'Açougue & Aves',
      unit: 'kg',
      price: 44.9,
      promoPrice: 38.9,
      isAvailable: true,
      description: 'Corte nobre e macio, ideal para bifes e grelhados.'
    }
  ],
  offers: [
    {
      id: 'off_demo_1',
      productId: 'prod_demo_3',
      productName: 'Alcatra Bovina Resfriada (kg)',
      regularPrice: 44.9,
      promoPrice: 38.9,
      discountPct: 13,
      startDate: getTodayDateString(),
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      customerLimit: 5
    }
  ],
  flyers: []
};

const UNIT_OPTIONS: { value: ProductUnit; label: string }[] = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilo (kg)' },
  { value: 'g', label: 'Gramas (g)' },
  { value: 'l', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'pacote', label: 'Pacote' },
  { value: 'bandeja', label: 'Bandeja' }
];

export const SupermarketCatalogManager: React.FC<SupermarketCatalogManagerProps> = ({
  initialData,
  onSave,
  isLoading = false
}) => {
  // Inicialização limpa: não carrega dados fictícios no fluxo normal
  const [catalog, setCatalog] = useState<SupermarketCatalog>(
    initialData && (initialData.products?.length > 0 || initialData.categories?.length > 0)
      ? initialData
      : EMPTY_SUPERMARKET_DATA
  );

  const [activeTab, setActiveTab] = useState<'products' | 'offers' | 'flyers' | 'categories'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupermarketProduct | null>(null);
  const [productFormError, setProductFormError] = useState<string | null>(null);

  // Modal de Oferta
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<WeeklyOffer | null>(null);
  const [offerFormError, setOfferFormError] = useState<string | null>(null);

  // Nova Categoria
  const [newCatName, setNewCatName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Unificação: sincroniza com o rascunho pai a cada alteração
  const updateCatalog = (newCat: SupermarketCatalog, msg?: string) => {
    setCatalog(newCat);
    onSave(newCat);
    if (msg) {
      setFeedback(msg);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleLoadDemo = () => {
    if (
      catalog.products.length > 0 &&
      !confirm('Deseja carregar a estrutura de exemplo? Itens atuais serão substituídos pelo modelo demonstrativo.')
    ) {
      return;
    }
    updateCatalog(DEMO_SUPERMARKET_DATA, 'Exemplo de supermercado carregado no rascunho!');
  };

  // --- Handlers de Produto ---
  const handleOpenProductModal = (product?: SupermarketProduct) => {
    setProductFormError(null);
    if (product) {
      setEditingProduct({ ...product });
    } else {
      setEditingProduct({
        id: `prod_${Date.now()}`,
        name: '',
        brand: '',
        category: catalog.categories[0] || 'Geral',
        unit: 'un',
        price: 0,
        promoPrice: undefined,
        description: '',
        isAvailable: true
      });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProductModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProductFormError(null);

    const name = editingProduct.name.trim();
    if (!name) {
      setProductFormError('O nome do produto é obrigatório.');
      return;
    }

    const priceVal = validatePrice(editingProduct.price);
    if (!priceVal.valid) {
      setProductFormError(`Preço regular inválido: ${priceVal.error}`);
      return;
    }

    if (editingProduct.promoPrice !== undefined && editingProduct.promoPrice !== null) {
      const promoVal = validatePromoPrice(editingProduct.price, editingProduct.promoPrice);
      if (!promoVal.valid) {
        setProductFormError(`Preço promocional inválido: ${promoVal.error}`);
        return;
      }
    }

    const cleanProduct: SupermarketProduct = {
      ...editingProduct,
      name,
      price: Number(editingProduct.price),
      promoPrice: editingProduct.promoPrice ? Number(editingProduct.promoPrice) : undefined
    };

    const exists = catalog.products.some(p => p.id === cleanProduct.id);
    const updatedProducts = exists
      ? catalog.products.map(p => (p.id === cleanProduct.id ? cleanProduct : p))
      : [...catalog.products, cleanProduct];

    updateCatalog(
      { ...catalog, products: updatedProducts },
      exists ? 'Produto atualizado no rascunho!' : 'Produto adicionado ao rascunho!'
    );

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do catálogo?')) {
      const nextCat = {
        ...catalog,
        products: catalog.products.filter(p => p.id !== id),
        offers: catalog.offers.filter(o => o.productId !== id)
      };
      updateCatalog(nextCat, 'Produto removido do rascunho.');
    }
  };

  const handleToggleProductAvailability = (id: string) => {
    const updatedProducts = catalog.products.map(p =>
      p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
    );
    updateCatalog({ ...catalog, products: updatedProducts });
  };

  // --- Handlers de Ofertas da Semana ---
  const handleOpenOfferModal = (offer?: WeeklyOffer) => {
    setOfferFormError(null);
    if (offer) {
      setEditingOffer({ ...offer });
    } else {
      const today = getTodayDateString();
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      setEditingOffer({
        id: `off_${Date.now()}`,
        productName: '',
        regularPrice: 0,
        promoPrice: 0,
        discountPct: 0,
        startDate: today,
        endDate: nextWeek,
        customerLimit: undefined
      });
    }
    setIsOfferModalOpen(true);
  };

  const handleSaveOfferModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    setOfferFormError(null);

    const productName = editingOffer.productName.trim();
    if (!productName) {
      setOfferFormError('O nome do item da oferta é obrigatório.');
      return;
    }

    const priceVal = validatePrice(editingOffer.regularPrice);
    if (!priceVal.valid) {
      setOfferFormError(`Preço regular inválido: ${priceVal.error}`);
      return;
    }

    const promoVal = validatePromoPrice(editingOffer.regularPrice, editingOffer.promoPrice);
    if (!promoVal.valid) {
      setOfferFormError(`Preço de oferta inválido: ${promoVal.error}`);
      return;
    }

    const dateVal = validateDateRange(editingOffer.startDate, editingOffer.endDate);
    if (!dateVal.valid) {
      setOfferFormError(`Período da campanha inválido: ${dateVal.error}`);
      return;
    }

    const discountPct = calculateDiscountPct(editingOffer.regularPrice, editingOffer.promoPrice);

    const payload: WeeklyOffer = {
      ...editingOffer,
      productName,
      regularPrice: Number(editingOffer.regularPrice),
      promoPrice: Number(editingOffer.promoPrice),
      discountPct,
      customerLimit: editingOffer.customerLimit ? Number(editingOffer.customerLimit) : undefined
    };

    const exists = catalog.offers.some(o => o.id === payload.id);
    const updatedOffers = exists
      ? catalog.offers.map(o => (o.id === payload.id ? payload : o))
      : [...catalog.offers, payload];

    updateCatalog(
      { ...catalog, offers: updatedOffers },
      exists ? 'Oferta atualizada no rascunho!' : 'Oferta adicionada ao rascunho!'
    );

    setIsOfferModalOpen(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = (id: string) => {
    const updatedOffers = catalog.offers.filter(o => o.id !== id);
    updateCatalog({ ...catalog, offers: updatedOffers }, 'Oferta removida do rascunho.');
  };

  // --- Handlers de Categorias ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean) return;
    if (catalog.categories.includes(clean)) {
      setFeedback('Departamento já existe no catálogo.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const updatedCategories = [...catalog.categories, clean];
    updateCatalog({ ...catalog, categories: updatedCategories }, `Departamento "${clean}" adicionado ao rascunho.`);
    setNewCatName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Remover departamento "${cat}"?`)) {
      const updatedCategories = catalog.categories.filter(c => c !== cat);
      updateCatalog({ ...catalog, categories: updatedCategories }, `Departamento removido do rascunho.`);
    }
  };

  // Submissão explícita
  const handleExplicitSave = () => {
    onSave(catalog);
    setFeedback('Rascunho do Supermercado sincronizado com o painel!');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Contagem de ofertas vigentes (calculada com a regra pura de fuso/data)
  const activeOffersCount = catalog.offers.filter(o => isOfferActive(o)).length;

  // Filtros
  const filteredProducts = catalog.products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-neutral-900 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/20">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Módulo Especializado: Supermercado & Varejo</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <PackageCheck className="w-3 h-3" /> Gôndolas & Ofertas
                </span>
              </div>
              <p className="text-sm text-neutral-400 mt-1">
                Organize departamentos, ofertas da semana com datas de validade e encarte digital interativo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {catalog.products.length === 0 && (
              <button
                type="button"
                onClick={handleLoadDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition-colors"
                title="Carregar itens de exemplo para demonstração"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Carregar Exemplo
              </button>
            )}

            <button
              type="button"
              onClick={handleExplicitSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Salvando...' : 'Salvar Rascunho'}
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4" />
            {feedback}
          </div>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80">
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Produtos no Catálogo</span>
            <div className="text-xl font-bold text-white mt-0.5">
              {catalog.products.filter(p => p.isAvailable).length}
              <span className="text-xs font-normal text-neutral-500 ml-1">/ {catalog.products.length}</span>
            </div>
          </div>
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Ofertas Vigentes</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {activeOffersCount}
              <span className="text-xs font-normal text-neutral-500 ml-1">/ {catalog.offers.length}</span>
            </div>
          </div>
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Encartes Digitais</span>
            <div className="text-xl font-bold text-white mt-0.5">{catalog.flyers.length}</div>
          </div>
          <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            <span className="text-xs text-neutral-400">Departamentos</span>
            <div className="text-xl font-bold text-white mt-0.5">{catalog.categories.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Produtos ({catalog.products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'offers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" /> Ofertas da Semana ({catalog.offers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('flyers')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'flyers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Encartes Digitais ({catalog.flyers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" /> Departamentos ({catalog.categories.length})
        </button>
      </div>

      {/* ABA 1: PRODUTOS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar produto, marca..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                aria-label="Filtrar por departamento"
                className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">Todos os Departamentos</option>
                {catalog.categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleOpenProductModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800/80">
              <ShoppingCart className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Nenhum produto no catálogo</h3>
              <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
                Adicione os produtos comercializados pelo seu estabelecimento com preço, unidade e departamento.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenProductModal()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500"
                >
                  Cadastrar Primeiro Produto
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl text-sm font-medium hover:bg-neutral-700 border border-neutral-700"
                >
                  Carregar Exemplo
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(prod => (
                <div
                  key={prod.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    prod.isAvailable
                      ? 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                      : 'bg-neutral-900/40 border-neutral-800/50 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700 font-medium">
                        {prod.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleProductAvailability(prod.id)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-white"
                          title={prod.isAvailable ? 'Marcar como esgotado' : 'Marcar como disponível'}
                        >
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${prod.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {prod.isAvailable ? 'Ativo' : 'Esgotado'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenProductModal(prod)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mt-2 leading-snug">{prod.name}</h4>
                    {prod.brand && <p className="text-xs text-neutral-400 mt-0.5">Marca: {prod.brand}</p>}
                    {prod.description && <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{prod.description}</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-baseline justify-between">
                    <div>
                      {prod.promoPrice ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs text-neutral-500 line-through">
                            R$ {prod.price.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-lg font-bold text-emerald-400">
                            R$ {prod.promoPrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-white">
                          R$ {prod.price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="text-xs text-neutral-500 ml-1">/{prod.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: OFERTAS DA SEMANA */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Ofertas & Campanhas Especiais</h3>
              <p className="text-xs text-neutral-400">
                Itens com destaque promocional, data de vigência e limite indicativo por cliente.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenOfferModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" /> Criar Oferta
            </button>
          </div>

          {catalog.offers.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800/80">
              <Tag className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Nenhuma oferta cadastrada</h3>
              <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
                Crie promoções com prazo de validade determinado para atrair clientes locais.
              </p>
              <button
                type="button"
                onClick={() => handleOpenOfferModal()}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-500"
              >
                Cadastrar Oferta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {catalog.offers.map(offer => {
                const active = isOfferActive(offer);

                return (
                  <div
                    key={offer.id}
                    className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col justify-between hover:border-neutral-700 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              -{offer.discountPct}% OFF
                            </span>
                            {active ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Vigente
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
                                Fora de Vigência
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-white mt-1.5">{offer.productName}</h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenOfferModal(offer)}
                            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-xs text-neutral-500 line-through">
                          R$ {offer.regularPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xl font-extrabold text-emerald-400">
                          R$ {offer.promoPrice.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {offer.customerLimit && (
                        <span className="text-[11px] text-amber-400/90 block mt-1 font-medium">
                          * Limite indicativo de {offer.customerLimit} unidades por compra (informativo)
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        Válido de {offer.startDate} até {offer.endDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: ENCARTE DIGITAL */}
      {activeTab === 'flyers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Encartes e Folhetos de Ofertas</h3>
              <p className="text-xs text-neutral-400">
                Divulgue o encarte semanal de ofertas com link de imagem para os clientes folhearem.
              </p>
            </div>
          </div>

          {catalog.flyers.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/40 rounded-2xl border border-neutral-800/80">
              <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Nenhum encarte cadastrado</h3>
              <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
                Publique encartes e folhetos promocionais para seus clientes no painel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {catalog.flyers.map(flyer => (
                <div
                  key={flyer.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all flex flex-col"
                >
                  {flyer.imageUrl ? (
                    <img
                      src={flyer.imageUrl}
                      alt={flyer.title}
                      className="w-full h-44 object-cover border-b border-neutral-800"
                    />
                  ) : (
                    <div className="w-full h-44 bg-neutral-800 flex items-center justify-center text-neutral-500">
                      <FileText className="w-10 h-10" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{flyer.title}</h4>
                      <span className="text-xs text-neutral-400 mt-1 block">
                        Validade: {flyer.validFrom} a {flyer.validTo}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedFlyers = catalog.flyers.filter(f => f.id !== flyer.id);
                          updateCatalog({ ...catalog, flyers: updatedFlyers }, 'Encarte removido.');
                        }}
                        className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir Encarte
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: DEPARTAMENTOS */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Departamentos do Supermercado</h3>
            <p className="text-xs text-neutral-400">
              Crie e gerencie as seções que agrupam seus produtos (ex: Hortifrúti, Carnes, Bebidas).
            </p>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Novo departamento..."
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {catalog.categories.map(cat => (
              <div
                key={cat}
                className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between text-sm text-white"
              >
                <span>{cat}</span>
                {catalog.categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-neutral-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PRODUTO */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                {editingProduct.name ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {productFormError}
              </div>
            )}

            <form onSubmit={handleSaveProductModal} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Leite Integral 1L"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: Piracanjuba"
                    value={editingProduct.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Departamento *
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalog.categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Unidade de Medida *
                  </label>
                  <select
                    value={editingProduct.unit}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        unit: e.target.value as ProductUnit
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {UNIT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Preço Regular (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price || ''}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Preço Promocional (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Deixe vazio se não houver"
                    value={editingProduct.promoPrice ?? ''}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        promoPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Disponibilidade em Estoque
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isAvailable}
                        onChange={e =>
                          setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <span className="text-xs text-neutral-300">
                      {editingProduct.isAvailable ? 'Em Estoque' : 'Esgotado'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Descrição do Produto
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Informações nutricionais, detalhes ou recomendações..."
                    value={editingProduct.description || ''}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20"
                >
                  Confirmar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OFERTA DA SEMANA */}
      {isOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                {editingOffer.productName ? 'Editar Oferta' : 'Nova Oferta da Semana'}
              </h3>
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {offerFormError && (
              <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {offerFormError}
              </div>
            )}

            <form onSubmit={handleSaveOfferModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nome do Item da Oferta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Picanha Bovina Grill Resfriada (kg)"
                  value={editingOffer.productName}
                  onChange={e => setEditingOffer({ ...editingOffer, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Preço Original (De) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingOffer.regularPrice || ''}
                    onChange={e =>
                      setEditingOffer({ ...editingOffer, regularPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Preço de Oferta (Por) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingOffer.promoPrice || ''}
                    onChange={e =>
                      setEditingOffer({ ...editingOffer, promoPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Data Início da Campanha *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingOffer.startDate}
                    onChange={e => setEditingOffer({ ...editingOffer, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Data Término (Validade) *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingOffer.endDate}
                    onChange={e => setEditingOffer({ ...editingOffer, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Limite por Cliente / Compra (Opcional - Informativo)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 6 (nota informativa para o encarte)"
                  value={editingOffer.customerLimit || ''}
                  onChange={e =>
                    setEditingOffer({
                      ...editingOffer,
                      customerLimit: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Aviso: Este limite é apenas informativo para exibição no catálogo local, não havendo controle de checkout nesta versão.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20"
                >
                  Salvar Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
