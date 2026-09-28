import { companyService } from './companyService.js';
import type {
  MerchantData,
  WeeklyBusinessHours,
  DayOfWeek,
  EstablishmentProfile,
  SpecialDateSchedule,
  MerchantCatalogData,
  CatalogVertical,
  CompanyApiRecord,
  BusinessStatusResult,
  SaveMerchantResult,
  PaymentMethodsConfig,
  EstablishmentAmenities
} from '../types/merchant';

const PREVIOUS_DAY_MAP: Record<DayOfWeek, DayOfWeek> = {
  domingo: 'sabado',
  segunda: 'domingo',
  terca: 'segunda',
  quarta: 'terca',
  quinta: 'quarta',
  sexta: 'quinta',
  sabado: 'sexta'
};

const NEXT_DAY_MAP: Record<DayOfWeek, DayOfWeek> = {
  domingo: 'segunda',
  segunda: 'terca',
  terca: 'quarta',
  quarta: 'quinta',
  quinta: 'sexta',
  sexta: 'sabado',
  sabado: 'domingo'
};

/**
 * Retorna a chave de armazenamento isolada por usuário e empresa
 */
export function getMerchantDraftStorageKey(
  companyId: string | number,
  userId?: string | number
): string {
  const safeUser = userId ? String(userId) : 'anon';
  const safeCompany = companyId ? String(companyId) : 'none';
  return `voyage_merchant_draft_${safeUser}_${safeCompany}`;
}

/**
 * Adaptador explícito e tipado entre a Company (API Voyage) e o EstablishmentProfile
 * Preserva os valores reais cadastrados e não inventa dados comerciais.
 */
