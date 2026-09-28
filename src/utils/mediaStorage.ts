/**
 * Utilitário centralizado de validação e persistência local de fotos e mídia
 * Utiliza IndexedDB para evitar estourar o limite de 5MB do localStorage com Base64.
 */

export const MEDIA_LIMITS = {
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2MB por foto
  MAX_FILE_SIZE_MB: 2,
  MAX_TOTAL_ITEMS: 15,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
};

export interface FileValidationResult {
  validFiles: File[];
  rejectedFiles: { name: string; reason: string }[];
}

/**
 * Valida arquivos de imagem por tamanho, tipo MIME e quantidade limite
 */
export function validateMediaFiles(
  files: FileList | File[],
  currentTotal: number
): FileValidationResult {
  const fileArray = Array.from(files);
  const validFiles: File[] = [];
  const rejectedFiles: { name: string; reason: string }[] = [];

  let availableSlots = Math.max(0, MEDIA_LIMITS.MAX_TOTAL_ITEMS - currentTotal);

  for (const file of fileArray) {
    if (availableSlots <= 0) {
      rejectedFiles.push({
        name: file.name,
        reason: `Limite máximo de ${MEDIA_LIMITS.MAX_TOTAL_ITEMS} fotos atingido.`
      });
      continue;
    }

    // 1. Tipo MIME
    if (!MEDIA_LIMITS.ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      rejectedFiles.push({
        name: file.name,
        reason: 'Formato não suportado. Utilize imagens JPG, PNG ou WebP.'
      });
      continue;
    }

    // 2. Tamanho
    if (file.size > MEDIA_LIMITS.MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      rejectedFiles.push({
        name: file.name,
        reason: `Arquivo tem ${sizeMB}MB, excedendo o limite de ${MEDIA_LIMITS.MAX_FILE_SIZE_MB}MB.`
      });
      continue;
    }

    validFiles.push(file);
    availableSlots--;
  }

  return { validFiles, rejectedFiles };
}

// Configuração simples de IndexedDB para guardar mídias locais offline
const DB_NAME = 'VoyageMerchantMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado no ambiente'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Salva um blob de imagem no IndexedDB para não inflar o localStorage
 */
export async function saveMediaBlob(id: string, file: File): Promise<string> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = { id, blob: file, name: file.name, type: file.type, updatedAt: Date.now() };
      const req = store.put(record);

      req.onsuccess = () => {
        const objectUrl = URL.createObjectURL(file);
        resolve(objectUrl);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback: se o IndexedDB falhar, cria apenas a URL temporária da sessão
    return URL.createObjectURL(file);
  }
}

/**
 * Remove um blob de imagem do IndexedDB
 */
export async function deleteMediaBlob(id: string): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore
  }
}
