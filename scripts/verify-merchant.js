/* global process */
/**
 * Suíte de testes sintéticos automatizados para verificação do Painel Merchant/Company.
 * Executada via Node.js em ambiente controlado sem gravações remotas reais.
 */
import assert from 'node:assert';
import {
  adaptCompanyToProfile,
  getMerchantDraftStorageKey,
  createEmptyMerchantData,
  resolveCategoryVertical,
  merchantService
} from '../src/services/merchantService.ts';
import {
  calculateDiscountPct,
  isOfferActive,
  validatePrice,
  validatePromoPrice,
  validateDateRange
} from '../src/utils/catalogValidators.ts';

console.log('🧪 Iniciando Verificação Automatizada do Painel Merchant/Company...\n');

let passedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
    process.exit(1);
  }
}

// 1. Testes do Adaptador da Empresa
runTest('Adaptador preserva nomeFantasia, categoria, telefone e places sem dados sintéticos', () => {
  const rawCompany = {
    id: 42,
    nomeFantasia: 'Pizzaria do Zé',
    categoria: 'Pizzaria',
    telefone: '(11) 98765-4321',
    places: 'Rua das Flores, 123 - Centro'
  };

  const profile = adaptCompanyToProfile(rawCompany);
  assert.strictEqual(profile.name, 'Pizzaria do Zé');
  assert.strictEqual(profile.primaryCategory, 'Pizzaria');
  assert.strictEqual(profile.contact.phone, '(11) 98765-4321');
  assert.strictEqual(profile.address.street, 'Rua das Flores, 123 - Centro');
  // Garante que não foram inventadas comodidades
  assert.strictEqual(profile.amenities.hasDelivery, false);
  assert.strictEqual(profile.amenities.hasWifi, false);
});

// 2. Testes de Isolamento de Rascunhos por Empresa e Usuário
runTest('Chave de rascunho isola estritamente por ID da empresa e ID do usuário', () => {
  const key1 = getMerchantDraftStorageKey(10, 1);
  const key2 = getMerchantDraftStorageKey(10, 2);
  const key3 = getMerchantDraftStorageKey(20, 1);

  assert.notStrictEqual(key1, key2, 'Usuários diferentes na mesma empresa devem ter chaves distintas');
  assert.notStrictEqual(key1, key3, 'Empresas diferentes devem ter chaves distintas');
  assert.strictEqual(key1, 'voyage_merchant_draft_1_10');
});

// 3. Teste de Inicialização Limpa (Sem Dados Fictícios)
runTest('createEmptyMerchantData não gera pratos, avaliações nem comodidades falsas', () => {
  const data = createEmptyMerchantData(10, 1);
  assert.strictEqual(data.media.length, 0, 'Galeria deve inicializar vazia');
  assert.strictEqual(data.specialHours.length, 0, 'Horários especiais vazios');
  assert.strictEqual(data.payments.acceptsCash, false);
  assert.strictEqual(data.payments.acceptsPix, false);
  // Todos os turnos começam vazios
  for (const day of Object.values(data.hours)) {
    assert.strictEqual(day.isOpen, false);
    assert.strictEqual(day.shifts.length, 0);
  }
});

// 4. Testes do Motor de Horários e Fuso Horário
runTest('isEstablishmentOpen retorna "Horário não informado" quando turnos estão vazios', () => {
  const emptyHours = createEmptyMerchantData(10, 1).hours;
  const status = merchantService.isEstablishmentOpen(emptyHours);
  assert.strictEqual(status.isOpen, false);
  assert.strictEqual(status.isUnspecified, true);
  assert.strictEqual(status.statusText, 'Horário não informado');
});

runTest('isEstablishmentOpen valida horário comercial padrão no fuso de São Paulo', () => {
  const hours = {
    segunda: { isOpen: true, shifts: [{ id: 's1', open: '08:00', close: '18:00' }] },
    terca: { isOpen: false, shifts: [] },
    quarta: { isOpen: false, shifts: [] },
    quinta: { isOpen: false, shifts: [] },
    sexta: { isOpen: false, shifts: [] },
    sabado: { isOpen: false, shifts: [] },
    domingo: { isOpen: false, shifts: [] }
  };

  // 2026-09-28 é uma segunda-feira.
  // Teste às 10:00 (Aberto)
  const openTime = new Date('2026-09-28T10:00:00-03:00');
  const statusOpen = merchantService.isEstablishmentOpen(hours, [], openTime, 'America/Sao_Paulo');
  assert.strictEqual(statusOpen.isOpen, true);

  // Teste às 18:00 (Instante de fechamento é considerado fechado)
  const exactCloseTime = new Date('2026-09-28T18:00:00-03:00');
  const statusClose = merchantService.isEstablishmentOpen(hours, [], exactCloseTime, 'America/Sao_Paulo');
  assert.strictEqual(statusClose.isOpen, false, 'Instante exato de fechamento deve ser fechado');

  // Teste às 20:00 (Fechado)
  const lateTime = new Date('2026-09-28T20:00:00-03:00');
  const statusLate = merchantService.isEstablishmentOpen(hours, [], lateTime, 'America/Sao_Paulo');
  assert.strictEqual(statusLate.isOpen, false);
});

