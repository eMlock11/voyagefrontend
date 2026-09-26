import { companyService } from './companyService.js';
import type {
  MerchantData,
  WeeklyBusinessHours,
  DayOfWeek,
  EstablishmentProfile,
  TimeShift,
  MerchantCatalogData,
  CatalogVertical
} from '../types/merchant';

const DAYS_MAP: DayOfWeek[] = [
  'domingo',
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado'
];

/**
 * Cria a estrutura inicial de catálogo dinâmico de acordo com a categoria
 */
export function getDefaultCatalogData(category: string = ''): MerchantCatalogData {
  const cat = category.toLowerCase();
  const isPizza = cat.includes('pizza');
  const isSupermarket = cat.includes('mercado') || cat.includes('mercearia') || cat.includes('varejo');
  const isFood = cat.includes('lanche') || cat.includes('restaurante') || cat.includes('aliment') || isPizza;

  const vertical: CatalogVertical = isPizza
    ? 'pizzaria'
    : isSupermarket
    ? 'mercado'
    : isFood
    ? 'restaurante'
    : 'geral';

  return {
    vertical,
    restaurant: {
      categories: [
        { id: 'cat-lanches', name: 'Hambúrgueres Artesanais', order: 1 },
        { id: 'cat-porcoes', name: 'Porções & Entradas', order: 2 },
        { id: 'cat-bebidas', name: 'Bebidas & Sucos', order: 3 },
        { id: 'cat-sobremesas', name: 'Sobremesas', order: 4 }
      ],
      items: [
        {
          id: 'item-1',
          name: 'X-Bacon Voyage Special',
          description: 'Pão brioche, burger 180g artesanal, cheddar derretido, fatias crocantes de bacon e molho especial.',
          price: 34.90,
          promoPrice: 29.90,
          categoryId: 'cat-lanches',
          ingredients: ['Pão brioche', 'Carne 180g', 'Bacon crocante', 'Queijo cheddar', 'Molho da casa'],
          isAvailable: true,
          addons: [
            { id: 'add-1', name: 'Bacon Extra', price: 6.00 },
            { id: 'add-2', name: 'Queijo Cheddar Dobro', price: 5.00 },
            { id: 'add-3', name: 'Ovo Frito na Manteiga', price: 3.50 }
          ]
        },
        {
          id: 'item-2',
          name: 'Batata Rústica com Alecrim',
          description: 'Porção generosa de batatas rústicas com sal temperado, alecrim fresco e maionese verde artesanal.',
          price: 24.50,
          categoryId: 'cat-porcoes',
          ingredients: ['Batatas selecionadas', 'Alecrim', 'Maionese artesanal'],
          isAvailable: true
        },
        {
          id: 'item-3',
          name: 'Suco Natural da Fruta 500ml',
          description: 'Laranja, maracujá ou limão espremido na hora sem conservantes.',
          price: 11.00,
          categoryId: 'cat-bebidas',
          isAvailable: true
        }
      ],
      commonAddons: [
        { id: 'com-1', name: 'Bacon em Tiras', price: 5.00 },
        { id: 'com-2', name: 'Queijo Prato Extra', price: 4.00 },
        { id: 'com-3', name: 'Molho Barbecue Artesanal', price: 3.00 }
      ],
      diningOptions: {
        aLaCarte: true,
        buffet: false,
        buffetKg: false,
        selfService: false,
        pratoFeito: true,
        delivery: true,
        takeout: true,
        dineIn: true
      }
    },
    pizza: {
      sizes: [
        { id: 'pz-broto', name: 'Broto (4 fatias)', slices: 4, basePrice: 32.00, maxFlavors: 1 },
        { id: 'pz-media', name: 'Média (6 fatias)', slices: 6, basePrice: 48.00, maxFlavors: 2 },
        { id: 'pz-grande', name: 'Grande (8 fatias)', slices: 8, basePrice: 62.00, maxFlavors: 2 },
        { id: 'pz-familia', name: 'Família (12 fatias)', slices: 12, basePrice: 78.00, maxFlavors: 3 }
      ],
      crusts: [
        { id: 'cr-sem', name: 'Tradicional sem recheio', additionalPrice: 0 },
        { id: 'cr-catupiry', name: 'Borda Catupiry Original', additionalPrice: 9.00 },
        { id: 'cr-cheddar', name: 'Borda Cheddar Cremoso', additionalPrice: 8.00 },
        { id: 'cr-chocolate', name: 'Borda Chocolate com Morango', additionalPrice: 12.00 }
      ],
      flavors: [
        {
          id: 'fl-calabresa',
          name: 'Calabresa Especial',
          description: 'Molho de tomate artesanal, calabresa fatiada, cebola roxa e orégano.',
          category: 'tradicional',
          ingredients: ['Molho de tomate', 'Calabresa', 'Cebola', 'Azeitonas pretas', 'Orégano'],
          isAvailable: true
        },
        {
          id: 'fl-4queijos',
          name: 'Quatro Queijos Supremo',
          description: 'Mussarela, provolone curado, parmesão ralado e requeijão cremoso.',
          category: 'especial',
          ingredients: ['Mussarela', 'Provolone', 'Parmesão', 'Catupiry'],
          isAvailable: true
        },
        {
          id: 'fl-frango-catupiry',
          name: 'Frango Desfiado com Catupiry',
          description: 'Peito de frango temperado desfiado coberto com generosa camada de catupiry.',
          category: 'tradicional',
          ingredients: ['Frango desfiado', 'Catupiry', 'Molho artesanal', 'Milho verde'],
          isAvailable: true
        }
      ],
      commonAddons: [
        { id: 'pz-add-1', name: 'Queijo Extra', price: 7.00 },
        { id: 'pz-add-2', name: 'Bacon em Cubos', price: 6.00 }
      ]
    },
    supermarket: {
      categories: ['Mercearia', 'Bebidas', 'Açougue', 'Hortifruti', 'Padaria', 'Limpeza', 'Higiene', 'Pet Shop'],
      products: [
        {
          id: 'prod-1',
          name: 'Arroz Branco Tipo 1 5kg',
          brand: 'Camil',
          category: 'Mercearia',
          unit: 'pacote',
          price: 29.90,
          promoPrice: 24.90,
          isAvailable: true
        },
        {
          id: 'prod-2',
          name: 'Feijão Carioca 1kg',
          brand: 'Kicaldo',
          category: 'Mercearia',
          unit: 'pacote',
          price: 8.90,
          isAvailable: true
        },
        {
          id: 'prod-3',
          name: 'Leite Integral UHT 1L',
          brand: 'Piracanjuba',
          category: 'Mercearia',
          unit: 'l',
          price: 4.89,
          isAvailable: true
        }
      ],
      offers: [
        {
          id: 'off-1',
          productName: 'Arroz Branco Camil 5kg',
          regularPrice: 29.90,
          promoPrice: 24.90,
          discountPct: 17,
          startDate: '2026-09-20',
          endDate: '2026-09-30',
          customerLimit: 5
        }
      ],
      flyers: [
        {
          id: 'fly-1',
          title: 'Encarte de Ofertas da Semana',
          validFrom: '2026-09-22',
          validTo: '2026-09-29'
        }
      ]
    }
  };
}

