import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Check,
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  Clock,
  Copy,
  Plus,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { userService } from '../../services/userService';
import './Payment.css';

// Definição dos 3 Planos Voyage
const PLANS = [
  {
    id: 'basic',
    name: 'Básico',
    badge: 'Gratuito',
    price: 'R$ 0,00',
    period: 'por mês',
    description: 'Ideal para descobrir estabelecimentos locais e explorar rotas no mapa.',
    features: [
      { text: 'Busca completa no catálogo', included: true },
      { text: 'Rotas e navegação no mapa', included: true },
      { text: 'Sem cupons de desconto', included: false },
      { text: 'Exibição de anúncios', included: false },
      { text: 'Personalização do perfil', included: false },
    ],
    buttonText: 'Selecionar Plano Básico',
    pixCodeSuffix: 'basic-0000',
    amount: 0,
  },
  {
    id: 'intermediary',
    name: 'Intermediário',
    badge: 'Mais Popular',
    price: 'R$ 14,90',
    period: 'por mês',
    description: 'Mais economia e comodidade para seus passeios e descobertas do dia a dia.',
    features: [
      { text: 'Busca completa e rotas guiadas', included: true },
      { text: '5 cupons de desconto por mês', included: true },
      { text: 'Navegação sem anúncios', included: true },
      { text: 'Suporte padrão via chat', included: true },
      { text: 'Personalização exclusiva', included: false },
    ],
    buttonText: 'Assinar Intermediário',
    pixCodeSuffix: 'inter-1490',
    amount: 14.9,
  },
  {
    id: 'plus',
    name: 'Voyage+',
    badge: 'VIP Completo',
    price: 'R$ 29,90',
    period: 'por mês',
    description: 'Acesso VIP ilimitado a todas as vantagens e destaques exclusivos da plataforma.',
    features: [
      { text: 'Todos os benefícios do Intermediário', included: true },
      { text: 'Cupons exclusivos ilimitados', included: true },
      { text: '100% livre de qualquer anúncio', included: true },
      { text: 'Tema escuro premium e badges VIP', included: true },
      { text: 'Atendimento e suporte prioritário 24/7', included: true },
    ],
    buttonText: 'Assinar Voyage+ Plus',
    pixCodeSuffix: 'plus-2990',
    amount: 29.9,
  },
];

