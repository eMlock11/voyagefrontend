import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ChefHat,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { RestaurantCatalog, MenuItem, MenuCategory } from '../../../types/catalog';
import { validatePrice, validatePromoPrice } from '../../../utils/catalogValidators';

interface RestaurantMenuManagerProps {
  catalog?: RestaurantCatalog;
  initialData?: RestaurantCatalog;
  onChange?: (updatedCatalog: RestaurantCatalog) => void;
  onSave?: (updatedCatalog: RestaurantCatalog) => void;
  isLoading?: boolean;
}

const EMPTY_RESTAURANT_DATA: RestaurantCatalog = {
  categories: [],
  items: [],
  commonAddons: [],
  diningOptions: {
    aLaCarte: false,
    buffet: false,
    buffetKg: false,
    selfService: false,
    pratoFeito: false,
    delivery: false,
    takeout: false,
    dineIn: false
  }
};

const DEMO_RESTAURANT_DATA: RestaurantCatalog = {
  categories: [
    { id: 'cat_entradas', name: 'Entradas & Petiscos', order: 1 },
    { id: 'cat_principais', name: 'Pratos Principais', order: 2 },
    { id: 'cat_sobremesas', name: 'Sobremesas', order: 3 },
    { id: 'cat_bebidas', name: 'Bebidas & Drinques', order: 4 }
  ],
  items: [
    {
      id: 'demo_item_1',
      name: 'Batata Frita Rústica com Alecrim',
      description: 'Porção crocante temperada com flor de sal e ervas frescas.',
      price: 28.0,
      categoryId: 'cat_entradas',
      isAvailable: true,
      ingredients: ['Batata', 'Alecrim', 'Sal'],
      addons: []
    }
  ],
  commonAddons: [],
  diningOptions: {
    aLaCarte: true,
    buffet: false,
    buffetKg: false,
    selfService: false,
    pratoFeito: false,
    delivery: false,
    takeout: true,
    dineIn: true
  }
};

