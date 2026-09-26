import React from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  UtensilsCrossed,
  Tag,
  CheckCircle2
} from 'lucide-react';
import type { PaymentMethodsConfig } from '../../types/merchant';

interface PaymentMethodsEditorProps {
  payments: PaymentMethodsConfig;
  onChange: (updatedPayments: PaymentMethodsConfig) => void;
}

const AVAILABLE_BRANDS = [
  'Visa',
  'Mastercard',
  'Elo',
  'Hipercard',
  'American Express',
  'Diners Club',
  'Alelo',
  'Sodexo / Pluxee',
  'Ticket',
  'VR Benefícios'
];

export const PaymentMethodsEditor: React.FC<PaymentMethodsEditorProps> = ({
  payments,
  onChange
}) => {
  const handleToggleMethod = (method: keyof Omit<PaymentMethodsConfig, 'cardBrands'>) => {
    onChange({
      ...payments,
      [method]: !payments[method]
    });
  };

  const handleToggleBrand = (brand: string) => {
    const exists = payments.cardBrands.includes(brand);
    const updated = exists
      ? payments.cardBrands.filter((b) => b !== brand)
      : [...payments.cardBrands, brand];

    onChange({
      ...payments,
      cardBrands: updated
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Modalidades de Pagamento */}
      <div>
        <h3 className="text-sm font-bold text-white mb-1">Meios de Pagamento Aceitos</h3>
        <p className="text-xs text-slate-400 mb-4">
          Marque as formas de pagamento que o seu estabelecimento aceita presencialmente ou no delivery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { key: 'acceptsCash', label: 'Dinheiro Físico', icon: Banknote, color: 'text-emerald-400' },
            { key: 'acceptsPix', label: 'Pix Instantâneo (QR / Chave)', icon: QrCode, color: 'text-teal-400' },
            { key: 'acceptsDebitCard', label: 'Cartão de Débito', icon: CreditCard, color: 'text-sky-400' },
            { key: 'acceptsCreditCard', label: 'Cartão de Crédito', icon: CreditCard, color: 'text-indigo-400' },
            { key: 'acceptsMealVoucher', label: 'Vale Refeição (VR / Ticket)', icon: UtensilsCrossed, color: 'text-amber-400' },
            { key: 'acceptsFoodVoucher', label: 'Vale Alimentação (VA)', icon: Tag, color: 'text-rose-400' }
          ].map((item) => {
            const isChecked = payments[item.key as keyof Omit<PaymentMethodsConfig, 'cardBrands'>];
            const IconComp = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleMethod(item.key as keyof Omit<PaymentMethodsConfig, 'cardBrands'>)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isChecked
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-lg ${isChecked ? 'bg-indigo-600/30' : 'bg-slate-800'}`}>
                  <IconComp size={18} className={isChecked ? item.color : 'text-slate-500'} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[11px] text-slate-400">
                    {isChecked ? 'Aceito' : 'Não aceito'}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  isChecked ? 'bg-indigo-600 border-indigo-500' : 'border-white/20'
                }`}>
                  {isChecked && <CheckCircle2 size={14} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Bandeiras e Vouchers Suportados */}
      <div className="bg-slate-900/70 p-5 rounded-xl border border-white/10">
        <h3 className="text-sm font-bold text-white mb-1">Bandeiras e Vales Suportados</h3>
        <p className="text-xs text-slate-400 mb-4">
          Selecione as operadoras de cartão ou vales aceitos pela sua máquina de cartão.
        </p>

        <div className="flex flex-wrap gap-2.5">
          {AVAILABLE_BRANDS.map((brand) => {
            const isSelected = payments.cardBrands.includes(brand);

            return (
              <button
                key={brand}
                type="button"
                onClick={() => handleToggleBrand(brand)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
