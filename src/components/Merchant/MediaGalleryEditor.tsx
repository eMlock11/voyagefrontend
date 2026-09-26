import React, { useState } from 'react';
import {
  Image,
  Upload,
  Trash2,
  Star,
  Plus,
  Filter
} from 'lucide-react';
import type { MediaItem } from '../../types/merchant';

interface MediaGalleryEditorProps {
  media: MediaItem[];
  onChange: (updatedMedia: MediaItem[]) => void;
}

export const MediaGalleryEditor: React.FC<MediaGalleryEditorProps> = ({
  media,
  onChange
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleUploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: MediaItem = {
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          url: reader.result as string,
          title: file.name.split('.')[0] || 'Foto do Estabelecimento',
          category: 'internal',
          isPrimary: media.length === 0
        };
        onChange([...media, newItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange(media.filter((item) => item.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    onChange(
      media.map((item) => ({
        ...item,
        isPrimary: item.id === id
      }))
    );
  };

  const handleChangeCategory = (id: string, newCategory: MediaItem['category']) => {
    onChange(
      media.map((item) =>
        item.id === id ? { ...item, category: newCategory } : item
      )
    );
  };

  const filteredItems = filterCategory === 'all'
    ? media
    : media.filter((item) => item.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Galeria de Fotos & Mídia</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione fotos reais da fachada, ambiente interno, pratos e equipe para atrair mais clientes no mapa.
          </p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors">
            <Plus size={16} />
            <span>Adicionar Fotos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadFiles}
            />
          </label>
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
          <Filter size={12} />
          Filtrar:
        </span>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'internal', label: 'Ambiente Interno' },
          { key: 'external', label: 'Fachada & Externo' },
          { key: 'products', label: 'Produtos / Pratos' },
          { key: 'services', label: 'Serviços' }
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilterCategory(f.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterCategory === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de Imagens */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-2xl bg-slate-900/40">
          <Image size={40} className="mx-auto text-slate-600 mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">Nenhuma foto adicionada ainda</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Estabelecimentos com fotos reais recebem até 4x mais rotas e contatos no Voyage.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
            <Upload size={14} />
            <span>Fazer Upload da Primeira Foto</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUploadFiles}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-900 rounded-xl overflow-hidden border border-white/10 flex flex-col"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-950 relative">
                <img
                  src={item.url}
                  alt={item.title || 'Foto'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {item.isPrimary && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold shadow">
                    Foto Principal
                  </span>
                )}

                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(item.id)}
                    title={item.isPrimary ? 'Foto principal' : 'Definir como principal'}
                    className={`p-1.5 rounded-lg text-xs ${
                      item.isPrimary
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/20 text-white hover:bg-amber-500 hover:text-slate-950'
                    } transition-colors`}
                  >
                    <Star size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Excluir foto"
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-2.5">
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleChangeCategory(item.id, e.target.value as MediaItem['category'])
                  }
                  className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="internal">Ambiente Interno</option>
                  <option value="external">Fachada & Externo</option>
                  <option value="products">Produtos / Cardápio</option>
                  <option value="services">Serviços</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