export function adaptCompanyToProfile(company?: CompanyApiRecord | null): EstablishmentProfile {
  const name =
    company?.nomeFantasia ||
    company?.name ||
    company?.razaoSocial ||
    '';

  const primaryCategory =
    company?.categoria ||
    company?.category ||
    'Geral';

  const street = company?.places || '';
  const phone = company?.telefone || company?.phone || '';
  const description = company?.sobre || company?.about || '';

  return {
    name,
    description,
    primaryCategory,
    subcategories: [],
    address: {
      street,
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contact: {
      phone,
      whatsapp: phone,
      instagram: '',
      website: ''
    },
    amenities: {
      hasDelivery: false,
      hasTakeout: false,
      hasOnSiteDining: false,
      hasParking: false,
      hasWifi: false,
      hasAccessibility: false,
      isPetFriendly: false
    },
    logoUrl: '',
    coverUrl: ''
  };
}

/**
 * Retorna uma estrutura limpa e sem turnos (estado "não informado")
 */
export function getInitialEmptyHours(): WeeklyBusinessHours {
  return {
    segunda: { isOpen: false, shifts: [] },
    terca: { isOpen: false, shifts: [] },
    quarta: { isOpen: false, shifts: [] },
    quinta: { isOpen: false, shifts: [] },
    sexta: { isOpen: false, shifts: [] },
    sabado: { isOpen: false, shifts: [] },
    domingo: { isOpen: false, shifts: [] }
  };
}

export function getInitialEmptyPayments(): PaymentMethodsConfig {
  return {
    acceptsCash: false,
    acceptsPix: false,
    acceptsDebitCard: false,
    acceptsCreditCard: false,
    acceptsMealVoucher: false,
    acceptsFoodVoucher: false,
    cardBrands: []
  };
}

export function getInitialEmptyAmenities(): EstablishmentAmenities {
  return {
    hasDelivery: false,
    hasTakeout: false,
    hasOnSiteDining: false,
    hasParking: false,
    hasWifi: false,
    hasAccessibility: false,
    isPetFriendly: false
  };
}

/**
 * Centraliza o mapeamento entre a categoria da empresa e a vertical de catálogo.
 * Retorna 'geral' quando a categoria ainda não possui um módulo especializado.
 */
export function resolveCategoryVertical(category: string = ''): CatalogVertical {
  const cat = (category || '').toLowerCase().trim();

  if (cat.includes('pizza')) {
    return 'pizzaria';
  }

  if (
    cat.includes('mercado') ||
    cat.includes('supermercado') ||
    cat.includes('mercearia') ||
    cat.includes('varejo')
  ) {
    return 'mercado';
  }

  if (
    cat.includes('restaurante') ||
    cat.includes('lanchonete') ||
    cat.includes('churrascaria') ||
    cat.includes('bar') ||
    cat.includes('hamburguer') ||
    cat.includes('lanche') ||
    cat.includes('cafe') ||
    cat.includes('café') ||
    cat.includes('padaria')
  ) {
    return 'restaurante';
  }

  return 'geral';
}

/**
 * Cria a estrutura inicial de catálogo totalmente limpa (sem produtos sintéticos)
 */
export function createEmptyCatalogData(category: string = ''): MerchantCatalogData {
  const vertical = resolveCategoryVertical(category);

  if (vertical === 'pizzaria') {
    return {
      vertical: 'pizzaria',
      pizza: {
        sizes: [],
        crusts: [],
        flavors: [],
        commonAddons: []
      }
    };
  }

  if (vertical === 'mercado') {
    return {
      vertical: 'mercado',
      supermarket: {
        categories: [],
        products: [],
        offers: [],
        flyers: []
      }
    };
  }

  if (vertical === 'restaurante') {
    return {
      vertical: 'restaurante',
      restaurant: {
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
      }
    };
  }

  return {
    vertical: 'geral'
  };
}

/**
 * Dados de catálogo de demonstração explícita (somente para testes/demonstração)
 */
export function getDemoCatalogData(category: string = ''): MerchantCatalogData {
  const vertical = resolveCategoryVertical(category);

  if (vertical === 'pizzaria') {
    return {
      vertical: 'pizzaria',
      pizza: {
        sizes: [
          { id: 'demo-sz-1', name: 'Média (6 fatias)', slices: 6, basePrice: 42.0, maxFlavors: 2 },
          { id: 'demo-sz-2', name: 'Grande (8 fatias)', slices: 8, basePrice: 58.0, maxFlavors: 3 }
        ],
        crusts: [
          { id: 'demo-cr-1', name: 'Tradicional sem recheio', additionalPrice: 0 },
          { id: 'demo-cr-2', name: 'Catupiry Original', additionalPrice: 9.0 }
        ],
        flavors: [
          {
            id: 'demo-fl-1',
            name: 'Calabresa Artesanal',
            description: 'Molho de tomate caseiro, calabresa defumada, cebola e azeitonas.',
            category: 'tradicional',
            ingredients: ['Molho de tomate', 'Calabresa', 'Cebola', 'Azeitona'],
            isAvailable: true
          },
          {
            id: 'demo-fl-2',
            name: 'Mussarela Especial',
            description: 'Camada generosa de mussarela premium derretida com orégano fresco.',
            category: 'tradicional',
            ingredients: ['Mussarela', 'Orégano', 'Azeitona preta'],
            isAvailable: true
          }
        ],
        commonAddons: [
          { id: 'demo-add-1', name: 'Bacon extra', price: 5.0, isAvailable: true }
        ]
      }
    };
  }

  if (vertical === 'mercado') {
    return {
      vertical: 'mercado',
      supermarket: {
        categories: ['Mercearia', 'Bebidas', 'Hortifrúti'],
        products: [
          {
            id: 'demo-pr-1',
            name: 'Arroz Branco 5kg',
            brand: 'Marca Exemplo',
            category: 'Mercearia',
            unit: 'pacote',
            price: 28.9,
            promoPrice: 24.9,
            isAvailable: true
          }
        ],
        offers: [
          {
            id: 'demo-off-1',
            productName: 'Arroz Branco 5kg',
            regularPrice: 28.9,
            promoPrice: 24.9,
            discountPct: 14,
            startDate: '2026-09-01',
            endDate: '2026-10-31',
            customerLimit: 3
          }
        ],
        flyers: []
      }
    };
  }

  return {
    vertical: 'restaurante',
    restaurant: {
      categories: [
        { id: 'demo-cat-1', name: 'Pratos Principais', order: 1 },
        { id: 'demo-cat-2', name: 'Bebidas', order: 2 }
      ],
      items: [
        {
          id: 'demo-it-1',
          name: 'Prato Executivo do Dia',
          description: 'Acompanha arroz, feijão, proteína grelhada e salada fresca.',
          price: 29.9,
          categoryId: 'demo-cat-1',
          isAvailable: true
        }
      ],
      commonAddons: [],
      diningOptions: {
        aLaCarte: true,
        buffet: false,
        buffetKg: false,
        selfService: false,
        pratoFeito: true,
        delivery: false,
        takeout: true,
        dineIn: true
      }
    }
  };
}

/**
 * Cria a estrutura inicial neutra para novos cadastros (sem suposições ou dados fictícios)
 */
export function createEmptyMerchantData(
  companyId: string | number,
  userId?: string | number,
  initialProfile?: Partial<EstablishmentProfile>,
  timeZone: string = 'America/Sao_Paulo'
): MerchantData {
  const profile: EstablishmentProfile = {
    name: initialProfile?.name || '',
    description: initialProfile?.description || '',
    primaryCategory: initialProfile?.primaryCategory || 'Geral',
    subcategories: initialProfile?.subcategories || [],
    address: {
      street: initialProfile?.address?.street || '',
      number: initialProfile?.address?.number || '',
      complement: initialProfile?.address?.complement || '',
      neighborhood: initialProfile?.address?.neighborhood || '',
      city: initialProfile?.address?.city || '',
      state: initialProfile?.address?.state || '',
      zipCode: initialProfile?.address?.zipCode || '',
      latitude: initialProfile?.address?.latitude,
      longitude: initialProfile?.address?.longitude
    },
    contact: {
      phone: initialProfile?.contact?.phone || '',
      whatsapp: initialProfile?.contact?.whatsapp || '',
      instagram: initialProfile?.contact?.instagram || '',
      website: initialProfile?.contact?.website || ''
    },
    amenities: initialProfile?.amenities || getInitialEmptyAmenities(),
    logoUrl: initialProfile?.logoUrl || '',
    coverUrl: initialProfile?.coverUrl || ''
  };

  return {
    companyId,
    userId,
    timeZone,
    profile,
    hours: getInitialEmptyHours(),
    specialHours: [],
    payments: getInitialEmptyPayments(),
    media: [],
    catalog: createEmptyCatalogData(profile.primaryCategory),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Extrai partes da data em um fuso horário específico de forma testável e imutável
 */
export function getDateTimePartsInTimeZone(
  date: Date,
  timeZone: string = 'America/Sao_Paulo'
): {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: DayOfWeek;
  dateStrDDMM: string;
  dateStrYYYYMMDD: string;
  totalMinutes: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    weekday: 'short'
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);

  const weekdayShort = (partMap.weekday || '').toLowerCase();
  let dayOfWeek: DayOfWeek = 'domingo';
  if (weekdayShort.startsWith('mon')) dayOfWeek = 'segunda';
  else if (weekdayShort.startsWith('tue')) dayOfWeek = 'terca';
  else if (weekdayShort.startsWith('wed')) dayOfWeek = 'quarta';
  else if (weekdayShort.startsWith('thu')) dayOfWeek = 'quinta';
  else if (weekdayShort.startsWith('fri')) dayOfWeek = 'sexta';
  else if (weekdayShort.startsWith('sat')) dayOfWeek = 'sabado';
  else if (weekdayShort.startsWith('sun')) dayOfWeek = 'domingo';

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStrDDMM = `${pad(day)}/${pad(month)}`;
  const dateStrYYYYMMDD = `${year}-${pad(month)}-${pad(day)}`;
  const totalMinutes = hour * 60 + minute;

  return {
    year,
    month,
    day,
    hour,
    minute,
    dayOfWeek,
    dateStrDDMM,
    dateStrYYYYMMDD,
    totalMinutes
  };
}

/**
 * Validação de horários e turnos
 */
export function parseTimeStringToMinutes(timeStr: string): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export const merchantService = {
  /**
   * Recupera os dados do comerciante isolados por usuário e empresa.
   * Não inventa dados fictícios para novas empresas.
   */
  getMerchantData(
    companyId: string | number,
    userId?: string | number,
    fallbackCompany?: CompanyApiRecord | null
  ): MerchantData {
    if (!companyId || companyId === 'company-default') {
      const initialProfile = adaptCompanyToProfile(fallbackCompany);
      return createEmptyMerchantData(companyId || '', userId, initialProfile);
    }

    const storageKey = getMerchantDraftStorageKey(companyId, userId);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && String(parsed.companyId) === String(companyId)) {
          // Se tiver perfil, assegura consistência dos campos
          return {
            ...parsed,
            companyId,
            userId: userId || parsed.userId,
            profile: {
              ...adaptCompanyToProfile(fallbackCompany),
              ...(parsed.profile || {})
            }
          };
        }
      }
    } catch {
      // Ignora falha de leitura
    }

    // Inicializa estrutura limpa
    const initialProfile = adaptCompanyToProfile(fallbackCompany);
    const initial = createEmptyMerchantData(companyId, userId, initialProfile);

    try {
      localStorage.setItem(storageKey, JSON.stringify(initial));
    } catch {
      // ignore
    }

    return initial;
  },

  /**
   * Salva os dados estendidos localmente e sincroniza campos canônicos na API Voyage.
   * - Propaga falhas da API sem falso sucesso.
   * - Confirma gravação remota somente após resposta positiva.
   * - Preserva dados do formulário caso o salvamento falhe.
   * - Identifica explicitamente o que foi salvo no servidor vs rascunho local.
   */
  async saveMerchantData(data: MerchantData): Promise<SaveMerchantResult> {
    if (!data.companyId || data.companyId === 'company-default') {
      const err = new Error(
        'Identificador de empresa inválido. Cadastre ou selecione uma empresa válida antes de salvar.'
      );
      (err as any).isValidationError = true;
      throw err;
    }

    const numericCompanyId = Number(data.companyId);
    if (isNaN(numericCompanyId) || numericCompanyId <= 0) {
      const err = new Error('ID de empresa inválido para sincronização no servidor.');
      (err as any).isValidationError = true;
      throw err;
    }

    // Prepara payload estritamente aceito pela API Voyage (name, category, places)
    const placesCombined = [
      data.profile.address.street,
      data.profile.address.number,
      data.profile.address.neighborhood,
      data.profile.address.city
    ]
      .filter(Boolean)
      .join(', ') || data.profile.address.street || 'Endereço Comercial';

    const remotePayload = {
      name: data.profile.name,
      category: data.profile.primaryCategory,
      places: placesCombined
    };

    // 1. Sincroniza PRIMEIRO com a API Voyage. Se falhar, lança exceção para a interface
    await companyService.updateCompany(numericCompanyId, remotePayload);

    // 2. Se a chamada remota foi bem-sucedida, atualiza timestamp e persiste o rascunho completo localmente
    const updated: MerchantData = {
      ...data,
      companyId: numericCompanyId,
      updatedAt: new Date().toISOString()
    };

    const storageKey = getMerchantDraftStorageKey(numericCompanyId, data.userId);
    let localSaved = false;

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      localSaved = true;
    } catch (storageErr: any) {
      console.error('Falha ao persistir rascunho no localStorage:', storageErr);
      const quotaErr = new Error(
        'Dados sincronizados na API com sucesso, mas o armazenamento local do navegador atingiu a cota máxima. Libere espaço ou remova fotos pesadas.'
      );
      (quotaErr as any).isStorageQuotaError = true;
      (quotaErr as any).partialSuccess = true;
      throw quotaErr;
    }

    return {
      data: updated,
      remoteSaved: true,
      localSaved,
      remoteFields: ['name', 'category', 'places'],
      localOnlyFields: [
        'hours',
        'specialHours',
        'payments',
        'media',
        'catalog',
        'amenities',
        'contact',
        'description'
      ],
      syncedFields: ['name', 'category', 'places'],
      localDraftFields: [
        'hours',
        'specialHours',
        'payments',
        'media',
        'catalog',
        'amenities',
        'contact',
        'description'
      ],
      message:
        'Dados cadastrais sincronizados no servidor Voyage. Horários, catálogo e preferências foram salvos como rascunho local neste navegador.'
    };
  },

  /**
   * Limpa o rascunho local de uma empresa
   */
  clearMerchantDraft(companyId: string | number, userId?: string | number): void {
    if (!companyId) return;
    const storageKey = getMerchantDraftStorageKey(companyId, userId);
    localStorage.removeItem(storageKey);
  },

  /**
   * Avalia em tempo real se o estabelecimento está aberto ou fechado agora.
   * Função pura e testável com data/hora e fuso horário fornecidos.
   * - Trata fuso horário explícito.
   * - Trata horários especiais por data prioritariamente.
   * - Trata turnos noturnos que atravessam a meia-noite (inclusive considerando o turno da noite anterior).
   * - Considera o instante de fechamento como fechado (< close).
   * - Diferencia "horário não informado" de "fechado".
   */
  isEstablishmentOpen(
    hours: WeeklyBusinessHours,
    specialHours: SpecialDateSchedule[] = [],
    referenceDateOrTz: Date | string = new Date(),
    explicitTimeZone?: string
  ): BusinessStatusResult {
    let referenceDate: Date;
    let timeZone: string;

    if (typeof referenceDateOrTz === 'string') {
      referenceDate = new Date();
      timeZone = referenceDateOrTz || 'America/Sao_Paulo';
    } else {
      referenceDate = referenceDateOrTz || new Date();
      timeZone = explicitTimeZone || 'America/Sao_Paulo';
    }

    // 1. Verifica se os horários foram informados
    const allDays = Object.values(hours || {});
    const hasAnySchedule = allDays.some((d) => d.isOpen && d.shifts && d.shifts.length > 0);
    const hasSpecialHours = (specialHours || []).length > 0;

    if (!hasAnySchedule && !hasSpecialHours) {
      return {
        isOpen: false,
        statusText: 'Horário não informado',
        isNotReported: true,
        isUnspecified: true
      };
    }

    // 2. Extrai componentes da data no fuso fornecido
    const nowParts = getDateTimePartsInTimeZone(referenceDate, timeZone);
    const { dayOfWeek, dateStrDDMM, dateStrYYYYMMDD, totalMinutes } = nowParts;

    // 3. Verifica se hoje possui Horário Especial por Data (tem precedência absoluta sobre o dia da semana)
    const specialSchedule = (specialHours || []).find(
      (sp) => sp.date === dateStrDDMM || sp.date === dateStrYYYYMMDD
    );

    if (specialSchedule) {
      if (!specialSchedule.isOpen || !specialSchedule.shifts || specialSchedule.shifts.length === 0) {
        return {
          isOpen: false,
          statusText: `Fechado hoje (${specialSchedule.description})`
        };
      }

      // Avalia os turnos do horário especial
      for (const shift of specialSchedule.shifts) {
        const start = parseTimeStringToMinutes(shift.open);
        const end = parseTimeStringToMinutes(shift.close);
        if (start === null || end === null) continue;

        if (start < end) {
          // Turno regular
          if (totalMinutes >= start && totalMinutes < end) {
            return {
              isOpen: true,
              statusText: `Aberto agora (fecha às ${shift.close})`,
              currentShift: shift
            };
          }
        } else if (start > end) {
          // Turno que vira a meia-noite (ex: 18:00 às 02:00)
          if (totalMinutes >= start || totalMinutes < end) {
            return {
              isOpen: true,
              statusText: `Aberto agora (fecha às ${shift.close})`,
              currentShift: shift
            };
          }
        }
      }

      // Se fora dos turnos especiais
      const nextShift = specialSchedule.shifts.find((s) => {
        const start = parseTimeStringToMinutes(s.open);
        return start !== null && start > totalMinutes;
      });

      if (nextShift) {
        return {
          isOpen: false,
          statusText: `Fechado no momento (abre hoje às ${nextShift.open})`,
          nextShiftText: `Abre às ${nextShift.open}`
        };
      }

      return {
        isOpen: false,
        statusText: `Fechado hoje (${specialSchedule.description})`
      };
    }

    // 4. Verifica se o estabelecimento ainda está aberto por conta de um TURNO NOTURNO DA NOITE ANTERIOR
    const previousDay = PREVIOUS_DAY_MAP[dayOfWeek];
    const prevSchedule = hours[previousDay];

    if (prevSchedule && prevSchedule.isOpen && prevSchedule.shifts) {
      for (const shift of prevSchedule.shifts) {
        const start = parseTimeStringToMinutes(shift.open);
        const end = parseTimeStringToMinutes(shift.close);

        if (start !== null && end !== null && start > end) {
          // Este turno da noite anterior virou a meia-noite e fecha hoje de madrugada às 'end'
          if (totalMinutes < end) {
            return {
              isOpen: true,
              statusText: `Aberto agora (fecha às ${shift.close})`,
              currentShift: shift
            };
          }
        }
      }
    }

    // 5. Avalia os turnos da programação do DIA ATUAL
    const todaySchedule = hours[dayOfWeek];

    if (!todaySchedule || !todaySchedule.isOpen || !todaySchedule.shifts || todaySchedule.shifts.length === 0) {
      // Procura a próxima abertura nos próximos dias
      let cursor = NEXT_DAY_MAP[dayOfWeek];
      let daysAhead = 1;
      let nextOpeningText: string | undefined;

      while (daysAhead <= 7) {
        const futureSchedule = hours[cursor];
        if (futureSchedule && futureSchedule.isOpen && futureSchedule.shifts.length > 0) {
          const sorted = [...futureSchedule.shifts].sort((a, b) => {
            return (parseTimeStringToMinutes(a.open) || 0) - (parseTimeStringToMinutes(b.open) || 0);
          });
          const dayLabel = cursor === NEXT_DAY_MAP[dayOfWeek] ? 'amanhã' : cursor;
          nextOpeningText = `Abre ${dayLabel} às ${sorted[0].open}`;
          break;
        }
        cursor = NEXT_DAY_MAP[cursor];
        daysAhead++;
      }

      return {
        isOpen: false,
        statusText: 'Fechado hoje',
        nextShiftText: nextOpeningText
      };
    }

    // Ordena os turnos por horário de início
    const sortedShifts = [...todaySchedule.shifts].sort((a, b) => {
      const startA = parseTimeStringToMinutes(a.open) || 0;
      const startB = parseTimeStringToMinutes(b.open) || 0;
      return startA - startB;
    });

    for (const shift of sortedShifts) {
      const start = parseTimeStringToMinutes(shift.open);
      const end = parseTimeStringToMinutes(shift.close);
      if (start === null || end === null) continue;

      if (start < end) {
        // Turno padrão diurno
        if (totalMinutes >= start && totalMinutes < end) {
          return {
            isOpen: true,
            statusText: `Aberto agora (fecha às ${shift.close})`,
            currentShift: shift
          };
        }
      } else if (start > end) {
        // Turno noturno que cruza a meia-noite (ex: 18:00 às 02:00)
        // No dia de início, está aberto a partir de start até as 23:59
        if (totalMinutes >= start) {
          return {
            isOpen: true,
            statusText: `Aberto agora (fecha amanhã às ${shift.close})`,
            currentShift: shift
          };
        }
      }
    }

    // Se estiver no mesmo dia antes ou entre turnos
    const upcomingToday = sortedShifts.find((s) => {
      const start = parseTimeStringToMinutes(s.open);
      return start !== null && start > totalMinutes;
    });

    if (upcomingToday) {
      return {
        isOpen: false,
        statusText: `Fechado no momento (abre hoje às ${upcomingToday.open})`,
        nextShiftText: `Abre às ${upcomingToday.open}`
      };
    }

    // Se já passaram todos os turnos de hoje, busca a próxima abertura
    let cursor = NEXT_DAY_MAP[dayOfWeek];
    let daysAhead = 1;
    let nextOpeningText = 'Fechado no momento';

    while (daysAhead <= 7) {
      const futureSchedule = hours[cursor];
      if (futureSchedule && futureSchedule.isOpen && futureSchedule.shifts.length > 0) {
        const sorted = [...futureSchedule.shifts].sort((a, b) => {
          return (parseTimeStringToMinutes(a.open) || 0) - (parseTimeStringToMinutes(b.open) || 0);
        });
        const dayLabel = daysAhead === 1 ? 'amanhã' : cursor;
        nextOpeningText = `Abre ${dayLabel} às ${sorted[0].open}`;
        break;
      }
      cursor = NEXT_DAY_MAP[cursor];
      daysAhead++;
    }

    return {
      isOpen: false,
      statusText: `Fechado no momento (${nextOpeningText})`,
      nextShiftText: nextOpeningText
    };
  }
};