/**
 * Cria uma estrutura padrão completa para novos estabelecimentos
 */
export function getDefaultMerchantData(
  companyId: string | number,
  userId?: string | number,
  initialData?: Partial<EstablishmentProfile>
): MerchantData {
  const defaultHours: WeeklyBusinessHours = {
    segunda: { isOpen: true, shifts: [{ id: 'seg-1', open: '08:00', close: '18:00' }] },
    terca: { isOpen: true, shifts: [{ id: 'ter-1', open: '08:00', close: '18:00' }] },
    quarta: { isOpen: true, shifts: [{ id: 'qua-1', open: '08:00', close: '18:00' }] },
    quinta: { isOpen: true, shifts: [{ id: 'qui-1', open: '08:00', close: '18:00' }] },
    sexta: { isOpen: true, shifts: [{ id: 'sex-1', open: '08:00', close: '19:00' }] },
    sabado: { isOpen: true, shifts: [{ id: 'sab-1', open: '08:00', close: '13:00' }] },
    domingo: { isOpen: false, shifts: [] }
  };

  const primaryCat = initialData?.primaryCategory || 'Alimentação / Gastronomia';

  return {
    companyId,
    userId,
    profile: {
      name: initialData?.name || '',
      description: initialData?.description || 'Estabelecimento verificado na rede Voyage.',
      primaryCategory: primaryCat,
      subcategories: initialData?.subcategories || ['Lanchonete', 'Restaurante'],
      address: {
        street: initialData?.address?.street || '',
        number: initialData?.address?.number || '',
        complement: initialData?.address?.complement || '',
        neighborhood: initialData?.address?.neighborhood || '',
        city: initialData?.address?.city || 'São Paulo',
        state: initialData?.address?.state || 'SP',
        zipCode: initialData?.address?.zipCode || '',
        latitude: initialData?.address?.latitude,
        longitude: initialData?.address?.longitude
      },
      contact: {
        phone: initialData?.contact?.phone || '',
        whatsapp: initialData?.contact?.whatsapp || '',
        instagram: initialData?.contact?.instagram || '',
        website: initialData?.contact?.website || ''
      },
      amenities: {
        hasDelivery: true,
        hasTakeout: true,
        hasOnSiteDining: true,
        hasParking: false,
        hasWifi: true,
        hasAccessibility: true,
        isPetFriendly: false
      },
      logoUrl: initialData?.logoUrl || '',
      coverUrl: initialData?.coverUrl || ''
    },
    hours: defaultHours,
    specialHours: [
      { date: '25/12', description: 'Natal', isOpen: false },
      { date: '01/01', description: 'Ano Novo', isOpen: false }
    ],
    payments: {
      acceptsCash: true,
      acceptsPix: true,
      acceptsDebitCard: true,
      acceptsCreditCard: true,
      acceptsMealVoucher: true,
      acceptsFoodVoucher: false,
      cardBrands: ['Visa', 'Mastercard', 'Elo', 'Hipercard']
    },
    media: [],
    catalog: getDefaultCatalogData(primaryCat),
    updatedAt: new Date().toISOString()
  };
}

