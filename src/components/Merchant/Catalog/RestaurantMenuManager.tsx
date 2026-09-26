import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  ChefHat
} from 'lucide-react';
import type { RestaurantCatalog, MenuItem, MenuCategory } from '../../../types/catalog';

interface RestaurantMenuManagerProps {
  catalog?: RestaurantCatalog;
  initialData?: RestaurantCatalog;
  onChange?: (updatedCatalog: RestaurantCatalog) => void;
  onSave?: (updatedCatalog: RestaurantCatalog) => void;
  isLoading?: boolean;
}

const DEFAULT_RESTAURANT_DATA: RestaurantCatalog = {
  categories: [
    { id: 'cat_entradas', name: 'Entradas & Petiscos', order: 1 },
    { id: 'cat_principais', name: 'Pratos Principais', order: 2 },
    { id: 'cat_sobremesas', name: 'Sobremesas', order: 3 },
    { id: 'cat_bebidas', name: 'Bebidas & Drinques', order: 4 }
  ],
  items: [],
  commonAddons: [],
  diningOptions: {
    aLaCarte: true,
    buffet: false,
    buffetKg: false,
    selfService: false,
    pratoFeito: false,
    delivery: true,
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
  const currentCatalog = propCatalog || initialData || DEFAULT_RESTAURANT_DATA;
  const notifyChange = (updated: RestaurantCatalog) => {
    if (onChange) onChange(updated);
    if (onSave) onSave(updated);
  };
  const catalog = currentCatalog;
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

  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Adicionar nova categoria
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: MenuCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
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
    if (!editingItem.name || !editingItem.price) {
      alert('Por favor, informe o nome e o preço do prato/produto.');
      return;
    }

    let updatedItems: MenuItem[];
    if (editingItem.id) {
      updatedItems = catalog.items.map((i) =>
        i.id === editingItem.id ? (editingItem as MenuItem) : i
      );
    } else {
      const newItem: MenuItem = {
        id: `item-${Date.now()}`,
        name: editingItem.name,
        description: editingItem.description || '',
        price: Number(editingItem.price),
        promoPrice: editingItem.promoPrice ? Number(editingItem.promoPrice) : undefined,
        categoryId: editingItem.categoryId || selectedCategory,
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
      categoryId: selectedCategory,
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
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ChefHat size={14} className="text-amber-400" />
          <span>Modalidades do Estabelecimento</span>
        </h4>
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
                    onChange={(e) => setEditingItem({ ...editingItem, promoPrice: parseFloat(e.target.value) || undefined })}
                    placeholder="24.90"
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ingredientes (separados por vírgula)</label>
                <input
                  type="text"
                  value={editingItem.ingredients?.join(', ') || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      ingredients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                    })
                  }
                  placeholder="Pão brioche, Carne 180g, Queijo cheddar, Bacon"
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="item-available"
                  checked={editingItem.isAvailable !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                  className="rounded bg-slate-800 border-white/10 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="item-available" className="text-xs font-medium text-slate-300">
                  Item disponível para pedidos no momento
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditingItem(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
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
