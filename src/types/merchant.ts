/**
 * Tipagens canônicas do Painel do Comerciante / Estabelecimento (Voyage)
 */

export type DayOfWeek =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo';

export interface TimeShift {
  id: string;
  open: string;  // Formato "HH:mm" (ex: "08:00")
  close: string; // Formato "HH:mm" (ex: "18:00")
}

export interface DaySchedule {
  isOpen: boolean;
  shifts: TimeShift[];
}

export type WeeklyBusinessHours = Record<DayOfWeek, DaySchedule>;

export interface SpecialDateSchedule {
  date: string; // "DD/MM" ou "YYYY-MM-DD"
  description: string;
  isOpen: boolean;
  shifts?: TimeShift[];
}

export interface PaymentMethodsConfig {
  acceptsCash: boolean;
  acceptsPix: boolean;
  acceptsDebitCard: boolean;
  acceptsCreditCard: boolean;
  acceptsMealVoucher: boolean; // Vale Refeição
  acceptsFoodVoucher: boolean; // Vale Alimentação
  cardBrands: string[]; // ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'American Express']
}

export interface EstablishmentAmenities {
  hasDelivery: boolean;
  hasTakeout: boolean;
  hasOnSiteDining: boolean;
  hasParking: boolean;
  hasWifi: boolean;
  hasAccessibility: boolean;
  isPetFriendly: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  title?: string;
  category: 'logo' | 'cover' | 'internal' | 'external' | 'products' | 'services';
  isPrimary?: boolean;
}

export interface EstablishmentContact {
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
}

export interface EstablishmentAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface CompanyApiRecord {
  id?: number | string;
  name?: string;
  nomeFantasia?: string;
  razaoSocial?: string;
  category?: string;
  categoria?: string;
  cnpj?: string;
  evaluate?: number;
  places?: string;
  userId?: number | string;
  ownerId?: number | string;
  phone?: string;
  telefone?: string;
  about?: string;
  sobre?: string;
}

export interface BusinessStatusResult {
  isOpen: boolean;
  statusText: string;
  isUnspecified?: boolean;
  isNotReported?: boolean;
  currentShift?: TimeShift;
  nextShiftText?: string;
}

export interface SaveMerchantResult {
  data: MerchantData;
  remoteSaved: boolean;
  localSaved: boolean;
  remoteFields: string[];
  localOnlyFields: string[];
  syncedFields: string[];
  localDraftFields: string[];
  message: string;
}

export interface EstablishmentProfile {
  name: string;
  description: string;
  primaryCategory: string;
  subcategories: string[];
  address: EstablishmentAddress;
  contact: EstablishmentContact;
  amenities: EstablishmentAmenities;
  logoUrl?: string;
  coverUrl?: string;
}

export * from './catalog';
import type { MerchantCatalogData } from './catalog';

export interface MerchantData {
  companyId: string | number;
  userId?: string | number;
  timeZone?: string; // Ex: 'America/Sao_Paulo'
  profile: EstablishmentProfile;
  hours: WeeklyBusinessHours;
  specialHours: SpecialDateSchedule[];
  payments: PaymentMethodsConfig;
  media: MediaItem[];
  catalog?: MerchantCatalogData;
  updatedAt: string;
}
