import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Globe,
  AtSign,
  Upload,
  CheckCircle,
  Truck,
  ShoppingBag,
  Utensils,
  Car,
  Wifi,
  Accessibility,
  Heart
} from 'lucide-react';
import type { EstablishmentProfile } from '../../types/merchant';

interface BusinessInfoFormProps {
  profile: EstablishmentProfile;
  onChange: (updatedProfile: EstablishmentProfile) => void;
}

export const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({ profile, onChange }) => {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'endereco' | 'contato' | 'comodidades'>('geral');

  const handleFieldChange = (field: keyof EstablishmentProfile, value: any) => {
    onChange({
      ...profile,
      [field]: value
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    onChange({
      ...profile,
      address: {
        ...profile.address,
        [field]: value
      }
    });
  };

  const handleContactChange = (field: string, value: string) => {
    onChange({
      ...profile,
      contact: {
        ...profile.contact,
        [field]: value
      }
    });
  };

  const handleAmenityToggle = (field: keyof typeof profile.amenities) => {
    onChange({
      ...profile,
      amenities: {
        ...profile.amenities,
        [field]: !profile.amenities[field]
      }
    });
  };

  const handleImageUpload = (field: 'logoUrl' | 'coverUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...profile,
          [field]: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subnavegação da Seção */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('geral')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'geral'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Dados Gerais & Imagens
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('endereco')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'endereco'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Localização & Endereço
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('contato')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'contato'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Canais de Atendimento
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('comodidades')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === 'comodidades'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Serviços & Comodidades
        </button>
      </div>

      {/* ABA: DADOS GERAIS */}
      {activeSubTab === 'geral' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Imagens: Logo e Capa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 p-5 rounded-xl border border-white/5">
            {/* Logo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Logotipo do Estabelecimento
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="text-slate-500" size={32} />
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Alterar Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('logoUrl', e)}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Recomendado: 400x400px (PNG ou JPG)</p>
                </div>
              </div>
            </div>

            {/* Capa */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Foto de Capa Principal
              </label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-xl bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                  {profile.coverUrl ? (
                    <img src={profile.coverUrl} alt="Capa" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">Sem Capa</span>
                  )}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Alterar Capa</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('coverUrl', e)}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Recomendado: 1200x500px em alta definição</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Ex: Pará Lanches & Burgers"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoria Principal *
              </label>
              <select
                value={profile.primaryCategory}
                onChange={(e) => handleFieldChange('primaryCategory', e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Alimentação / Gastronomia">Alimentação / Gastronomia</option>
                <option value="Supermercado / Mercearia">Supermercado / Mercearia</option>
                <option value="Barbearia / Beleza">Barbearia / Salão de Beleza</option>
                <option value="Saúde & Academia">Saúde & Academia</option>
                <option value="Hotel & Pousada">Hotel & Hospedagem</option>
                <option value="Oficina & Automotivo">Oficina & Automotivo</option>
                <option value="Pet Shop & Veterinária">Pet Shop & Veterinária</option>
                <option value="Varejo & Vestuário">Varejo & Roupas</option>
                <option value="Outros">Outros Serviços</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descrição do Negócio
            </label>
            <textarea
              rows={4}
              value={profile.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Apresente os diferenciais, especialidades e tradição do seu comércio para os clientes..."
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* ABA: ENDEREÇO */}
      {activeSubTab === 'endereco' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Logradouro / Rua *</label>
              <input
                type="text"
                value={profile.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Ex: Av. Paulista"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número</label>
              <input
                type="text"
                value={profile.address.number}
                onChange={(e) => handleAddressChange('number', e.target.value)}
                placeholder="1000"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bairro</label>
              <input
                type="text"
                value={profile.address.neighborhood}
                onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                placeholder="Bela Vista"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cidade</label>
              <input
                type="text"
                value={profile.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="São Paulo"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CEP</label>
              <input
                type="text"
                value={profile.address.zipCode}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                placeholder="01310-100"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ABA: CONTATO */}
      {activeSubTab === 'contato' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Phone size={14} className="text-emerald-400" />
              <span>WhatsApp Comercial</span>
            </label>
            <input
              type="text"
              value={profile.contact.whatsapp}
              onChange={(e) => handleContactChange('whatsapp', e.target.value)}
              placeholder="(11) 98765-4321"
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Phone size={14} className="text-sky-400" />
              <span>Telefone Fixo / Central</span>
            </label>
            <input
              type="text"
              value={profile.contact.phone}
              onChange={(e) => handleContactChange('phone', e.target.value)}
              placeholder="(11) 3456-7890"
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <AtSign size={14} className="text-pink-400" />
              <span>Instagram (@perfil)</span>
            </label>
            <input
              type="text"
              value={profile.contact.instagram}
              onChange={(e) => handleContactChange('instagram', e.target.value)}
              placeholder="@meucomercio"
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
              <Globe size={14} className="text-indigo-400" />
              <span>Website / Linktree</span>
            </label>
            <input
              type="text"
              value={profile.contact.website}
              onChange={(e) => handleContactChange('website', e.target.value)}
              placeholder="https://www.meucomercio.com.br"
              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* ABA: COMODIDADES */}
      {activeSubTab === 'comodidades' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
          {[
            { key: 'hasDelivery', label: 'Delivery Próprio / App', icon: Truck, color: 'text-amber-400' },
            { key: 'hasTakeout', label: 'Retirada no Local', icon: ShoppingBag, color: 'text-blue-400' },
            { key: 'hasOnSiteDining', label: 'Consumo / Atendimento Presencial', icon: Utensils, color: 'text-emerald-400' },
            { key: 'hasParking', label: 'Estacionamento no Local', icon: Car, color: 'text-indigo-400' },
            { key: 'hasWifi', label: 'Wi-Fi Gratuito para Clientes', icon: Wifi, color: 'text-sky-400' },
            { key: 'hasAccessibility', label: 'Acessibilidade PNE', icon: Accessibility, color: 'text-purple-400' },
            { key: 'isPetFriendly', label: 'Pet Friendly (Aceita Pets)', icon: Heart, color: 'text-rose-400' }
          ].map((item) => {
            const isChecked = profile.amenities[item.key as keyof typeof profile.amenities];
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleAmenityToggle(item.key as keyof typeof profile.amenities)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  isChecked
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className={`p-2 rounded-lg ${isChecked ? 'bg-indigo-600/30' : 'bg-slate-800'}`}>
                  <IconComponent size={18} className={isChecked ? item.color : 'text-slate-500'} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[11px] text-slate-400">
                    {isChecked ? 'Habilitado' : 'Não disponível'}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  isChecked ? 'bg-indigo-600 border-indigo-500' : 'border-white/20'
                }`}>
                  {isChecked && <CheckCircle size={14} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
