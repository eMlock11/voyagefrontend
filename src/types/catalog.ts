/**
 * Tipagens do Catálogo Dinâmico e Modular do Voyage
 */

// --- 1. RESTAURANTE / CARDÁPIO DIGITAL ---
export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  categoryId: string;
  photoUrl?: string;
  ingredients?: string[];
  isAvailable: boolean;
  addons?: MenuItemAddon[];
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface DiningOptions {
  aLaCarte: boolean;
  buffet: boolean;
  buffetKg: boolean;
  selfService: boolean;
  pratoFeito: boolean;
  delivery: boolean;
  takeout: boolean;
  dineIn: boolean;
}

export interface RestaurantCatalog {
  categories: MenuCategory[];
  items: MenuItem[];
  commonAddons: MenuItemAddon[];
  diningOptions: DiningOptions;
}

// --- 2. PIZZARIA ---
export interface PizzaSize {
  id: string;
  name: string;
  slices: number;
  basePrice: number;
  maxFlavors: number;
}

export interface PizzaCrust {
  id: string;
  name: string;
  additionalPrice: number;
}

export interface PizzaFlavor {
  id: string;
  name: string;
  description: string;
  category: 'tradicional' | 'especial' | 'premium' | 'doce';
  ingredients: string[];
  photoUrl?: string;
  isAvailable: boolean;
}

export interface PizzaCatalog {
  sizes: PizzaSize[];
  crusts: PizzaCrust[];
  flavors: PizzaFlavor[];
  commonAddons: MenuItemAddon[];
}

// --- 3. SUPERMERCADO & MERCEARIA ---
export type ProductUnit = 'un' | 'kg' | 'g' | 'l' | 'ml' | 'pacote' | 'bandeja';

export interface SupermarketProduct {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  unit: ProductUnit;
  price: number;
  promoPrice?: number;
  photoUrl?: string;
  isAvailable: boolean;
}

export interface WeeklyOffer {
  id: string;
  productId?: string;
  productName: string;
  regularPrice: number;
  promoPrice: number;
  discountPct: number;
  startDate: string;
  endDate: string;
  customerLimit?: number;
  photoUrl?: string;
}

export interface DigitalFlyer {
  id: string;
  title: string;
  imageUrl?: string;
  pdfUrl?: string;
  validFrom: string;
  validTo: string;
}

export interface SupermarketCatalog {
  products: SupermarketProduct[];
  offers: WeeklyOffer[];
  flyers: DigitalFlyer[];
  categories: string[];
}

// --- UNIFICAÇÃO DO CATÁLOGO MODULAR ---
export type CatalogVertical = 'restaurante' | 'pizzaria' | 'mercado' | 'geral';

export interface MerchantCatalogData {
  vertical: CatalogVertical;
  restaurant?: RestaurantCatalog;
  pizza?: PizzaCatalog;
  supermarket?: SupermarketCatalog;
}
