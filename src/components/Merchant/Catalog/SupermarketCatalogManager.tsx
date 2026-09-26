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
  Percent,
  FileText,
  Search,
  AlertCircle,
  Eye,
  EyeOff,
  PackageCheck
} from 'lucide-react';
import {
  SupermarketCatalog,
  SupermarketProduct,
  WeeklyOffer,
  ProductUnit
} from '../../../types/catalog';

interface SupermarketCatalogManagerProps {
  initialData?: SupermarketCatalog;
  onSave: (data: SupermarketCatalog) => void;
  isLoading?: boolean;
}

const DEFAULT_SUPERMARKET_DATA: SupermarketCatalog = {
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
      id: 'prod_1',
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
      id: 'prod_2',
      name: 'Leite Integral UHT 1L',
      brand: 'Piracanjuba',
      category: 'Laticínios & Queijos',
      unit: 'l',
      price: 5.89,
      isAvailable: true,
      description: 'Leite integral homogeneizado enriquecido com vitaminas.'
    },
    {
      id: 'prod_3',
      name: 'Alcatra Bovina Resfriada',
      brand: 'Friboi',
      category: 'Açougue & Aves',
      unit: 'kg',
      price: 44.9,
      promoPrice: 38.9,
      isAvailable: true,
      description: 'Corte nobre e macio, ideal para bifes e grelhados.'
    },
    {
      id: 'prod_4',
      name: 'Maçã Fuji Nacional',
      category: 'Hortifrúti',
      unit: 'kg',
      price: 10.99,
      promoPrice: 8.49,
      isAvailable: true,
      description: 'Maçãs doces e crocantes, frescas do produtor.'
    }
  ],
  offers: [
    {
      id: 'off_1',
      productId: 'prod_3',
      productName: 'Alcatra Bovina Resfriada (kg)',
      regularPrice: 44.9,
      promoPrice: 38.9,
      discountPct: 13,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      customerLimit: 5
    },
    {
      id: 'off_2',
      productId: 'prod_1',
      productName: 'Café Torrado e Moído 500g',
      regularPrice: 19.9,
      promoPrice: 16.49,
      discountPct: 17,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      customerLimit: 10
    }
  ],
  flyers: [
    {
      id: 'fly_1',
      title: 'Encarte Especial de Fim de Semana',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]
    }
  ]
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
  const [catalog, setCatalog] = useState<SupermarketCatalog>(initialData || DEFAULT_SUPERMARKET_DATA);
  const [activeTab, setActiveTab] = useState<'products' | 'offers' | 'flyers' | 'categories'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal de Produto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupermarketProduct | null>(null);

  // Modal de Oferta
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<WeeklyOffer | null>(null);

  // Nova Categoria
  const [newCatName, setNewCatName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Handlers de Produto ---
  const handleOpenProductModal = (product?: SupermarketProduct) => {
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
    if (!editingProduct || !editingProduct.name.trim()) return;

    setCatalog(prev => {
      const exists = prev.products.some(p => p.id === editingProduct.id);
      return {
        ...prev,
        products: exists
          ? prev.products.map(p => (p.id === editingProduct.id ? editingProduct : p))
          : [...prev.products, editingProduct]
      };
    });

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do catálogo?')) {
      setCatalog(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id),
        offers: prev.offers.filter(o => o.productId !== id)
      }));
    }
  };

  const handleToggleProductAvailability = (id: string) => {
    setCatalog(prev => ({
      ...prev,
      products: prev.products.map(p => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    }));
  };

  // --- Handlers de Ofertas da Semana ---
  const handleOpenOfferModal = (offer?: WeeklyOffer) => {
    if (offer) {
      setEditingOffer({ ...offer });
    } else {
      const today = new Date().toISOString().split('T')[0];
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
    if (!editingOffer || !editingOffer.productName.trim()) return;

    // Recalcula o percentual de desconto se regularPrice > 0
    let discountPct = editingOffer.discountPct;
    if (editingOffer.regularPrice > 0 && editingOffer.promoPrice > 0) {
      discountPct = Math.round(
        ((editingOffer.regularPrice - editingOffer.promoPrice) / editingOffer.regularPrice) * 100
      );
    }

    const payload: WeeklyOffer = {
      ...editingOffer,
      discountPct
    };

    setCatalog(prev => {
      const exists = prev.offers.some(o => o.id === payload.id);
      return {
        ...prev,
        offers: exists
          ? prev.offers.map(o => (o.id === payload.id ? payload : o))
          : [...prev.offers, payload]
      };
    });

    setIsOfferModalOpen(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = (id: string) => {
    setCatalog(prev => ({
      ...prev,
      offers: prev.offers.filter(o => o.id !== id)
    }));
  };

  // --- Handlers de Categorias ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCatName.trim();
    if (!clean || catalog.categories.includes(clean)) return;

    setCatalog(prev => ({
      ...prev,
      categories: [...prev.categories, clean]
    }));
    setNewCatName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Remover departamento "${cat}"?`)) {
      setCatalog(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== cat)
      }));
    }
  };

  // Submissão Global
  const handleGlobalSave = () => {
    onSave(catalog);
    setFeedback('Catálogo do Supermercado salvo com sucesso!');
    setTimeout(() => setFeedback(null), 3000);
  };

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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleGlobalSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Salvando...' : 'Salvar Supermercado'}
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
            <span className="text-xs text-neutral-400">Ofertas Ativas</span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{catalog.offers.length}</div>
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium text-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Produto
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-neutral-900/40 border border-neutral-800 rounded-2xl text-neutral-400">
              <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              Nenhum produto cadastrado ou correspondente à busca.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const hasPromo = product.promoPrice && product.promoPrice < product.price;
                return (
                  <div
                    key={product.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      product.isAvailable
                        ? 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                        : 'bg-neutral-950/40 border-neutral-800/40 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                            {product.category}
                          </span>
                          <h4 className="text-base font-semibold text-white mt-1.5 leading-snug">
                            {product.name}
                          </h4>
                          {product.brand && (
                            <span className="text-xs text-neutral-400 block mt-0.5">
                              Marca: <span className="text-neutral-300 font-medium">{product.brand}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleProductAvailability(product.id)}
                            title={product.isAvailable ? 'Em estoque' : 'Indisponível'}
                            className={`p-1.5 rounded-lg border transition-all ${
                              product.isAvailable
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                          >
                            {product.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenProductModal(product)}
                            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {product.description && (
                        <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-500 block uppercase">
                          Unidade: {product.unit}
                        </span>
                        {hasPromo ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-neutral-500 line-through">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-base font-extrabold text-emerald-400">
                              R$ {product.promoPrice?.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base font-extrabold text-white">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>

                      {hasPromo && (
                        <span className="text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Percent className="w-3 h-3" /> Em Oferta
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                Itens com destaque em promoções sazonais, data limite de validade e teto por cliente.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalog.offers.map(offer => {
              const today = new Date().toISOString().split('T')[0];
              const isExpired = offer.endDate < today;

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
                          {isExpired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30">
                              Expirada
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
                        * Limite de {offer.customerLimit} unidades por cliente / compra
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
        </div>
      )}

      {/* ABA 3: ENCARTE DIGITAL */}
      {activeTab === 'flyers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Encartes e Folhetos de Ofertas</h3>
              <p className="text-xs text-neutral-400">
                Divulgue o jornalzinho semanal de ofertas com link de imagem ou documento PDF para os clientes folhearem.
              </p>
            </div>
          </div>

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
                      onClick={() =>
                        setCatalog(prev => ({
                          ...prev,
                          flyers: prev.flyers.filter(f => f.id !== flyer.id)
                        }))
                      }
                      className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir Encarte
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-neutral-500 hover:text-red-400 p-1 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PRODUTO */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-500" />
                {editingProduct.name ? `Editar: ${editingProduct.name}` : 'Novo Produto de Supermercado'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Arroz Tipo 1 Longo Fino 5kg"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tio João"
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
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
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
                      setEditingProduct({ ...editingProduct, unit: e.target.value as ProductUnit })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {UNIT_OPTIONS.map(u => (
                      <option key={u.value} value={u.value}>
                        {u.label}
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
                    placeholder="Ex: 14.99"
                    value={editingProduct.promoPrice || ''}
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
                  Limite por Cliente / Compra (Opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 6"
                  value={editingOffer.customerLimit || ''}
                  onChange={e =>
                    setEditingOffer({
                      ...editingOffer,
                      customerLimit: e.target.value ? Number(e.target.value) : undefined
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
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