export const RestaurantMenuManager: React.FC<RestaurantMenuManagerProps> = ({
  catalog: propCatalog,
  initialData,
  onChange,
  onSave
}) => {
  const currentCatalog = propCatalog || initialData || EMPTY_RESTAURANT_DATA;
  const catalog = currentCatalog;

  const notifyChange = (updated: RestaurantCatalog) => {
    if (onChange) onChange(updated);
    if (onSave) onSave(updated);
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(
    catalog.categories[0]?.id || ''
  );
  const [isEditingItem, setIsEditingItem] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    categoryId: catalog.categories[0]?.id || '',
    ingredients: [],
    isAvailable: true,
    addons: []
  });
  const [formError, setFormError] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Carregar demonstração explicitamente
  const handleLoadDemo = () => {
    if (
      catalog.categories.length > 0 &&
      !confirm('Deseja carregar a estrutura de exemplo? Categorias e pratos atuais serão substituídos pelo modelo de demonstração.')
    ) {
      return;
    }
    notifyChange(DEMO_RESTAURANT_DATA);
    setSelectedCategory(DEMO_RESTAURANT_DATA.categories[0].id);
  };

  // Adicionar nova categoria
  const handleAddCategory = () => {
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: cleanName,
      order: catalog.categories.length + 1
    };
    const updated = {
      ...catalog,
      categories: [...catalog.categories, newCat]
    };
    notifyChange(updated);
    setSelectedCategory(newCat.id);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  // Remover categoria
  const handleRemoveCategory = (catId: string) => {
    const updatedCategories = catalog.categories.filter((c) => c.id !== catId);
    const updatedItems = catalog.items.filter((i) => i.categoryId !== catId);
    notifyChange({
      ...catalog,
      categories: updatedCategories,
      items: updatedItems
    });
    if (selectedCategory === catId) {
      setSelectedCategory(updatedCategories[0]?.id || '');
    }
  };

  // Salvar Item (Adicionar ou Editar)
  const handleSaveItem = () => {
    setFormError(null);
    const name = editingItem.name?.trim();
    if (!name) {
      setFormError('Por favor, informe o nome do prato/produto.');
      return;
    }

    const priceVal = validatePrice(Number(editingItem.price));
    if (!priceVal.valid) {
      setFormError(`Preço inválido: ${priceVal.error}`);
      return;
    }

    if (editingItem.promoPrice !== undefined && editingItem.promoPrice !== null) {
      const promoVal = validatePromoPrice(Number(editingItem.price), Number(editingItem.promoPrice));
      if (!promoVal.valid) {
        setFormError(`Preço promocional inválido: ${promoVal.error}`);
        return;
      }
    }

    const targetCategoryId = editingItem.categoryId || selectedCategory || catalog.categories[0]?.id;
    if (!targetCategoryId) {
      setFormError('Crie ou selecione uma categoria antes de adicionar itens ao cardápio.');
      return;
    }

    let updatedItems: MenuItem[];
    if (editingItem.id) {
      updatedItems = catalog.items.map((i) =>
        i.id === editingItem.id
          ? ({
              ...i,
              ...editingItem,
              name,
              price: Number(editingItem.price),
              promoPrice: editingItem.promoPrice ? Number(editingItem.promoPrice) : undefined,
              categoryId: targetCategoryId
            } as MenuItem)
          : i
      );
    } else {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        name,
        description: editingItem.description || '',
        price: Number(editingItem.price),
        promoPrice: editingItem.promoPrice ? Number(editingItem.promoPrice) : undefined,
        categoryId: targetCategoryId,
        ingredients: editingItem.ingredients || [],
        isAvailable: editingItem.isAvailable !== false,
        addons: editingItem.addons || [],
        photoUrl: editingItem.photoUrl
      };
      updatedItems = [...catalog.items, newItem];
    }

    notifyChange({
      ...catalog,
      items: updatedItems
    });
    setIsEditingItem(false);
    setEditingItem({
      name: '',
      description: '',
      price: 0,
      categoryId: targetCategoryId,
      ingredients: [],
      isAvailable: true,
      addons: []
    });
  };

  const handleToggleItemAvailability = (itemId: string) => {
    notifyChange({
      ...catalog,
      items: catalog.items.map((i) =>
        i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
      )
    });
  };

  const handleToggleDiningOption = (key: keyof typeof catalog.diningOptions) => {
    notifyChange({
      ...catalog,
      diningOptions: {
        ...catalog.diningOptions,
        [key]: !catalog.diningOptions[key]
      }
    });
  };

  const filteredItems = catalog.items.filter(
    (item) => item.categoryId === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* 1. Modalidades de Atendimento / Serviço */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ChefHat size={14} className="text-amber-400" />
            <span>Modalidades de Atendimento Oferecidas</span>
          </h4>
          {catalog.categories.length === 0 && (
            <button
              type="button"
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[11px]"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Carregar Exemplo
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'aLaCarte', label: 'À la Carte' },
            { key: 'pratoFeito', label: 'Prato Feito / Executivo' },
            { key: 'buffet', label: 'Buffet Livre' },
            { key: 'buffetKg', label: 'Buffet por KG' },
            { key: 'selfService', label: 'Self-Service' },
            { key: 'delivery', label: 'Delivery' },
            { key: 'takeout', label: 'Retirada' },
            { key: 'dineIn', label: 'Consumo no Local' }
          ].map((opt) => {
            const isChecked = catalog.diningOptions[opt.key as keyof typeof catalog.diningOptions];
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleToggleDiningOption(opt.key as keyof typeof catalog.diningOptions)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isChecked
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-800 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {isChecked ? '✓ ' : ''}{opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Categorias do Cardápio & Itens */}
      <div className="space-y-4">
        {/* Abas de Categorias */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {catalog.categories.map((cat) => (
            <div key={cat.id} className="flex items-center group">
              <button
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
              {catalog.categories.length > 1 && selectedCategory === cat.id && (
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat.id)}
                  title="Excluir categoria"
                  className="ml-1 p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}

          {isAddingCategory ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nome da categoria..."
                className="bg-slate-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="px-3 py-1.5 rounded-xl border border-dashed border-white/20 text-slate-400 hover:text-indigo-400 hover:border-indigo-400 text-xs font-medium flex items-center gap-1 whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Nova Categoria</span>
            </button>
          )}
        </div>

        {catalog.categories.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-white/5">
            <ChefHat className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">Nenhuma categoria no cardápio</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Crie categorias como Entradas, Pratos Principais ou Sobremesas para organizar seus itens.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCategory(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Criar Primeira Categoria
              </button>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-white/10"
              >
                Carregar Exemplo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Botão de Adicionar Produto nesta Categoria */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {filteredItems.length} item(ns) nesta categoria
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingItem({
                    name: '',
                    description: '',
                    price: 0,
                    categoryId: selectedCategory,
                    ingredients: [],
                    isAvailable: true,
                    addons: []
                  });
                  setFormError(null);
                  setIsEditingItem(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all"
              >
                <Plus size={14} />
                <span>Adicionar ao Cardápio</span>
              </button>
            </div>

            {/* Lista de Itens do Cardápio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.isAvailable
                      ? 'bg-slate-900/80 border-white/10'
                      : 'bg-slate-950/60 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-white">{item.name}</h5>
                        {!item.isAvailable && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold">
                            Esgotado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>

                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-sm font-extrabold text-emerald-400">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                        {item.promoPrice && (
                          <span className="text-xs text-slate-500 line-through">
                            R$ {item.promoPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>

                      {item.addons && item.addons.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-400">Adicionais: </span>
                          {item.addons.map((a) => `${a.name} (+R$ ${a.price.toFixed(2)})`).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleItemAvailability(item.id)}
                        title={item.isAvailable ? 'Marcar como indisponível' : 'Marcar como disponível'}
                        className={`p-1.5 rounded-lg text-xs ${
                          item.isAvailable
                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                            : 'text-slate-500 hover:text-emerald-400'
                        }`}
                      >
                        {item.isAvailable ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setFormError(null);
                          setIsEditingItem(true);
                        }}
                        title="Editar item"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          notifyChange({
                            ...catalog,
                            items: catalog.items.filter((i) => i.id !== item.id)
                          });
                        }}
                        title="Excluir item"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL DE EDIÇÃO DE ITEM */}
      {isEditingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingItem.id ? 'Editar Item do Cardápio' : 'Novo Item do Cardápio'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingItem(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Prato/Produto *</label>
                <input
                  type="text"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="Ex: X-Bacon Artesanal 180g"
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.price || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    placeholder="29.90"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.promoPrice || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, promoPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Deixe vazio se não houver"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição & Detalhes</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Descreva o sabor, porção, pontos da carne e detalhes..."
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditingItem(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Salvar Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
