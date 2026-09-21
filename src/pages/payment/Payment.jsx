import { useState, useEffect } from 'react';
import './Payment.css';

// Definição dos 3 Planos Voyage
const PLANS = [
  {
    id: 'basic',
    name: 'Básico',
    badge: 'Gratuito',
    price: 'R$ 0,00',
    period: 'por mês',
    description: 'Ideal para descobrir estabelecimentos locais e explorar rotas.',
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
    description: 'Mais economia e comodidade para seus passeios do dia a dia.',
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
    badge: 'Completo',
    price: 'R$ 29,90',
    period: 'por mês',
    description: 'Acesso VIP ilimitado a todas as vantagens da plataforma.',
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
  // Estados de navegação do fluxo: 'subscription' | 'methods' | 'cards' | 'card-form' | 'pix'
  const [step, setStep] = useState('subscription');

  // Plano selecionado ('basic' | 'intermediary' | 'plus')
  const [selectedPlanId, setSelectedPlanId] = useState('plus');

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

  // Formatação MM:SS para o PIX
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[2];

  // Detecção de bandeira do cartão
  const getCardBrand = (number) => {
    const clean = number.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    if (/^(4011|4389|4514|5041|5066|5067|5090|6277|6362|6363)/.test(clean)) return 'ELO';
    return 'CARTÃO';
  };

  // Máscaras de entrada
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData({ ...cardData, number: formatted });
    setCardError('');
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardData({ ...cardData, expiry: val });
    setCardError('');
  };

  const handleCvcChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData({ ...cardData, cvc: val });
    setCardError('');
  };

  // Salvar novo cartão na lista de cartões salvos
  const handleSaveCard = (e) => {
    e.preventDefault();
    const cleanNum = cardData.number.replace(/\D/g, '');
    if (cleanNum.length < 13) {
      setCardError('Digite um número de cartão válido.');
      return;
    }
    if (cardData.expiry.length !== 5) {
      setCardError('Informe a validade no formato MM/AA.');
      return;
    }
    if (cardData.cvc.length < 3) {
      setCardError('Informe um CVC válido de 3 ou 4 dígitos.');
      return;
    }
    if (!cardData.name.trim()) {
      setCardError('Informe o nome do titular do cartão.');
      return;
    }

    const lastFour = cleanNum.slice(-4);
    const brand = getCardBrand(cleanNum);
    const newCard = {
      id: `card-${Date.now()}`,
      brand,
      number: `•••• •••• •••• ${lastFour}`,
      expiry: cardData.expiry,
      type: selectedMethod === 'debit' ? 'Débito' : 'Crédito',
    };

    setSavedCards([newCard, ...savedCards]);
    setSelectedCardId(newCard.id);
    setCardData({ number: '', cvc: '', expiry: '', name: '' });
    setCardError('');
    setStep('cards');
  };

  // Chave PIX gerada dinamicamente
  const pixKeyCopy = `00020126580014br.gov.bcb.pix0136voyage-${currentPlan.pixCodeSuffix}-checkout5204000053039865802BR5920VOYAGE_INTERMEDIACAO6009SAO_PAULO62070503***6304`;

  const handleCopyPix = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKeyCopy);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  // Ação de avançar a partir de Formas de Pagamento
  const handleContinueMethod = () => {
    if (currentPlan.amount === 0) {
      alert(`Plano Básico Gratuito ativado com sucesso para sua conta!`);
      setStep('subscription');
      return;
    }

    if (selectedMethod === 'pix') {
      setPixTimeLeft(1800);
      setPixPaid(false);
      setStep('pix');
    } else {
      setStep('cards');
    }
  };

  return (
    <div id="payment-root">
      {/* Cabeçalho */}
      <header className="payment-header">
        <div className="header-top-row">
          {step !== 'subscription' ? (
            <button
              className="back-btn"
              onClick={() => {
                if (step === 'methods') setStep('subscription');
                else if (step === 'cards') setStep('methods');
                else if (step === 'card-form') setStep('cards');
                else if (step === 'pix') setStep('methods');
              }}
              title="Voltar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : (
            <div style={{ width: 22 }}></div>
          )}

          <div className="header-logo-container">
            <span className="voyage-logo-text"><span className="voyage-logo-v">V</span>oyage</span>
            <span className="voyage-plus-badge">Voyage+</span>
          </div>

          <div style={{ width: 22 }}></div>
        </div>

        <h2 className="page-title">
          {(() => {
            switch (step) {
              case 'subscription':
                return 'Escolha seu Plano';
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
        </h2>
      </header>

      {/* Corpo da Tela */}
      <main className="payment-content">

        {/* 1. TELA: SELEÇÃO DE 3 PLANOS (BÁSICO, INTERMEDIÁRIO, PLUS) */}
        {step === 'subscription' && (
          <div className="subscription-view">
            <div className="plan-intro">
              <h3>Experiência Sob Medida</h3>
              <p>Selecione a modalidade ideal para o seu perfil</p>
            </div>

            {/* Grid dos 3 Planos */}
            <div className="plans-selector-grid">
              {PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`plan-card-item ${isSelected ? 'selected' : ''} ${plan.id}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
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
                            <svg className="feat-icon check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg className="feat-icon cross" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                          <span>{feat.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="plan-radio-row">
                      <div className={`plan-radio-circle ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <div className="plan-radio-inner" />}
                      </div>
                      <span className="plan-select-label">
                        {isSelected ? 'Plano Selecionado' : 'Clique para Escolher'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="btn-primary-action"
              onClick={() => {
                if (currentPlan.amount === 0) {
                  alert('Plano Básico gratuito ativado com sucesso!');
                } else {
                  setStep('methods');
                }
              }}
            >
              {currentPlan.amount === 0 ? 'Continuar com Plano Gratuito' : `Continuar • ${currentPlan.price}`}
            </button>
          </div>
        )}

        {/* 2. TELA: SELEÇÃO DA FORMA DE PAGAMENTO */}
        {step === 'methods' && (
          <div className="methods-view">
            <div className="selected-plan-banner">
              <div className="plan-summary-info">
                <span className="summary-label">Plano Selecionado:</span>
                <span className="summary-val">{currentPlan.name} ({currentPlan.price})</span>
              </div>
              <button className="btn-change-plan" onClick={() => setStep('subscription')}>Alterar</button>
            </div>

            <div className="payment-options-list">
              {/* Opção Crédito */}
              <button
                type="button"
                className={`payment-option-btn ${selectedMethod === 'credit' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('credit')}
              >
                <div className="option-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="option-text-info">
                  <span className="option-title">Cartão de Crédito</span>
                  <span className="option-sub">Ativação imediata da assinatura</span>
                </div>
                <div className="option-radio-indicator"></div>
              </button>

              {/* Opção Débito */}
              <button
                type="button"
                className={`payment-option-btn ${selectedMethod === 'debit' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('debit')}
              >
                <div className="option-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className="option-text-info">
                  <span className="option-title">Cartão de Débito</span>
                  <span className="option-sub">Débito em conta à vista</span>
                </div>
                <div className="option-radio-indicator"></div>
              </button>

              {/* Opção PIX */}
              <button
                type="button"
                className={`payment-option-btn ${selectedMethod === 'pix' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('pix')}
              >
                <div className="option-icon-box pix-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="option-text-info">
                  <span className="option-title">PIX (Instantâneo)</span>
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

        {/* 3. TELA: CARTÕES SALVOS */}
        {step === 'cards' && (
          <div className="saved-cards-view">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adicionar Novo Cartão
            </button>

            <button
              className="btn-primary-action"
              style={{ marginTop: 'auto' }}
              onClick={() => {
                const selectedCard = savedCards.find((c) => c.id === selectedCardId);
                alert(`Assinatura do ${currentPlan.name} confirmada com sucesso no cartão ${selectedCard?.brand} final ${selectedCard?.number.slice(-4)}!`);
                setStep('subscription');
              }}
            >
              Confirmar Pagamento ({currentPlan.price})
            </button>
          </div>
        )}

        {/* 4. TELA: FORMULÁRIO DE NOVO CARTÃO */}
        {step === 'card-form' && (
          <form className="card-form-view" onSubmit={handleSaveCard}>
            {/* Visualização de Cartão Virtual Dinâmico */}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{cardError}</span>
              </div>
            )}

            {/* Campos do Formulário */}
            <div className="card-form-fields">
              <div className="input-group-minimal">
                <label>Número do Cartão</label>
                <div className="input-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <input
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
                  <label>Validade</label>
                  <div className="input-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input
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
                  <label>CVC / CVV</label>
                  <div className="input-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
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
                <label>Nome Impresso no Cartão</label>
                <div className="input-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
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

        {/* 5. TELA: CHECKOUT PIX COM QR CODE FICTÍCIO REALISTA */}
        {step === 'pix' && (
          <div className="pix-checkout-view">
            <div className="pix-status-badge">
              <span className="pix-pulse-dot"></span>
              Aguardando pagamento • {currentPlan.name} ({currentPlan.price})
            </div>

            {/* QR Code Vetorial Realista de Alta Densidade */}
            <div className="pix-qrcode-box">
              <svg width="180" height="180" viewBox="0 0 120 120" fill="#000000">
                {/* Fundo Branco */}
                <rect width="120" height="120" fill="#ffffff" rx="10" />

                {/* Marcadores de Posição (Finders) */}
                {/* Superior Esquerdo */}
                <rect x="10" y="10" width="28" height="28" fill="#000000" rx="3" />
                <rect x="14" y="14" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="18" y="18" width="12" height="12" fill="#000000" rx="1" />

                {/* Superior Direito */}
                <rect x="82" y="10" width="28" height="28" fill="#000000" rx="3" />
                <rect x="86" y="14" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="90" y="18" width="12" height="12" fill="#000000" rx="1" />

                {/* Inferior Esquerdo */}
                <rect x="10" y="82" width="28" height="28" fill="#000000" rx="3" />
                <rect x="14" y="86" width="20" height="20" fill="#ffffff" rx="2" />
                <rect x="18" y="90" width="12" height="12" fill="#000000" rx="1" />

                {/* Marcador de Alinhamento Central Inferior */}
                <rect x="86" y="86" width="16" height="16" fill="#000000" rx="2" />
                <rect x="89" y="89" width="10" height="10" fill="#ffffff" rx="1" />
                <rect x="92" y="92" width="4" height="4" fill="#000000" />

                {/* Linhas de Sincronismo (Timing) */}
                <rect x="42" y="18" width="4" height="4" />
                <rect x="50" y="18" width="4" height="4" />
                <rect x="58" y="18" width="4" height="4" />
                <rect x="66" y="18" width="4" height="4" />
                <rect x="74" y="18" width="4" height="4" />

                <rect x="18" y="42" width="4" height="4" />
                <rect x="18" y="50" width="4" height="4" />
                <rect x="18" y="58" width="4" height="4" />
                <rect x="18" y="66" width="4" height="4" />
                <rect x="18" y="74" width="4" height="4" />

                {/* Matriz de Dados Fictícia de Alta Definição */}
                <rect x="44" y="26" width="4" height="4" />
                <rect x="52" y="26" width="6" height="4" />
                <rect x="64" y="26" width="4" height="4" />
                <rect x="72" y="26" width="4" height="4" />

                <rect x="44" y="34" width="6" height="4" />
                <rect x="56" y="34" width="4" height="4" />
                <rect x="64" y="34" width="8" height="4" />

                <rect x="26" y="44" width="4" height="6" />
                <rect x="34" y="44" width="4" height="4" />
                <rect x="44" y="44" width="8" height="8" />
                <rect x="56" y="44" width="4" height="4" />
                <rect x="64" y="44" width="4" height="4" />
                <rect x="74" y="44" width="8" height="8" />
                <rect x="86" y="44" width="4" height="4" />
                <rect x="94" y="44" width="6" height="4" />

                <rect x="26" y="56" width="8" height="4" />
                <rect x="38" y="56" width="4" height="4" />
                <rect x="46" y="56" width="4" height="8" />
                <rect x="56" y="56" width="12" height="4" />
                <rect x="72" y="56" width="4" height="4" />
                <rect x="82" y="56" width="6" height="6" />
                <rect x="94" y="56" width="4" height="4" />

                <rect x="26" y="66" width="4" height="8" />
                <rect x="36" y="66" width="6" height="4" />
                <rect x="54" y="66" width="6" height="4" />
                <rect x="64" y="66" width="8" height="8" />
                <rect x="76" y="66" width="4" height="4" />
                <rect x="86" y="66" width="8" height="4" />

                <rect x="44" y="78" width="8" height="4" />
                <rect x="56" y="78" width="4" height="4" />
                <rect x="66" y="78" width="6" height="6" />
                <rect x="76" y="78" width="4" height="4" />

                <rect x="44" y="88" width="6" height="6" />
                <rect x="54" y="88" width="4" height="4" />
                <rect x="62" y="88" width="8" height="4" />
                <rect x="74" y="88" width="4" height="6" />

                <rect x="44" y="98" width="4" height="6" />
                <rect x="52" y="98" width="8" height="4" />
                <rect x="64" y="98" width="6" height="4" />
                <rect x="74" y="98" width="8" height="4" />

                {/* Ícone Central Voyage/PIX */}
                <circle cx="60" cy="60" r="9" fill="#5437ea" />
                <path d="M57 57l6 6M63 57l-6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="pix-timer-alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Expira em: <strong>{formatTime(pixTimeLeft)}</strong></span>
            </div>

            {/* Código Copia e Cola */}
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
                  {pixCopied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="pix-instructions-card">
              <div className="pix-instructions-title">Como efetuar o pagamento:</div>
              <div className="pix-steps-list">
                <div className="pix-step-item">
                  <span className="step-number-bullet">1</span>
                  <span>Abra o app do seu banco ou carteira digital</span>
                </div>
                <div className="pix-step-item">
                  <span className="step-number-bullet">2</span>
                  <span>Escolha <strong>Pagar com PIX</strong> via QR Code ou Copia e Cola</span>
                </div>
                <div className="pix-step-item">
                  <span className="step-number-bullet">3</span>
                  <span>Aponte a câmera para o QR Code ou cole a chave acima</span>
                </div>
                <div className="pix-step-item">
                  <span className="step-number-bullet">4</span>
                  <span>Confirme o valor de <strong>{currentPlan.price}</strong> e finalize</span>
                </div>
              </div>
            </div>

            <button
              className={`btn-primary-action ${pixPaid ? 'paid' : ''}`}
              onClick={() => {
                setPixPaid(true);
                setTimeout(() => {
                  alert(`Pagamento PIX do ${currentPlan.name} recebido com sucesso!`);
                  setStep('subscription');
                }, 800);
              }}
            >
              {pixPaid ? 'Processando confirmação...' : 'Já realizei o pagamento via PIX'}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