export default function Payment() {
  const navigate = useNavigate();
  // Estados de navegação do fluxo: 'subscription' | 'methods' | 'cards' | 'card-form' | 'pix'
  const [step, setStep] = useState('subscription');

  const currentUser = userService.getCurrentUser();

  // Plano selecionado ('basic' | 'intermediary' | 'plus')
  const [selectedPlanId, setSelectedPlanId] = useState(() => {
    if (currentUser?.planId) return currentUser.planId;
    if (currentUser?.plan?.toLowerCase().includes('plus') || currentUser?.plan?.toLowerCase().includes('voyage+')) return 'plus';
    if (currentUser?.plan?.toLowerCase().includes('inter')) return 'intermediary';
    return 'plus';
  });

  // Estado da forma de pagamento selecionada: 'credit' | 'debit' | 'pix'
  const [selectedMethod, setSelectedMethod] = useState('credit');

  // Estado do formulário de novo cartão
  const [cardData, setCardData] = useState({
    number: '',
    cvc: '',
    expiry: '',
    name: '',
  });
  const [cardError, setCardError] = useState('');

  // Mock de cartões salvos dinâmico
  const [savedCards, setSavedCards] = useState([
    { id: 'card-1', brand: 'VISA', number: '•••• •••• •••• 4242', expiry: '12/28', type: 'Crédito' },
    { id: 'card-2', brand: 'MASTERCARD', number: '•••• •••• •••• 8891', expiry: '09/27', type: 'Débito' },
  ]);
  const [selectedCardId, setSelectedCardId] = useState('card-1');

  // Timer do PIX (30 minutos = 1800 segundos)
  const [pixTimeLeft, setPixTimeLeft] = useState(1800);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixPaid, setPixPaid] = useState(false);

  // Efeito do Timer do PIX
  useEffect(() => {
    let timer;
    if (step === 'pix' && pixTimeLeft > 0) {
      timer = setInterval(() => {
        setPixTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, pixTimeLeft]);

  // Plano atualmente selecionado
  const currentPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];

  // Função para salvar a assinatura realizada no perfil do usuário
  const applySubscription = (planObj) => {
    userService.updateCurrentUserPlan({
      planId: planObj.id,
      planName: planObj.name,
      planStatus: 'active',
      planPrice: planObj.price,
      planPeriod: planObj.period,
    });
  };


  // Chave PIX Fictícia realista
  const pixKeyCopy = `00020126580014br.gov.bcb.pix0136voyage-pagamentos-${currentPlan.pixCodeSuffix}-20265204000053039865405${currentPlan.amount.toFixed(2)}5802BR5913Voyage Brasil6009Sao Paulo62070503***6304`;

  // Função para formatar o tempo restante do PIX em MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copiar código PIX com feedback
  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKeyCopy);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  // Formatação de Número de Cartão em blocos de 4 dígitos
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: formatted });
    setCardError('');
  };

  // Formatação de Validade MM/AA
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData({ ...cardData, expiry: val });
    setCardError('');
  };

  // Formatação de CVC
  const handleCvcChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData({ ...cardData, cvc: val });
    setCardError('');
  };

  // Detectar bandeira fictícia pelo primeiro dígito
  const getCardBrand = (num) => {
    const raw = num.replace(/\D/g, '');
    if (raw.startsWith('4')) return 'VISA';
    if (raw.startsWith('5')) return 'MASTERCARD';
    if (raw.startsWith('3')) return 'AMEX';
    return 'ELO';
  };

  // Validar e Salvar Novo Cartão
  const handleSaveCard = (e) => {
    e.preventDefault();
    const rawNum = cardData.number.replace(/\s/g, '');

    if (rawNum.length < 16) {
      setCardError('Número do cartão inválido (necessário 16 dígitos).');
      return;
    }
    if (cardData.expiry.length < 5) {
      setCardError('Validade inválida (use o formato MM/AA).');
      return;
    }
    if (cardData.cvc.length < 3) {
      setCardError('Código CVC deve ter ao menos 3 dígitos.');
      return;
    }
    if (!cardData.name.trim()) {
      setCardError('Informe o nome do titular impresso no cartão.');
      return;
    }

    const newCard = {
      id: `card-${Date.now()}`,
      brand: getCardBrand(cardData.number),
      number: `•••• •••• •••• ${rawNum.slice(-4)}`,
      expiry: cardData.expiry,
      type: selectedMethod === 'debit' ? 'Débito' : 'Crédito',
    };

    setSavedCards([...savedCards, newCard]);
    setSelectedCardId(newCard.id);
    setStep('cards');
    setCardData({ number: '', cvc: '', expiry: '', name: '' });
    setCardError('');
  };

  // Ação ao voltar na navegação interna
  const handleBack = () => {
    if (step === 'methods') setStep('subscription');
    else if (step === 'cards') setStep('methods');
    else if (step === 'card-form') setStep('cards');
    else if (step === 'pix') setStep('methods');
    else navigate(-1);
  };

  // Avançar para próximo passo a partir de methods
  const handleContinueMethod = () => {
    if (selectedMethod === 'pix') {
      setPixTimeLeft(1800);
      setPixPaid(false);
      setStep('pix');
    } else {
      setStep('cards');
    }
  };

  return (
    <div id="payment-page">
      <div id="payment-root">
        
        {/* Header da Página de Pagamento */}
        <header className="payment-header">
          <div className="header-top-row">
            <button className="back-btn" onClick={handleBack} title="Voltar" aria-label="Voltar">
              <ArrowLeft size={20} />
            </button>

            <div className="header-logo-container">
              <Compass className="header-brand-icon" size={24} />
              <span className="header-logo-title">Voyage</span>
              <span className="header-logo-tag">Billing</span>
            </div>

            <span className="voyage-demo-badge">Ambiente Demo</span>
          </div>

          <div className="header-title-block">
            <h1 className="page-title">
              {(() => {
                switch (step) {
                  case 'subscription':
                    return 'Planos e Assinaturas';
                  case 'methods':
                    return 'Formas de Pagamento';
                  case 'cards':
                    return 'Cartões Salvos';
                  case 'card-form':
                    return 'Novo Cartão';
                  case 'pix':
                    return 'Pagamento via PIX';
                  default:
                    return 'Assinatura';
                }
              })()}
            </h1>
            <p className="page-subtitle">
              {step === 'subscription' 
                ? 'Escolha a modalidade que melhor se adapta às suas necessidades' 
                : 'Conclua a assinatura com segurança'}
            </p>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="payment-content">

          {/* 1. SELEÇÃO DE 3 PLANOS EM GRID COMPARATIVO DESKTOP */}
          {step === 'subscription' && (
            <div className="subscription-view">
              <div className="plans-selector-grid">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isPopular = plan.id === 'intermediary' || plan.id === 'plus';

                  return (
                    <div
                      key={plan.id}
                      className={`plan-card-item ${isSelected ? 'selected' : ''} ${plan.id}`}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      {plan.id === 'plus' && (
                        <div className="plan-popular-ribbon">
                          <Sparkles size={13} />
                          <span>Recomendado</span>
                        </div>
                      )}

                      <div className="plan-card-header">
                        <div className="plan-title-box">
                          <span className="plan-name">{plan.name}</span>
                          <span className={`plan-badge-tag ${plan.id}`}>{plan.badge}</span>
                        </div>
                        <div className="plan-price-box">
                          <span className="plan-price-val">{plan.price}</span>
                          <span className="plan-period-val">{plan.period}</span>
                        </div>
                      </div>

                      <p className="plan-desc-text">{plan.description}</p>

                      <div className="plan-features-list">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className={`feature-bullet ${feat.included ? 'inc' : 'exc'}`}>
                            {feat.included ? (
                              <Check className="feat-icon check" size={15} />
                            ) : (
                              <X className="feat-icon cross" size={15} />
                            )}
                            <span>{feat.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="plan-card-footer">
                        <button 
                          type="button"
                          className={`btn-choose-plan ${isSelected ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanId(plan.id);
                          }}
                        >
                          {isSelected ? 'Plano Selecionado ✓' : 'Escolher este Plano'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra de Ação Inferior */}
              <div className="subscription-action-bar">
                <div className="selected-summary-pill">
                  <span>Selecionado:</span>
                  <strong>{currentPlan.name} ({currentPlan.price})</strong>
                </div>

                <button
                  className="btn-primary-action"
                  onClick={() => {
                    if (currentPlan.amount === 0) {
                      applySubscription(currentPlan);
                      alert('Plano Básico gratuito ativado com sucesso no seu perfil!');
                    } else {
                      setStep('methods');
                    }
                  }}
                >
                  {currentPlan.amount === 0 ? 'Continuar com Plano Gratuito' : `Assinar Agora • ${currentPlan.price}`}
                </button>
              </div>
            </div>
          )}

          {/* 2. SELEÇÃO DA FORMA DE PAGAMENTO */}
          {step === 'methods' && (
            <div className="checkout-subview">
              <div className="selected-plan-banner">
                <div className="plan-summary-info">
                  <span className="summary-label">Plano Selecionado:</span>
                  <span className="summary-val">{currentPlan.name} ({currentPlan.price})</span>
                </div>
                <button className="btn-change-plan" onClick={() => setStep('subscription')}>Alterar</button>
              </div>

              <div className="payment-options-list">
                <button
                  type="button"
                  className={`payment-option-btn ${selectedMethod === 'credit' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('credit')}
                >
                  <div className="option-icon-box">
                    <CreditCard size={20} />
                  </div>
                  <div className="option-text-info">
                    <span className="option-title">Cartão de Crédito</span>
                    <span className="option-sub">Ativação imediata da assinatura</span>
                  </div>
                  <div className="option-radio-indicator"></div>
                </button>

                <button
                  type="button"
                  className={`payment-option-btn ${selectedMethod === 'debit' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('debit')}
                >
                  <div className="option-icon-box">
                    <CreditCard size={20} />
                  </div>
                  <div className="option-text-info">
                    <span className="option-title">Cartão de Débito</span>
                    <span className="option-sub">Débito em conta à vista</span>
                  </div>
                  <div className="option-radio-indicator"></div>
                </button>

                <button
                  type="button"
                  className={`payment-option-btn ${selectedMethod === 'pix' ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod('pix')}
                >
                  <div className="option-icon-box pix-icon">
                    <QrCode size={20} />
                  </div>
                  <div className="option-text-info">
                    <span className="option-title">PIX Instantâneo</span>
                    <span className="option-sub">QR Code e Chave Copia e Cola</span>
                  </div>
                  <div className="option-radio-indicator"></div>
                </button>
              </div>

              <button
                className="btn-primary-action"
                onClick={handleContinueMethod}
              >
                Continuar com {selectedMethod === 'pix' ? 'PIX' : selectedMethod === 'credit' ? 'Crédito' : 'Débito'}
              </button>
            </div>
          )}

          {/* 3. CARTÕES SALVOS */}
          {step === 'cards' && (
            <div className="checkout-subview">
              <div className="saved-cards-list">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className={`saved-card-item ${selectedCardId === card.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <div className="card-brand-badge">{card.brand}</div>
                    <div className="card-info-col">
                      <div className="card-number-masked">{card.number}</div>
                      <div className="card-expiry-text">Expira em {card.expiry} • {card.type || 'Cartão'}</div>
                    </div>
                    <div className="option-radio-indicator"></div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-add-card"
                onClick={() => {
                  setCardError('');
                  setStep('card-form');
                }}
              >
                <Plus size={18} />
                <span>Adicionar Novo Cartão</span>
              </button>

              <button
                className="btn-primary-action"
                onClick={() => {
                  const selectedCard = savedCards.find((c) => c.id === selectedCardId);
                  applySubscription(currentPlan);
                  alert(`Assinatura do ${currentPlan.name} confirmada no cartão ${selectedCard?.brand} final ${selectedCard?.number.slice(-4)}!`);
                  setStep('subscription');
                }}
              >
                Confirmar Pagamento ({currentPlan.price})
              </button>
            </div>
          )}

          {/* 4. FORMULÁRIO DE NOVO CARTÃO */}
          {step === 'card-form' && (
            <form className="checkout-subview card-form-view" onSubmit={handleSaveCard}>
              <div className="virtual-card-preview">
                <div className="card-chip-row">
                  <div className="card-chip"></div>
                  <span className="card-type-tag">
                    {getCardBrand(cardData.number)} • {selectedMethod === 'debit' ? 'Débito' : 'Crédito'}
                  </span>
                </div>
                <div className="card-number-display">
                  {cardData.number || '•••• •••• •••• ••••'}
                </div>
                <div className="card-holder-exp-row">
                  <span className="holder-name">{cardData.name.toUpperCase() || 'NOME DO TITULAR'}</span>
                  <span>{cardData.expiry || 'MM/AA'}</span>
                </div>
              </div>

              {cardError && (
                <div className="card-error-alert">
                  <span>{cardError}</span>
                </div>
              )}

              <div className="card-form-fields">
                <div className="input-group-minimal">
                  <label htmlFor="card-number">Número do Cartão</label>
                  <div className="input-icon-wrapper">
                    <CreditCard size={18} className="input-icon-left" />
                    <input
                      id="card-number"
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={cardData.number}
                      onChange={handleCardNumberChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-dual">
                  <div className="input-group-minimal">
                    <label htmlFor="card-exp">Validade</label>
                    <div className="input-icon-wrapper">
                      <input
                        id="card-exp"
                        type="text"
                        maxLength={5}
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={handleExpiryChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group-minimal">
                    <label htmlFor="card-cvc">CVC / CVV</label>
                    <div className="input-icon-wrapper">
                      <input
                        id="card-cvc"
                        type="password"
                        maxLength={4}
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={handleCvcChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="input-group-minimal">
                  <label htmlFor="card-holder">Nome Impresso no Cartão</label>
                  <div className="input-icon-wrapper">
                    <input
                      id="card-holder"
                      type="text"
                      placeholder="Nome completo do titular"
                      value={cardData.name}
                      onChange={(e) => {
                        setCardData({ ...cardData, name: e.target.value });
                        setCardError('');
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary-action">
                Salvar e Usar este Cartão
              </button>
            </form>
          )}

          {/* 5. CHECKOUT PIX */}
          {step === 'pix' && (
            <div className="checkout-subview pix-checkout-view">
              <div className="pix-status-badge">
                <span className="pix-pulse-dot"></span>
                <span>Aguardando pagamento • {currentPlan.name} ({currentPlan.price})</span>
              </div>

              <div className="pix-qrcode-box">
                <svg width="160" height="160" viewBox="0 0 120 120" fill="#000000">
                  <rect width="120" height="120" fill="#ffffff" rx="10" />
                  <rect x="10" y="10" width="28" height="28" fill="#000000" rx="3" />
                  <rect x="14" y="14" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="18" y="18" width="12" height="12" fill="#000000" rx="1" />
                  <rect x="82" y="10" width="28" height="28" fill="#000000" rx="3" />
                  <rect x="86" y="14" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="90" y="18" width="12" height="12" fill="#000000" rx="1" />
                  <rect x="10" y="82" width="28" height="28" fill="#000000" rx="3" />
                  <rect x="14" y="86" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="18" y="90" width="12" height="12" fill="#000000" rx="1" />
                  <rect x="86" y="86" width="16" height="16" fill="#000000" rx="2" />
                  <rect x="89" y="89" width="10" height="10" fill="#ffffff" rx="1" />
                  <rect x="92" y="92" width="4" height="4" fill="#000000" />
                  <circle cx="60" cy="60" r="9" fill="#6366f1" />
                  <path d="M57 57l6 6M63 57l-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="pix-timer-alert">
                <Clock size={15} />
                <span>Expira em: <strong>{formatTime(pixTimeLeft)}</strong></span>
              </div>

              <div className="pix-copy-section">
                <div className="pix-copy-label">Código PIX Copia e Cola:</div>
                <div className="pix-copy-box">
                  <span className="pix-key-code" title={pixKeyCopy}>
                    {pixKeyCopy}
                  </span>
                  <button
                    type="button"
                    className={`btn-copy-pix ${pixCopied ? 'copied' : ''}`}
                    onClick={handleCopyPix}
                  >
                    <Copy size={14} />
                    <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <button
                className={`btn-primary-action ${pixPaid ? 'paid' : ''}`}
                onClick={() => {
                  setPixPaid(true);
                  applySubscription(currentPlan);
                  setTimeout(() => {
                    alert(`Pagamento PIX do ${currentPlan.name} recebido com sucesso!`);
                    setStep('subscription');
                  }, 800);
                }}
              >
                {pixPaid ? 'Confirmando pagamento...' : 'Já realizei o pagamento via PIX'}
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
