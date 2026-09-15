import { useState } from 'react';
import './Payment.css';

export default function Payment() {
  // Estados de navegação do fluxo: 'subscription' | 'methods' | 'cards' | 'card-form' | 'pix'
  const [step, setStep] = useState('subscription');

  // Estado da forma de pagamento selecionada: 'credit' | 'debit' | 'pix'
  const [selectedMethod, setSelectedMethod] = useState('credit');

  // Estado do formulário de cartão
  const [cardData, setCardData] = useState({
    number: '',
    cvc: '',
    expiry: '',
    name: ''
  });

  // Estado de seleção de cartão salvo
  const [selectedCardId, setSelectedCardId] = useState('card-1');

  // Mock de cartões salvos
  const savedCards = [
    { id: 'card-1', brand: 'VISA', number: '•••• •••• •••• 4242', expiry: '12/28' },
    { id: 'card-2', brand: 'MASTERCARD', number: '•••• •••• •••• 8891', expiry: '09/27' }
  ];

  // Ação de avançar a partir de Formas de Pagamento
  const handleContinueMethod = () => {
    if (selectedMethod === 'pix') {
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
          {step === 'subscription' && 'Assinatura'}
          {step === 'methods' && 'Formas de Pagamento'}
          {step === 'cards' && 'Cartões Salvos'}
          {step === 'card-form' && 'Cartões Crédito/Débito'}
          {step === 'pix' && 'PIX'}
        </h2>
      </header>

      {/* Corpo da Tela */}
      <main className="payment-content">

        {/* 1. TELA: ASSINATURA (VOYAGE+) */}
        {step === 'subscription' && (
          <div className="subscription-view">
            <div className="plan-intro">
              <h3>Eleve sua experiência</h3>
              <p>Desbloqueie benefícios e cupons exclusivos</p>
            </div>

            <div className="comparison-table-container">
              <div className="comparison-header-row">
                <span className="comparison-col-label">Recursos</span>
                <span className="comparison-col-free">Gratuito</span>
                <span className="comparison-col-plus">Voyage+</span>
              </div>

              <div className="comparison-row">
                <span className="feature-title">Cupons de Desconto</span>
                <span className="feature-free">Sem cupons</span>
                <span className="feature-plus">Exclusivos</span>
              </div>

              <div className="comparison-row">
                <span className="feature-title">Anúncios no App</span>
                <span className="feature-free">Com anúncios</span>
                <span className="feature-plus">Sem anúncios</span>
              </div>

              <div className="comparison-row">
                <span className="feature-title">Personalizações</span>
                <span className="feature-free"><span className="tag-pill limit">Limitadas</span></span>
                <span className="feature-plus"><span className="tag-pill unlimit">Ilimitadas</span></span>
              </div>
            </div>

            <button
              className="btn-primary-action"
              onClick={() => setStep('methods')}
            >
              Assinar R$ 19,90
            </button>
          </div>
        )}

        {/* 2. TELA: SELEÇÃO DA FORMA DE PAGAMENTO */}
        {step === 'methods' && (
          <div className="methods-view">
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
                <span className="option-title">Crédito</span>
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
                <span className="option-title">Débito</span>
                <div className="option-radio-indicator"></div>
              </button>

              {/* Opção PIX */}
              <button
                type="button"
                className={`payment-option-btn ${selectedMethod === 'pix' ? 'selected' : ''}`}
                onClick={() => setSelectedMethod('pix')}
              >
                <div className="option-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="option-title">PIX</span>
                <div className="option-radio-indicator"></div>
              </button>
            </div>

            <button
              className="btn-primary-action"
              onClick={handleContinueMethod}
            >
              Continuar
            </button>
          </div>
        )}

        {/* 3. TELA: CARTÕES SALVOS */}
        {step === 'cards' && (
          <div className="cards-list-view">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className={`saved-card-item ${selectedCardId === card.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCardId(card.id)}
                >
                  <div className="card-flag-badge">
                    {card.brand}
                  </div>
                  <div className="card-details-info">
                    <div className="card-masked-number">{card.number}</div>
                    <div className="card-expiry-text">Expira em {card.expiry}</div>
                  </div>
                  <div className="option-radio-indicator"></div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-add-card"
              onClick={() => setStep('card-form')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adicionar Cartão
            </button>

            <button
              className="btn-primary-action"
              style={{ marginTop: 'auto' }}
              onClick={() => alert('Assinatura realizada com sucesso com o cartão selecionado!')}
            >
              Continuar
            </button>
          </div>
        )}

        {/* 4. TELA: FORMULÁRIO DE CARTÃO */}
        {step === 'card-form' && (
          <div className="card-form-view">
            {/* Visualização de Cartão Virtual */}
            <div className="virtual-card-preview">
              <div className="card-chip-row">
                <div className="card-chip"></div>
                <span className="card-type-tag">{selectedMethod === 'debit' ? 'Débito' : 'Crédito'}</span>
              </div>
              <div className="card-number-display">
                {cardData.number || '•••• •••• •••• ••••'}
              </div>
              <div className="card-holder-exp-row">
                <span className="holder-name">{cardData.name || 'NOME DO TITULAR'}</span>
                <span>{cardData.expiry || 'MM/AA'}</span>
              </div>
            </div>

            {/* Campos do Formulário Minimalista */}
            <div className="card-form-fields">
              <div className="input-group-minimal">
                <label>Card Number</label>
                <div className="input-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-dual">
                <div className="input-group-minimal">
                  <label>CVC</label>
                  <div className="input-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="123"
                      value={cardData.cvc}
                      onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group-minimal">
                  <label>Expires Card</label>
                  <div className="input-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group-minimal">
                <label>Nome no Cartão</label>
                <div className="input-icon-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    placeholder="Nome completo do titular"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              className="btn-primary-action"
              onClick={() => {
                alert('Cartão validado e assinatura confirmada!');
                setStep('subscription');
              }}
            >
              Continuar
            </button>
          </div>
        )}

        {/* 5. TELA: CHECKOUT PIX & CONFIRMAÇÃO */}
        {step === 'pix' && (
          <div className="pix-checkout-view">
            <div className="pix-status-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Pedido Recebido!
            </div>

            {/* QR Code Ilustrativo em SVG */}
            <div className="pix-qrcode-box">
              <svg width="150" height="150" viewBox="0 0 100 100" fill="#000000">
                {/* Cantos superiores */}
                <rect x="10" y="10" width="26" height="26" fill="#000" rx="3" />
                <rect x="14" y="14" width="18" height="18" fill="#fff" rx="2" />
                <rect x="18" y="18" width="10" height="10" fill="#000" />

                <rect x="64" y="10" width="26" height="26" fill="#000" rx="3" />
                <rect x="68" y="14" width="18" height="18" fill="#fff" rx="2" />
                <rect x="72" y="18" width="10" height="10" fill="#000" />

                {/* Canto inferior esquerdo */}
                <rect x="10" y="64" width="26" height="26" fill="#000" rx="3" />
                <rect x="14" y="68" width="18" height="18" fill="#fff" rx="2" />
                <rect x="18" y="72" width="10" height="10" fill="#000" />

                {/* Blocos centrais e padrão do QR */}
                <rect x="42" y="12" width="6" height="6" />
                <rect x="52" y="12" width="6" height="6" />
                <rect x="42" y="24" width="6" height="6" />
                <rect x="52" y="30" width="6" height="6" />
                <rect x="12" y="44" width="6" height="6" />
                <rect x="24" y="44" width="6" height="6" />
                <rect x="36" y="44" width="8" height="8" />
                <rect x="48" y="44" width="6" height="6" />
                <rect x="60" y="44" width="6" height="6" />
                <rect x="76" y="44" width="8" height="8" />
                <rect x="44" y="56" width="6" height="6" />
                <rect x="56" y="56" width="6" height="6" />
                <rect x="68" y="56" width="6" height="6" />
                <rect x="44" y="68" width="6" height="6" />
                <rect x="56" y="68" width="6" height="6" />
                <rect x="68" y="68" width="6" height="6" />
                <rect x="80" y="68" width="6" height="6" />
                <rect x="44" y="80" width="8" height="8" />
                <rect x="60" y="80" width="6" height="6" />
                <rect x="76" y="80" width="8" height="8" />
              </svg>
            </div>

            <div className="pix-timer-alert">
              Código Expira em 30 Minutos!
            </div>

            <div className="pix-copy-section">
              <div className="pix-copy-label">Código Copia e Cola:</div>
              <div className="pix-copy-box">
                <span className="pix-key-code">00020126580014br.gov.bcb.pix0136voyage-plus-pix-1990</span>
                <button
                  type="button"
                  className="btn-copy-pix"
                  onClick={() => {
                    navigator.clipboard?.writeText('00020126580014br.gov.bcb.pix0136voyage-plus-pix-1990');
                    alert('Código PIX copiado!');
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="pix-instructions-card">
              <div className="pix-instructions-title">Como pagar com PIX:</div>
              <div className="pix-steps-list">
                <div className="pix-step-item">
                  <span className="step-number-bullet">1</span>
                  <span>Abra o aplicativo do seu banco</span>
                </div>
                <div className="pix-step-item">
                  <span className="step-number-bullet">2</span>
                  <span>Escolha pagar via PIX com QR Code ou Copia e Cola</span>
                </div>
                <div className="pix-step-item">
                  <span className="step-number-bullet">3</span>
                  <span>Cole o código ou aponte a câmera para o QR Code</span>
                </div>
                <div className="pix-step-item">
                  <span className="step-number-bullet">4</span>
                  <span>Confirme as informações e finalize o pagamento</span>
                </div>
              </div>
            </div>

            <button
              className="btn-primary-action"
              onClick={() => {
                alert('Pagamento confirmado com sucesso!');
                setStep('subscription');
              }}
            >
              Já realizei o pagamento
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
