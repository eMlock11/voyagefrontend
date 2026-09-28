import React, { useState } from 'react';
import {
  Image,
  Upload,
  Trash2,
  Star,
  Plus,
  Filter,
  AlertCircle,
  Info
} from 'lucide-react';
import type { MediaItem } from '../../types/merchant';
import {
  validateMediaFiles,
  saveMediaBlob,
  deleteMediaBlob,
  MEDIA_LIMITS
} from '../../utils/mediaStorage';

interface MediaGalleryEditorProps {
  media: MediaItem[];
  onChange: (updatedMedia: MediaItem[]) => void;
}

export const MediaGalleryEditor: React.FC<MediaGalleryEditorProps> = ({
  media,
  onChange
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [rejectionErrors, setRejectionErrors] = useState<{ name: string; reason: string }[]>([]);

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { validFiles, rejectedFiles } = validateMediaFiles(files, media.length);
    setRejectionErrors(rejectedFiles);

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const newItems: MediaItem[] = await Promise.all(
        validFiles.map(async (file, idx) => {
          const id = `media-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
          const objectUrl = await saveMediaBlob(id, file);
          return {
            id,
            url: objectUrl,
            title: file.name.split('.')[0] || 'Foto do Estabelecimento',
            category: 'internal' as const,
            isPrimary: media.length === 0 && idx === 0
          };
        })
      );

      onChange([...media, ...newItems]);
    } catch {
      setRejectionErrors((prev) => [
        ...prev,
        { name: 'Upload', reason: 'Falha ao processar as fotos selecionadas.' }
      ]);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveItem = async (id: string) => {
    await deleteMediaBlob(id);
    const updated = media.filter((item) => item.id !== id);
    const removedWasPrimary = media.find((m) => m.id === id)?.isPrimary;
    if (removedWasPrimary && updated.length > 0) {
      updated[0] = { ...updated[0], isPrimary: true };
    }
    onChange(updated);
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

  const filteredItems =
    filterCategory === 'all'
      ? media
      : media.filter((item) => item.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header com limites documentados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Galeria de Fotos & Mídia</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
              {media.length} / {MEDIA_LIMITS.MAX_TOTAL_ITEMS} fotos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Adicione imagens do ambiente interno, fachada, produtos e serviços. Limite de {MEDIA_LIMITS.MAX_FILE_SIZE_MB}MB por foto (JPG, PNG ou WebP).
          </p>
        </div>

        <div>
          <label
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-md transition-colors ${
              media.length >= MEDIA_LIMITS.MAX_TOTAL_ITEMS || isUploading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
            }`}
          >
            <Plus size={16} />
            <span>{isUploading ? 'Processando fotos...' : 'Adicionar Fotos'}</span>
            <input
              type="file"
              accept={MEDIA_LIMITS.ALLOWED_EXTENSIONS.join(',')}
              multiple
              disabled={media.length >= MEDIA_LIMITS.MAX_TOTAL_ITEMS || isUploading}
              className="hidden"
              onChange={handleUploadFiles}
            />
          </label>
        </div>
      </div>

      {/* Aviso de Transparência sobre Armazenamento */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2.5">
        <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-indigo-300 font-semibold">Prévia de Rascunho Local:</strong> As fotos adicionadas são armazenadas localmente neste navegador via IndexedDB. Não há publicação remota de fotos na API nesta versão.
        </div>
      </div>

      {/* Erros e Rejeições de Upload */}
      {rejectionErrors.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-xs text-rose-300 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-200">
            <AlertCircle size={15} />
            <span>Arquivos rejeitados:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {rejectionErrors.map((err, idx) => (
              <li key={idx}>
                <strong>{err.name}</strong>: {err.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

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
          { key: 'products', label: 'Produtos / Cardápio' },
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
            Adicione fotos reais para enriquecer o perfil visual do estabelecimento.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
            <Upload size={14} />
            <span>Fazer Upload da Primeira Foto</span>
            <input
              type="file"
              accept={MEDIA_LIMITS.ALLOWED_EXTENSIONS.join(',')}
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
              className={`group relative rounded-xl overflow-hidden border bg-slate-900 transition-all ${
                item.isPrimary ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-white/10'
              }`}
            >
              <div className="aspect-square relative overflow-hidden bg-slate-950">
                <img
                  src={item.url}
                  alt={item.title || 'Foto do estabelecimento'}
                  className="w-full h-full object-cover"
                />

                {item.isPrimary && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded-md flex items-center gap-1 shadow-md">
                    <Star size={11} fill="currentColor" />
                    Principal
                  </span>
                )}

                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {!item.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(item.id)}
                      className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                      title="Definir como foto principal"
                      aria-label="Definir como foto principal"
                    >
                      <Star size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                    title="Remover foto"
                    aria-label="Remover foto"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-2.5">
                <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                <select
                  value={item.category}
                  onChange={(e) =>
                    handleChangeCategory(item.id, e.target.value as MediaItem['category'])
                  }
                  className="mt-1 w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500"
                  aria-label="Categoria da foto"
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