runTest('isEstablishmentOpen suporta turnos noturnos que atravessam a meia-noite', () => {
  // Bar aberto na sexta das 18:00 às 02:00 (madrugada de sábado)
  const hours = {
    segunda: { isOpen: false, shifts: [] },
    terca: { isOpen: false, shifts: [] },
    quarta: { isOpen: false, shifts: [] },
    quinta: { isOpen: false, shifts: [] },
    sexta: { isOpen: true, shifts: [{ id: 's1', open: '18:00', close: '02:00' }] },
    sabado: { isOpen: false, shifts: [] },
    domingo: { isOpen: false, shifts: [] }
  };

  // Sexta-feira às 23:00 (Aberto)
  const friNight = new Date('2026-10-02T23:00:00-03:00');
  const statusFri = merchantService.isEstablishmentOpen(hours, [], friNight, 'America/Sao_Paulo');
  assert.strictEqual(statusFri.isOpen, true, 'Deve estar aberto na sexta à noite');

  // Sábado à 01:30 da madrugada (Continua aberto do turno da noite anterior)
  const satEarly = new Date('2026-10-03T01:30:00-03:00');
  const statusSatEarly = merchantService.isEstablishmentOpen(hours, [], satEarly, 'America/Sao_Paulo');
  assert.strictEqual(statusSatEarly.isOpen, true, 'Deve estar aberto na madrugada de sábado vindo do turno de sexta');

  // Sábado às 02:00 da madrugada (Fechamento atingido)
  const satClosed = new Date('2026-10-03T02:00:00-03:00');
  const statusSatClosed = merchantService.isEstablishmentOpen(hours, [], satClosed, 'America/Sao_Paulo');
  assert.strictEqual(statusSatClosed.isOpen, false, 'Deve fechar às 02:00');
});

runTest('Horários especiais por data têm precedência sobre a programação semanal', () => {
  // Segunda normalmente aberta das 08:00 às 18:00
  const hours = {
    segunda: { isOpen: true, shifts: [{ id: 's1', open: '08:00', close: '18:00' }] },
    terca: { isOpen: false, shifts: [] },
    quarta: { isOpen: false, shifts: [] },
    quinta: { isOpen: false, shifts: [] },
    sexta: { isOpen: false, shifts: [] },
    sabado: { isOpen: false, shifts: [] },
    domingo: { isOpen: false, shifts: [] }
  };

  // Feriado especial na segunda 28/09 (Fechado o dia todo)
  const specialHours = [
    { date: '28/09', description: 'Feriado Municipal', isOpen: false, shifts: [] }
  ];

  const mondayMidday = new Date('2026-09-28T12:00:00-03:00');
  const status = merchantService.isEstablishmentOpen(hours, specialHours, mondayMidday, 'America/Sao_Paulo');
  assert.strictEqual(status.isOpen, false, 'Horário especial de feriado deve ter precedência');
  assert.match(status.statusText, /Feriado Municipal/);
});

// 5. Testes de Ofertas, Vigência e Validação de Preços
runTest('isOfferActive reconhece ofertas vigentes e ignora promoções expiradas', () => {
  const activeOffer = {
    id: 'off_1',
    productId: 'p1',
    productName: 'Oferta Vigente',
    regularPrice: 50,
    promoPrice: 40,
    discountPct: 20,
    startDate: '2026-09-20',
    endDate: '2026-10-05'
  };

  const expiredOffer = {
    id: 'off_2',
    productId: 'p2',
    productName: 'Oferta Antiga',
    regularPrice: 50,
    promoPrice: 40,
    discountPct: 20,
    startDate: '2026-09-01',
    endDate: '2026-09-15'
  };

  const refDate = new Date('2026-09-26T12:00:00-03:00');
  assert.strictEqual(isOfferActive(activeOffer, 'America/Sao_Paulo', refDate), true);
  assert.strictEqual(isOfferActive(expiredOffer, 'America/Sao_Paulo', refDate), false);
});

runTest('calculateDiscountPct e validadores de preço', () => {
  const pct = calculateDiscountPct(100, 75);
  assert.strictEqual(pct, 25);

  // Preço promocional maior ou igual que regular resulta em 0% ou inválido
  const invalidPct = calculateDiscountPct(50, 60);
  assert.strictEqual(invalidPct, 0);

  const priceVal = validatePrice(-5);
  assert.strictEqual(priceVal.valid, false);

  const promoVal = validatePromoPrice(50, 60);
  assert.strictEqual(promoVal.valid, false);

  const validPromo = validatePromoPrice(50, 39.9);
  assert.strictEqual(validPromo.valid, true);

  const dateVal = validateDateRange('2026-10-10', '2026-10-05');
  assert.strictEqual(dateVal.valid, false);
});

// 6. Teste de Rejeição de 'company-default' e IDs Inválidos no salvamento
runTest('saveMerchantData rejeita "company-default" e IDs não numéricos sem chamar API', async () => {
  const dummyData = createEmptyMerchantData('company-default', 1);

  await assert.rejects(
    async () => {
      await merchantService.saveMerchantData(dummyData);
    },
    /Identificador de empresa inválido/
  );
});

// 7. Mapeamento de Categorias de Verticais
runTest('resolveCategoryVertical mapeia segmentos conhecidos e isola categorias gerais', () => {
  assert.strictEqual(resolveCategoryVertical('Pizzaria Delivery'), 'pizzaria');
  assert.strictEqual(resolveCategoryVertical('Supermercado Extra'), 'mercado');
  assert.strictEqual(resolveCategoryVertical('Restaurante e Bar'), 'restaurante');
  assert.strictEqual(resolveCategoryVertical('Oficina Mecânica'), 'geral');
  assert.strictEqual(resolveCategoryVertical('Academia Fitness'), 'geral');
  assert.strictEqual(resolveCategoryVertical('Hotel Fazenda'), 'geral');
});

console.log(`\n🎉 Todos os ${passedTests} testes sintéticos foram executados e APROVADOS com sucesso!`);