export const merchantService = {
  /**
   * Recupera os dados completos do comerciante
   */
  getMerchantData(
    companyId: string | number,
    userId?: string | number,
    fallbackCompany?: any
  ): MerchantData {
    const storageKey = `voyage_merchant_data_${companyId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.companyId === companyId) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }

    // Inicializa com dados da empresa existente caso disponíveis
    const initialProfile: Partial<EstablishmentProfile> = {
      name: fallbackCompany?.name || '',
      primaryCategory: fallbackCompany?.category || 'Lanchonete',
      address: {
        street: fallbackCompany?.places || '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      contact: {
        phone: fallbackCompany?.phone || '',
        whatsapp: fallbackCompany?.phone || '',
        instagram: '',
        website: ''
      }
    };

    const initial = getDefaultMerchantData(companyId, userId, initialProfile);
    try {
      localStorage.setItem(storageKey, JSON.stringify(initial));
    } catch {
      // ignore
    }
    return initial;
  },

  /**
   * Salva os dados estendidos localmente e sincroniza campos canônicos na API
   */
  async saveMerchantData(data: MerchantData): Promise<MerchantData> {
    const updated = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    const storageKey = `voyage_merchant_data_${data.companyId}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Sincroniza campos essenciais com o companyService na API
    try {
      const placesCombined = [
        updated.profile.address.street,
        updated.profile.address.number,
        updated.profile.address.neighborhood,
        updated.profile.address.city
      ]
        .filter(Boolean)
        .join(', ') || updated.profile.address.street || 'Endereço Comercial';

      await companyService.updateCompany(data.companyId, {
        name: updated.profile.name,
        category: updated.profile.primaryCategory,
        places: placesCombined,
        phone: updated.profile.contact.phone
      });
    } catch (apiErr) {
      console.warn('Sincronização com API Voyage (updateCompany):', apiErr);
    }

    return updated;
  },

  /**
   * Avalia em tempo real se o estabelecimento está aberto ou fechado agora
   */
  isEstablishmentOpen(hours: WeeklyBusinessHours): {
    isOpen: boolean;
    statusText: string;
    currentShift?: TimeShift;
    nextShiftText?: string;
  } {
    const now = new Date();
    const dayOfWeek = DAYS_MAP[now.getDay()];
    const todaySchedule = hours[dayOfWeek];

    if (!todaySchedule || !todaySchedule.isOpen || !todaySchedule.shifts.length) {
      return {
        isOpen: false,
        statusText: 'Fechado hoje'
      };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const shift of todaySchedule.shifts) {
      const [openHour, openMin] = shift.open.split(':').map(Number);
      const [closeHour, closeMin] = shift.close.split(':').map(Number);
      const shiftStart = openHour * 60 + openMin;
      const shiftEnd = closeHour * 60 + closeMin;

      if (currentMinutes >= shiftStart && currentMinutes <= shiftEnd) {
        return {
          isOpen: true,
          statusText: `Aberto agora (fecha às ${shift.close})`,
          currentShift: shift
        };
      }
    }

    // Se estiver fora dos turnos
    const upcomingShift = todaySchedule.shifts.find((s) => {
      const [openH, openM] = s.open.split(':').map(Number);
      return openH * 60 + openM > currentMinutes;
    });

    if (upcomingShift) {
      return {
        isOpen: false,
        statusText: `Fechado no momento (abre hoje às ${upcomingShift.open})`,
        nextShiftText: `Abre às ${upcomingShift.open}`
      };
    }

    return {
      isOpen: false,
      statusText: 'Fechado no momento'
    };
  }
};
