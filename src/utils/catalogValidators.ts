import { getDateTimePartsInTimeZone } from '../services/merchantService';
import type { WeeklyOffer } from '../types/catalog';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  error?: string;
}

/**
 * Retorna a data atual em formato YYYY-MM-DD no fuso horário do estabelecimento
 */
export function getTodayDateString(
  timeZone: string = 'America/Sao_Paulo',
  referenceDate: Date = new Date()
): string {
  const { dateStrYYYYMMDD } = getDateTimePartsInTimeZone(referenceDate, timeZone);
  return dateStrYYYYMMDD;
}

/**
 * Valida se uma oferta está dentro do período de vigência no fuso horário do estabelecimento
 */
export function isOfferActive(
  offer: WeeklyOffer,
  timeZone: string = 'America/Sao_Paulo',
  referenceDate: Date = new Date()
): boolean {
  if (!offer.startDate || !offer.endDate) return false;
  const today = getTodayDateString(timeZone, referenceDate);
  return today >= offer.startDate && today <= offer.endDate;
}

/**
 * Calcula o percentual de desconto a partir do preço regular e promocional
 */
export function calculateDiscountPct(regularPrice: number, promoPrice: number): number {
  if (
    !isFinite(regularPrice) ||
    !isFinite(promoPrice) ||
    regularPrice <= 0 ||
    promoPrice <= 0 ||
    promoPrice >= regularPrice
  ) {
    return 0;
  }
  return Math.round(((regularPrice - promoPrice) / regularPrice) * 100);
}

/**
 * Valida os campos numéricos de preço
 */
export function validatePrice(value: any): ValidationResult {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) {
    const msg = 'O valor deve ser um número válido.';
    return { valid: false, message: msg, error: msg };
  }
  if (num < 0) {
    const msg = 'O valor não pode ser negativo.';
    return { valid: false, message: msg, error: msg };
  }
  return { valid: true };
}

/**
 * Valida coerência entre preço regular e preço promocional
 */
export function validatePromoPrice(
  regularPrice: number,
  promoPrice?: number
): ValidationResult {
  if (promoPrice === undefined || promoPrice === null || isNaN(promoPrice)) {
    return { valid: true };
  }
  if (promoPrice < 0) {
    const msg = 'O preço promocional não pode ser negativo.';
    return { valid: false, message: msg, error: msg };
  }
  if (regularPrice > 0 && promoPrice >= regularPrice) {
    const msg = 'O preço promocional deve ser menor que o preço regular.';
    return { valid: false, message: msg, error: msg };
  }
  return { valid: true };
}

/**
 * Valida intervalo de datas no padrão YYYY-MM-DD
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): ValidationResult {
  if (!startDate) {
    const msg = 'A data inicial é obrigatória.';
    return { valid: false, message: msg, error: msg };
  }
  if (!endDate) {
    const msg = 'A data final é obrigatória.';
    return { valid: false, message: msg, error: msg };
  }
  if (startDate > endDate) {
    const msg = 'A data de término não pode ser anterior à data de início.';
    return { valid: false, message: msg, error: msg };
  }
  return { valid: true };
}
