/**
 * commercialCatalogService.js
 * Gerador determinístico e flexível de catálogo comercial por estabelecimento e categoria.
 * Suporta armazenamento no localStorage para permitir que os dados sejam editados/customizados futuramente.
 */

const STORAGE_KEY = 'voyage_custom_commercial_catalogs';

/**
 * Obtém customizações salvas pelo usuário ou administrador no localStorage
 */
function getCustomCatalogs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Erro ao ler custom catalogs do localStorage', e);
    return {};
  }
}

/**
 * Salva uma customização de catálogo para um determinado POI (por ID ou Nome)
 */
export function saveCustomCatalog(poiId, catalogData) {
  try {
    const current = getCustomCatalogs();
    current[String(poiId)] = catalogData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Erro ao salvar custom catalog', e);
  }
}

/**
 * Hash simples para gerar números estáveis a partir do ID ou nome do local
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Gerador automático de cardápio / promoções / combustíveis / serviços
 */
export function getCommercialDetails(poi) {
  if (!poi) return null;

  // 1. Verifica se há customização salva no localStorage para este POI
  const customCatalogs = getCustomCatalogs();
  const custom = customCatalogs[String(poi.id)] || customCatalogs[poi.name];
  if (custom) {
    return custom;
  }

  // 2. Determina o tipo e gera dados automáticos coerentes
  const seed = hashString(String(poi.id || poi.name || 'poi'));
  const categoryId = (poi.categoryId || '').toLowerCase();
  const categoryGroup = (poi.categoryGroup || '').toLowerCase();
  const name = (poi.name || '').toLowerCase();

  // --- SUPERMERCADO RATTI (SUPER FEIRÃO DA HORTA) ---
  if (name.includes('ratti') || String(poi.id).includes('ratti')) {
    return {
      type: 'market_ratti',
      title: 'SUPER FEIRÃO DA HORTA - SUPERMERCADO RATTI',
      subtitle: 'Qualidade da Horta pra Você • Válido para 25/09/2026',
      badge: '🥦 Super Feirão Hortifrúti',
      whatsapp: '(16) 99641-1440',
      addressNote: 'Av. República do Líbano, 361 - Jd. Cruzeiro do Sul',
      sections: [
        {
          name: 'Frutas Frescas Selecionadas',
          items: [
            { name: 'Banana Nanica Exportação', price: 'R$ 3,99', unit: '/kg', tag: 'Destaque' },
            { name: 'Laranja Pêra Rio', price: 'R$ 2,39', unit: '/kg', tag: 'Ofertaço' },
            { name: 'Goiaba Vermelha', price: 'R$ 2,99', unit: '/kg' },
            { name: 'Mamão Papaya', price: 'R$ 3,99', unit: '/un' },
            { name: 'Manga Tommy', price: 'R$ 4,99', unit: '/kg' },
            { name: 'Maçã Fuji', price: 'R$ 6,59', unit: '/kg' },
            { name: 'Melão Amarelo', price: 'R$ 7,59', unit: '/kg' },
            { name: 'Limão Taiti', price: 'R$ 8,69', unit: '/kg' },
            { name: 'Uva Sem Sementes Vitória (Bdj 500g)', price: 'R$ 6,99', unit: '/bdj' },
            { name: 'Morganguinho Minas (Bdj 250g)', price: 'R$ 8,59', unit: '/bdj' }
          ]
        },
        {
          name: 'Legumes e Verduras da Horta',
          items: [
            { name: 'Repolho Verde', price: 'R$ 1,89', unit: '/kg', tag: 'Imbatível' },
            { name: 'Mandioca Extra', price: 'R$ 2,99', unit: '/kg' },
            { name: 'Beterraba Extra', price: 'R$ 3,79', unit: '/kg' },
            { name: 'Abóbora Cabotiá', price: 'R$ 3,69', unit: '/kg' },
            { name: 'Cenoura São Gotardo', price: 'R$ 3,79', unit: '/kg' },
            { name: 'Batata Extra', price: 'R$ 3,99', unit: '/kg', tag: 'Mais Vendido' },
            { name: 'Berinjela Extra', price: 'R$ 4,49', unit: '/kg' },
            { name: 'Pepino Caipira', price: 'R$ 4,89', unit: '/kg' },
            { name: 'Chuchu Extra', price: 'R$ 6,49', unit: '/kg' },
            { name: 'Abobrinha Brasileira', price: 'R$ 6,99', unit: '/kg' },
            { name: 'Mandioquinha Extra', price: 'R$ 6,89', unit: '/kg' },
            { name: 'Pimentão Verde', price: 'R$ 7,49', unit: '/kg' },
            { name: 'Brócolis Ninja', price: 'R$ 8,79', unit: '/un' },
            { name: 'Couve Flor', price: 'R$ 8,99', unit: '/un' },
            { name: 'Tomate Salada Extra', price: 'R$ 9,99', unit: '/kg' }
          ]
        }
      ],
      features: [
        'Compre sem sair de casa pelo WhatsApp',
        'Entregamos para toda São Carlos',
        'Aceitamos Cartão VEGAS CARD',
        'Estacionamento Próprio'
      ],
      lastUpdate: 'Ofertas Válidas para 25/09/2026'
    };
  }

  // --- POSTOS DE COMBUSTÍVEL ---
  if (categoryId === 'posto' || name.includes('posto') || name.includes('ipiranga') || name.includes('shell') || name.includes('br') || name.includes('petrobras') || name.includes('graal')) {
    const gasVar = (seed % 30) / 100; // variação de centavos
    const etaVar = ((seed * 3) % 30) / 100;
    const dieVar = ((seed * 7) % 30) / 100;
    const gnvVar = ((seed * 5) % 20) / 100;

    return {
      type: 'fuel',
      title: 'Tabela de Combustíveis',
      subtitle: 'Preços médios atualizados hoje',
      badge: '⛽ Combustíveis',
      items: [
        { name: 'Gasolina Comum', price: `R$ ${(5.69 + gasVar).toFixed(2)}`, unit: '/litro', highlight: false },
        { name: 'Gasolina Aditivada', price: `R$ ${(5.89 + gasVar).toFixed(2)}`, unit: '/litro', highlight: true, tag: 'Recomendado' },
        { name: 'Etanol', price: `R$ ${(3.79 + etaVar).toFixed(2)}`, unit: '/litro', highlight: false },
        { name: 'Diesel S10', price: `R$ ${(5.99 + dieVar).toFixed(2)}`, unit: '/litro', highlight: false },
        { name: 'GNV', price: `R$ ${(4.39 + gnvVar).toFixed(2)}`, unit: '/m³', highlight: false }
      ],
      features: ['Troca de Óleo', 'Calibrador de Pneus', 'Loja de Conveniência', 'Lava-Rápido'],
      lastUpdate: 'Hoje às 08:30'
    };
  }

  // --- BARES / PUBS / ADEGAS ---
  if (categoryId === 'bar' || categoryId === 'pub' || categoryId === 'adega' || name.includes('bar') || name.includes('pub') || name.includes('chopp') || name.includes('cervej') || name.includes('boteco') || name.includes('adega')) {
    const choppPrice = 10 + (seed % 6);
    const pilsenPrice = choppPrice + 3;
    const porcaoPrice = 38 + (seed % 20);

    return {
      type: 'bar',
      title: 'Chopps, Bebidas & Petiscos',
      subtitle: 'Happy hour & destaques da casa',
      badge: '🍻 Cardápio de Bar',
      sections: [
        {
          name: 'Chopps & Cervejas',
          items: [
            { name: 'Chopp Pilsen (300ml)', price: `R$ ${choppPrice.toFixed(2)}`, desc: 'Leve, cremoso e trincando' },
            { name: 'Chopp IPA Artesanal (500ml)', price: `R$ ${(pilsenPrice + 6).toFixed(2)}`, desc: 'Aromático, notas cítricas e amargor equilibrado', tag: 'Mais Pedido' },
            { name: 'Chopp de Vinho (400ml)', price: `R$ ${(choppPrice + 4).toFixed(2)}`, desc: 'Doce e refrescante' },
            { name: 'Heineken / Stella 600ml', price: `R$ ${(16 + (seed % 4)).toFixed(2)}`, desc: 'Garrafa bem gelada' },
            { name: 'Drink Gin Tropical', price: `R$ ${(26 + (seed % 8)).toFixed(2)}`, desc: 'Gin artesanal, Red Bull Tropical e laranja' }
          ]
        },
        {
          name: 'Porções & Petiscos de Boteco',
          items: [
            { name: 'Batata Frita Especial', price: `R$ ${(28 + (seed % 6)).toFixed(2)}`, desc: 'Com cheddar cremoso e bacon crocante' },
            { name: 'Isca de Frango Empanada', price: `R$ ${(34 + (seed % 8)).toFixed(2)}`, desc: 'Acompanha molho tártaro e molho de mostarda e mel' },
            { name: 'Picanha na Chapa com Mandioca', price: `R$ ${(porcaoPrice + 30).toFixed(2)}`, desc: 'Servida com queijo coalho e vinagrete', tag: 'Destaque' },
            { name: 'Pastéis Mistos (8 unid)', price: `R$ ${(29 + (seed % 5)).toFixed(2)}`, desc: 'Queijo, carne e palmito' }
          ]
        }
      ],
      features: ['Música ao Vivo', 'Mesa de Sinuca', 'Happy Hour 17h-20h', 'Ambiente Climatizado'],
      lastUpdate: 'Cardápio Verificado'
    };
  }

  // --- MERCADOS / SUPERMERCADOS / CONVENIÊNCIAS ---
  if (categoryId === 'mercado' || categoryId === 'supermercado' || categoryId === 'conveniencia' || categoryGroup === 'compras' || name.includes('mercado') || name.includes('supermercado') || name.includes('savegnago') || name.includes('carrefour') || name.includes('pão de açúcar') || name.includes('dia') || name.includes('jaú')) {
    return {
      type: 'market',
      title: 'Ofertas & Destaques da Semana',
      subtitle: 'Confira as melhores promoções ativas',
      badge: '🏷️ Ofertas em Destaque',
      items: [
        { name: 'Cerveja Lata 350ml (Pack 12)', oldPrice: 'R$ 47,88', price: `R$ ${(38.90 + (seed % 5)).toFixed(2)}`, tag: 'Super Oferta', desc: 'Desconto direto no caixa' },
        { name: 'Picanha Bovina Resfriada kg', oldPrice: 'R$ 69,90', price: `R$ ${(54.90 + (seed % 10)).toFixed(2)}`, tag: 'Carnes', desc: 'Peça a vácuo selecionada' },
        { name: 'Refrigerante Coca-Cola 2L', oldPrice: 'R$ 10,99', price: `R$ ${(8.49 + (seed % 2)).toFixed(2)}`, tag: '-20%', desc: 'Garrafa PET' },
        { name: 'Arroz Tipo 1 (5kg)', oldPrice: 'R$ 29,90', price: `R$ ${(23.99 + (seed % 4)).toFixed(2)}`, desc: 'Grãos nobres' },
        { name: 'Leite Integral 1L (Caixa c/ 12)', oldPrice: 'R$ 58,80', price: `R$ ${(49.90 + (seed % 6)).toFixed(2)}`, tag: 'Clube', desc: 'Preço exclusivo clube de fidelidade' }
      ],
      features: ['Estacionamento Grátis', 'Padaria Própria', 'Açougue Fresco', 'Hortifruti Selecionado', 'Aceita Vale Alimentação'],
      lastUpdate: 'Folheto Válido até Domingo'
    };
  }

  // --- PIZZARIAS ---
  if (categoryId === 'pizzaria' || name.includes('pizz') || name.includes('florença')) {
    const baseP = 46 + (seed % 10);
    return {
      type: 'pizzeria',
      title: 'Cardápio de Pizzas',
      subtitle: 'Forno a lenha & massas artesanais',
      badge: '🍕 Sabores & Preços',
      sections: [
        {
          name: 'Pizzas Salgadas (Grande - 8 Pedaços)',
          items: [
            { name: 'Calabresa Especial', price: `R$ ${baseP.toFixed(2)}`, desc: 'Molho artesanal, calabresa fatiada, cebola e azeitonas pretas' },
            { name: 'Mussarela Premium', price: `R$ ${(baseP - 2).toFixed(2)}`, desc: 'Mussarela derretida, rodelas de tomate e orégano' },
            { name: 'Frango com Catupiry', price: `R$ ${(baseP + 8).toFixed(2)}`, desc: 'Frango desfiado temperado e legítimo Catupiry', tag: 'Favorita' },
            { name: 'Quatro Queijos', price: `R$ ${(baseP + 10).toFixed(2)}`, desc: 'Mussarela, provolone, gorgonzola e catupiry' },
            { name: 'Portuguesa Tradicional', price: `R$ ${(baseP + 6).toFixed(2)}`, desc: 'Presunto, ovos, cebola, ervilha e mussarela' }
          ]
        },
        {
          name: 'Pizzas Doces & Bordas',
          items: [
            { name: 'Borda Recheada de Catupiry/Cheddar', price: 'R$ 12,00', desc: 'Borda vulcão bem recheada' },
            { name: 'Pizza Chocolate com Morango (Média)', price: `R$ ${(baseP + 2).toFixed(2)}`, desc: 'Chocolate ao leite com morangos frescos picados' }
          ]
        }
      ],
      features: ['Delivery Rápido', 'Forno a Lenha', 'Borda Recheada', 'Refrigerante 2L Grátis na compra de 2 pizzas'],
      lastUpdate: 'Promoção Hoje: Borda Grátis às Terças e Quintas'
    };
  }

  // --- PADARIAS & CAFÉS ---
  if (categoryId === 'padaria' || categoryId === 'cafe' || name.includes('padaria') || name.includes('panificadora') || name.includes('cafe') || name.includes('café')) {
    return {
      type: 'bakery',
      title: 'Cafés, Pães & Lanches',
      subtitle: 'Sabor fresquinho a toda hora',
      badge: '🥐 Destaques da Casa',
      items: [
        { name: 'Pão Francês Tradicional (kg)', price: `R$ ${(16.90 + (seed % 4)).toFixed(2)}`, desc: 'Crocante por fora, macio por dentro' },
        { name: 'Café Espresso Gourmet', price: `R$ ${(6.50 + (seed % 3)).toFixed(2)}`, desc: 'Grãos 100% arábica moídos na hora' },
        { name: 'Misto Quente na Chapa', price: `R$ ${(11.00 + (seed % 3)).toFixed(2)}`, desc: 'Pão francês com bastante queijo e presunto' },
        { name: 'Combo Matinal (Café com Leite + Pão na Chapa)', price: `R$ ${(14.50 + (seed % 3)).toFixed(2)}`, tag: 'Combo Econômico' },
        { name: 'Fatia de Bolo Caseiro', price: `R$ ${(8.00 + (seed % 2)).toFixed(2)}`, desc: 'Cenoura com chocolate / Fubá cremoso / Laranja' }
      ],
      features: ['Pão Quentinho a cada 30min', 'Café da Manhã Completo', 'Doces Finos', 'Wi-Fi Gratuito'],
      lastUpdate: 'Aberto desde as 06:00'
    };
  }

  // --- RESTAURANTES / ALIMENTAÇÃO GERAL ---
  if (categoryGroup === 'alimentacao' || categoryId === 'restaurante' || categoryId === 'lanchonete') {
    const buffetPrice = 49.90 + (seed % 25);
    const pratoFeito = 24.90 + (seed % 10);

    return {
      type: 'restaurant',
      title: 'Pratos, Cardápio & Buffet',
      subtitle: 'Opções para almoço e jantar',
      badge: '🍽️ Menu & Preços',
      items: [
        { name: 'Buffet por Quilo / Self-Service', price: `R$ ${buffetPrice.toFixed(2)}/kg`, tag: 'Almoço', desc: 'Mais de 30 opções de saladas, carnes e pratos quentes' },
        { name: 'Prato Feito Executivo do Dia', price: `R$ ${pratoFeito.toFixed(2)}`, tag: 'Executivo', desc: 'Arroz, feijão, fritas, salada e opção de bife ou frango' },
        { name: 'Marmitex Grande', price: `R$ ${(pratoFeito - 2).toFixed(2)}`, desc: 'Acompanha 2 opções de carne e guarnições' },
        { name: 'Suco Natural da Fruta 500ml', price: 'R$ 9,00', desc: 'Laranja, maracujá, abacaxi com hortelã' },
        { name: 'Sobremesa Cortesia no Almoço', price: 'Grátis', tag: 'Brinde', desc: 'Pudim ou doce caseiro incluso no buffet' }
      ],
      features: ['Ar Condicionado', 'Marmitex para Viagem', 'Aceita VR / Sodexo / Alelo / Ticket', 'Espaço Família'],
      lastUpdate: 'Cardápio do Almoço Atualizado'
    };
  }

  // --- FARMÁCIAS & SAÚDE ---
  if (categoryGroup === 'saude' || categoryId === 'farmacia' || name.includes('farma') || name.includes('droga')) {
    return {
      type: 'pharmacy',
      title: 'Serviços de Saúde & Ofertas',
      subtitle: 'Medicamentos, perfumaria e cuidados',
      badge: '💊 Saúde & Bem-estar',
      items: [
        { name: 'Aferição de Pressão Arterial', price: 'Grátis', tag: 'Serviço', desc: 'Realizado pelo farmacêutico de plantão' },
        { name: 'Teste de Glicemia Capilar', price: 'R$ 8,00', desc: 'Resultado rápido em 5 segundos' },
        { name: 'Protetor Solar FPS 50 (200ml)', oldPrice: 'R$ 69,90', price: `R$ ${(49.90 + (seed % 8)).toFixed(2)}`, tag: '-28%', desc: 'Promoção de verão' },
        { name: 'Vitamina C + Zinco (30 comp)', price: `R$ ${(22.50 + (seed % 6)).toFixed(2)}`, tag: 'Imunidade', desc: 'Fortalecimento do sistema imunológico' },
        { name: 'Fraldas Infantis Mega Pacote', oldPrice: 'R$ 84,90', price: `R$ ${(68.90 + (seed % 6)).toFixed(2)}`, tag: 'Mamãe & Bebê' }
      ],
      features: ['Farmacêutico 24h', 'Aplicação de Injetáveis', 'Entrega em Domicílio', 'Descontos pelo Convênio e CPF'],
      lastUpdate: 'Plantão Ativo'
    };
  }

  // --- SERVIÇOS AUTOMOTIVOS (OFICINAS, PNEUS, LAVA-RÁPIDO) ---
  if (categoryGroup === 'automotivo' || categoryId === 'oficina' || categoryId === 'lavarapido' || categoryId === 'borracharia') {
    return {
      type: 'automotive',
      title: 'Tabela de Serviços Automotivos',
      subtitle: 'Mão de obra e manutenção expressa',
      badge: '🔧 Serviços & Valores',
      items: [
        { name: 'Alinhamento 3D + Balanceamento 4 Rodas', price: `R$ ${(89.00 + (seed % 20)).toFixed(2)}`, tag: 'Combo', desc: 'Ajuste de precisão computadorizada' },
        { name: 'Troca de Óleo + Filtros (Mão de Obra)', price: `R$ ${(45.00 + (seed % 15)).toFixed(2)}`, desc: 'Óleo sintético ou semi-sintético conforme fabricante' },
        { name: 'Higienização de Ar Condicionado com Ozônio', price: `R$ ${(60.00 + (seed % 10)).toFixed(2)}`, desc: 'Elimina 99% de fungos e bactérias' },
        { name: 'Lavagem Completa com Cera', price: `R$ ${(55.00 + (seed % 15)).toFixed(2)}`, desc: 'Interna e externa com acabamento premium' },
        { name: 'Conserto de Pneu / Vulcanização', price: `R$ ${(25.00 + (seed % 10)).toFixed(2)}`, desc: 'Reparo rápido com garantia' }
      ],
      features: ['Orçamento Sem Compromisso', 'Peças com Garantia de 1 Ano', 'Sala de Espera com Café e Wi-Fi', 'Guincho Parceiro'],
      lastUpdate: 'Agendamentos Disponíveis Hoje'
    };
  }

  // --- PADRÃO GERAL / OUTROS SERVIÇOS ---
  return {
    type: 'general',
    title: 'Informações do Estabelecimento',
    subtitle: 'Serviços e facilidades disponíveis',
    badge: '📋 Detalhes & Facilidades',
    items: [
      { name: 'Atendimento Balcão e Telefônico', price: 'Disponível', desc: 'Consulte promoções e estoque com nossos atendentes' },
      { name: 'Formas de Pagamento', price: 'PIX, Cartões e Dinheiro', desc: 'Aceitamos as principais bandeiras e PIX instantâneo' },
      { name: 'Avaliação da Comunidade', price: `${poi.evaluate.toFixed(1)} / 5.0 ⭐`, desc: 'Com base nas avaliações verificadas de clientes' }
    ],
    features: ['Atendimento Rápido', 'Acesso para Cadeirantes', 'Ambiente Confortável'],
    lastUpdate: 'Informações Verificadas'
  };
}
