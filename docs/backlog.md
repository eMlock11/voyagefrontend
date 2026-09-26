# Backlog do Projeto Voyage (Frontend)

Este arquivo é mantido por agentes de IA e desenvolvedores para registrar o estado de implementação de features, componentes e telas no frontend.

---

## 1. Módulo: User / Autenticação

### [IMPLEMENTADO] Tela de Cadastro / Criação de Perfil
- **Arquivos:** [`src/pages/User/Cadastro.jsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/User/Cadastro.jsx), [`src/pages/User/Cadastro.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/User/Cadastro.css)
- **Rota:** `/cadastro`
- **ID da Tela:** `#tela-cadastro`
- **Padrão visual e funcionalidade:**
  - Segue estritamente [`docs/User.md`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/docs/User.md) e a identidade visual do Voyage.
  - Seletor de tipo de conta: **Cliente** vs **Empresário** (`owner`).
  - Para tipo **Empresário (Owner / Companhia)**:
    - Exige obrigatoriamente: **CNPJ**, **Categoria da Empresa** e **Localização / Endereço**.
    - Cadastra o usuário no backend e insere automaticamente os dados da empresa via `companyService`.
  - Design com tema escuro (`#070a14`), bordas arredondadas e contraste otimizado.
  - Cabeçalho com título "Foto de Perfil".
  - Avatar circular com clique para selecionar foto local e preview em tela.
  - Campos com linha inferior: Nome Fantasia / Razão, E-mail corporativo, CNPJ, Categoria, Localização, Telefone, Senha.
  - Botão verde arredondado "Criar".
  - Link de navegação para a rota de login (`/login`).
- **Isolamento CSS:** Regras restritas ao container `#tela-cadastro`.

### [IMPLEMENTADO] Tela de Login
- **Arquivos:** [`src/pages/User/Login.jsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/User/Login.jsx), [`src/pages/User/Login.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/User/Login.css)
- **Rota:** `/login`
- **ID da Tela:** `#tela-login`
- **Padrão visual:**
  - Segue a identidade visual do Voyage e a consistência visual de `User.md`.
  - Logo Voyage em destaque com tipografia personalizada e subtítulo.
  - Campos borderless com linha inferior: E-mail, Senha.
  - Botão verde arredondado "Entrar".
  - Link de navegação para a rota de cadastro (`/cadastro`).
- **Isolamento CSS:** Regras restritas ao container `#tela-login`.

### [IMPLEMENTADO] Tela de Edição de Perfil
- **Arquivos:** [`src/pages/User/EditarPerfil.jsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/User/EditarPerfil.jsx), [`src/pages/User/EditarPerfil.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/User/EditarPerfil.css)
- **Rota:** `/editar-perfil` (e `/perfil/editar`)
- **ID da Tela:** `#tela-editar-perfil`
- **Padrão visual:**
  - Segue estritamente a especificação de `docs/User.md` (modo `edit`).
  - Cabeçalho com botão circular de retorno `(←)` e título "Editar Perfil".
  - Avatar circular com foto cadastrada e overlay de câmera para alterar imagem.
  - Campos preenchidos previamente com os dados do usuário.
  - Botão verde arredondado "Salvar".
- **Isolamento CSS:** Regras restritas ao container `#tela-editar-perfil`.

---

## 2. Módulo: Endereço e Mapa (Address & Map)

### [IMPLEMENTADO] Tela de Endereço e Mapa Interativo
- **Arquivos:** [`src/pages/AddressMap/AddressMap.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/AddressMap/AddressMap.tsx), [`src/pages/AddressMap/AddressMap.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/AddressMap/AddressMap.css)
- **Rota:** `/address` / `/map`
- **ID da Tela:** `#address-map-container`
- **Funcionalidades e Correções:**
  - Integração completa com `maplibre-gl`.
  - Busca de endereço, fixação de pontos e seleção manual de localização.
  - **Correção de CSS:** `@keyframes fadeIn` renomeado para `map-fade-in` para eliminar colisão global de animações.

---

## 3. Módulo: Pagamento e Assinatura (Payment / Voyage+)

### [IMPLEMENTADO] Telas de Pagamento e Assinatura (3 Planos, Cartões & PIX)
- **Arquivos:** [`src/pages/payment/Payment.jsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/payment/Payment.jsx), [`src/pages/payment/Payment.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/payment/Payment.css)
- **Rota:** `/payment`
- **ID da Tela:** `#payment-root`
- **Funcionalidades e Correções:**
  - **3 Planos de Assinatura:** Seleção interativa entre **Básico (Gratuito)**, **Intermediário (R$ 14,90/mês)** e **Plus (Voyage+ R$ 29,90/mês)** com badges, lista de recursos e cálculo dinâmico de botões.
  - **Métodos de pagamento:** Cartão de Crédito, Débito e PIX Instantâneo.
  - **Gestão & Cadastro de Cartões:** Máscara de digitação automática em tempo real para número (`0000 0000 0000 0000`), validade (`MM/AA`) e CVC. Detecção inteligente de bandeira com preview dinâmico no cartão virtual.
  - **PIX Fictício Interativo:** Geração de QR Code vetorial com ícone centralizado, chave Copia e Cola dinâmica com o plano escolhido, timer regressivo visual de 30 minutos e confirmação simulada.
  - **Correção de Vazamento CSS:** Removidas as regras sobre `body > #root` e `#root` da media query desktop (`@media (min-width: 768px)`), centralizando `#payment-root` de forma limpa e isolada sem contaminar as demais rotas da aplicação.

---

## 4. Módulo: Empresa / Parceiro (Company)

### [IMPLEMENTADO] Tela de Gestão da Empresa (`Company`)
- **Arquivos:** [`src/pages/Company/Company.jsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/Company/Company.jsx), [`src/pages/Company/Company.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/Company/Company.css)
- **Rota:** `/company`
- **ID da Tela:** `#company-page`
- **Funcionalidades e Correções:**
  - Navegação por abas (`kpis`, `profile`, `team`, `billing`, `security`).
  - Cabeçalho executivo com logotipo Voyage, badge de "Empresa Verificada", avaliação (`4.8/5 ★`) e botão integrado para abertura da nova Aba Lateral (Sidebar).
  - Painel de KPIs operacionais e visualizações.
  - Formulário de perfil corporativo (Razão social, nome fantasia, CNPJ, categoria, telefone, places, descrição).
  - Gestão de equipe com níveis de permissão.
  - Assinatura corporativa e histórico de faturas demonstrativo.
  - Auditoria de segurança e logs de acesso.
  - **Correção de Seletores Desktop:** Corrigidos os seletores de `@media (min-width: 768px)` para coincidir com os nomes reais do JSX (`.company-tabs-nav`, `.company-tab-content`, `.kpi-grid`, `.kpi-card`).
  - **Isolamento de Animação:** Renomeado `@keyframes fadeIn` para `company-fade-in`.
  - **Eliminação de Estilos Inline:** Substituído o `style={{ ... }}` do banner do proprietário pelas classes `.company-owner-banner`, `.company-owner-text` e `.company-owner-badge`.

---

## 5. Módulo: Navegação Global e Aba Lateral (Sidebar)

### [IMPLEMENTADO] Componente de Aba Lateral (Sidebar)
- **Arquivos:** [`src/components/Sidebar/Sidebar.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Sidebar/Sidebar.tsx), [`src/components/Sidebar/Sidebar.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Sidebar/Sidebar.css)
- **Base Visual:** Fiel à referência `Captura de tela 2026-09-11 201449.png`.
- **Linguagem:** TypeScript (`.tsx`) com CSS puro.
- **Estrutura e Recursos:**
  - **Header:** Logotipo institucional Voyage estilizado.
  - **Card de Perfil/Empresa:** Avatar circular (foto ou silhueta), nome ("Pará Lanches" ou dinâmico da empresa/usuário), categoria ("Lanchonete") e badge "Verificado" com ícone de verificação.
  - **Menu de Navegação com Ícones Vetoriais:**
    - Resumo (`/company` / aba KPIs)
    - Catálogo/Produtos
    - Ofertas e Promoções
    - Avaliações
    - Desempenho
    - Mensagens
    - Editar Perfil (`/editar-perfil`)
    - Assinatura (`/payment`)
    - Mapa & Endereços (`/address`)
  - **Footer:** Botão de voltar `(↩)` e botão roxo estilizado "Sair" com logout da sessão (`userService.logout()`) e redirecionamento.
  - **Comportamento Interativo:** Gaveta deslizante suave com backdrop translúcido blur (`backdrop-filter`).

---

## 6. Configuração Base, Design Tokens e Rotas

- **Arquivos:** [`src/globals.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/globals.css), [`src/App.jsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/App.jsx), [`src/main.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/main.tsx)
- **Design Tokens Globais:** Adicionado o bloco `:root` em `globals.css` com todas as variáveis semânticas de cores (`--voyage-bg-main`, `--voyage-accent-primary`, `--voyage-accent-secondary`), espaçamentos, raios e sombras.
- **Roteamento:** `react-router-dom` com proteção de rotas via `ProtectedRoute`.

---

## 7. Módulo: Configurações do Sistema e Aplicativo

### [IMPLEMENTADO] Tela e Modal Dedicada de Configurações
- **Arquivos:** [`src/pages/Configuracoes/Configuracoes.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/Configuracoes/Configuracoes.tsx), [`src/pages/Configuracoes/Configuracoes.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/Configuracoes/Configuracoes.css)
- **Rota:** `/configuracoes`
- **Funcionalidades e Recursos:**
  - Navegação por abas:
    1. **Conta & Perfil:** Visualização de dados do usuário autenticado, badge de perfil e links de edição.
    2. **Preferências & Mapa:** Escolha de tema (escuro/claro/sistema), raio de busca padrão no mapa (2km a 25km), GPS automático, notificações do app com persistência no `localStorage`.
    3. **Segurança & Senha:** Formulário para atualização de senha com validações, gerenciador de sessões ativas e botão de desconexão.
    4. **Dados da Empresa (para `owner` e `admin`):** Visibilidade no mapa/catálogo e atalhos diretos para o painel corporativo e faturamento/planos.
  - **Integração de Acesso:** Botão de engrenagem (`<Settings />`) em `Company.jsx`, `UserDashboard.jsx` e `AdminDashboard.jsx`, além do novo item de menu na `Sidebar.tsx`.

---

## 8. Módulo: Design System & shadcn/ui (Dark / Light Mode)

### [IMPLEMENTADO] Sistema de Tema shadcn/ui (Dark / Light / System)
- **Arquivos:**
  - [`tailwind.config.js`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/tailwind.config.js), [`postcss.config.js`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/postcss.config.js)
  - [`src/lib/utils.ts`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/lib/utils.ts) (utilitário `cn` com `clsx` e `tailwind-merge`)
  - [`src/components/ThemeProvider.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/ThemeProvider.tsx)
  - [`src/components/ThemeToggle.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/ThemeToggle.tsx)
  - [`src/globals.css`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/globals.css)
- **Funcionalidades e Recursos:**
  - Suporte completo ao padrão oficial do **shadcn/ui** com Tailwind CSS v3 e diretivas `@tailwind`.
  - Design tokens semânticos HSL no `:root` (Light Mode) e na classe `.dark` (Dark Mode), sincronizados com as variáveis do Voyage.
  - Contexto `ThemeProvider` com persistência em `localStorage` (`voyage-theme`) e detecção automática de preferência do sistema operacional (`prefers-color-scheme`).
  - Componente `ThemeToggle` inserido nos cabeçalhos (`Company`, `UserDashboard`, `AdminDashboard`), na barra lateral (`Sidebar`) e integrado ao seletor de tema em [`/configuracoes`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/Configuracoes/Configuracoes.tsx).
  - **Tratamento de Contraste e Legibilidade (Light Mode):** Regras de adaptação em `globals.css` garantindo que títulos, textos secundários, inputs, formulários, selects, cards e botões tenham contraste nítido (`#0f172a` e `#334155`), bordas visíveis e backgrounds brancos adequados sobre superfícies claras, eliminando textos apagados.
  - **Modo de Teste de Assinatura:** Contas recém-criadas iniciam sem plano ativo (`plan: 'Nenhum'`), e a tela [`/payment`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/Payment/Payment.jsx) exibe banner informativo com simulação de contratação (Cartão de Crédito/Débito e PIX) habilitada para testes imediatos.

---

## 9. Plano de Correção e Auditoria (Baseado em `analise_voyage.md`)

### [CONCLUÍDO] Etapa 1 — Dados e Sessão (25/09/2026)
- **F01 (Remoção de senha do storage e sanear sessão):**
  - Implementada função canônica `sanitizeUser` em `userService.js`.
  - Em `EditarPerfilClient.jsx` e `EditarPerfilOwner.jsx`: o payload `password` nunca mais é mesclado no objeto persistido em `localStorage`.
  - `getCurrentUser()` higieniza retroativamente registros legados no navegador caso contenham o campo `password`.
  - `userService.login` e `register` garantem que credenciais nunca sejam persistidas no estado do usuário.
- **F02 (XSS em nomes externos no Mapa):**
  - `AddressMap.tsx`: removido `el.innerHTML` na geração de marcadores de POIs (OSM/Nominatim).
  - Marcadores agora usam elementos DOM criados programaticamente com nós seguros e `titleEl.textContent` para renderização literal de nomes externos.
- **F03 & F08 (Persistência confirmada de perfil/senha e fluxo de 401 centralizado):**
  - Removido o tratamento que silenciava falhas da API com `console.warn` em `EditarPerfilClient.jsx` e `EditarPerfilOwner.jsx`. Sucesso só é exibido após resolução positiva da API; falhas propagam para a interface sem modificar a sessão local.
  - `Configuracoes.tsx`: formulário de atualização de senha agora dispara requisição assíncrona autenticada e só anuncia sucesso após confirmação do servidor; botão com estado de carregamento e desativação.
  - `api.js`: resposta 401 agora dispara `clearSession()` de forma centralizada (removendo `token`, `user`, `user_company`, `user_profile_data`), redireciona para `/login` e lança erro tipado `(status: 401)`, interrompendo a cadeia de execução. Normalizador de erro expandido (`erro`, `erroPrincipal`, `solucoesDetalhadas`, `detalhes`).
  - Bearer token restrito aos endpoints da API do Voyage, prevenindo vazamento de cabeçalho para provedores externos de mapas.
- **F06 (Vínculo de Empresa estritamente por ID):**
  - `Company.jsx` e `EditarPerfilOwner.jsx`: eliminada a inferência de propriedade por correspondência de strings de nome de usuário/empresa. A vinculação agora exige estritamente correspondência de `userId` ou `companyId`.

### [CONCLUÍDO] Etapa 2 — Contratos e Demonstrações (25/09/2026)
- **Remoção de notas inventadas dos payloads reais:**
  - `Cadastro.jsx`: removido `evaluate: 4.8` do payload de criação de empresa.
  - `Company.jsx`: removido `evaluate: 4.8` dos payloads de criação e atualização da empresa.
  - `Company.jsx`: avaliação exibida no Hero agora reflete dados reais (`formData.evaluate`) ou indica "Novo no Voyage" / "Sem avaliações", sem forçar 4.8 fixo.
- **Cadastro de empresa retomável (`pending_company_registration`):**
  - `Cadastro.jsx`: se a conta for criada com sucesso mas a conexão com o serviço de estabelecimentos oscilar, os dados da empresa são persistidos como rascunho seguro vinculado ao `userId`.
  - `Company.jsx`: detecta automaticamente a pendência, pré-preenche o formulário para o usuário apenas revisar/confirmar e limpa o rascunho com sucesso ao salvar no servidor.
- **Isolamento de Demonstração e Transparência:**
  - `Payment.jsx`: assinatura de teste explicitamente identificada como `isDemoSubscription: true` e `planStatus: 'demo_active'`.
  - `Company.jsx`: abas de Faturamento (`billing`) e Equipe (`team`) receberam avisos visuais informando o caráter demonstrativo e ilustrativo das faturas, sem cobranças automáticas.
- **Preservação de Zero Real e Tratamento de Erros no Admin:**
  - `AdminDashboard.jsx`: corrigida a expressão `companies.length || '18'` para `(error ? '—' : companies.length)`; zero empresas cadastradas permanece estritamente 0 e não se transforma em 18.
  - Captura e exibição de erro real de sincronização com a API na tabela de estabelecimentos.
  - Badges de `(Estimado)`, `(Mock SLA)` e `(Local)` adicionados aos cards não medidos pelo backend para honestidade com o usuário.
- **Qualidade de Código e Linting:**
  - `ProtectedRoute.jsx`: adicionado `PropTypes` com tipagem para `allowedRoles`, zerando erros do ESLint.
  - `AdminDashboard.jsx`: removido import `Clock` não utilizado.
  - `Payment.jsx`: removidos imports não utilizados (`ShieldCheck`, `Lock`, `CheckCircle2`) e variável `isPopular`.
  - `Company.jsx`: resolvido warning de dependência no hook `useEffect`.
  - `npx eslint src`: **0 erros, 0 avisos**.

### [CONCLUÍDO] Etapa 3 — Mapa e Preferências (25/09/2026)
- **Ciclo de Vida do Mapa e Desacoplamento de Instância (F10):**
  - `AddressMap.tsx`: Instanciação do MapLibre em `useEffect` desacoplada da alteração de raio. Mudanças no raio (`radiusKm`) e centro (`centerPos`) agora atualizam diretamente a fonte GeoJSON (`radius-circle-source`) sem recriar ou destruir a instância do mapa.
  - Carregamento inicial de POIs disparado explicitamente no evento `map.on('load')`.
  - Listeners de eventos (`click`, `moveend`) protegidos contra closures desatualizados com `useRef` sincronizados a cada render (`isSettingManualLocationRef`, `radiusKmRef`, `selectedCategoryRef`, etc.).
  - Controle de concorrência com `requestSeqRef` para evitar race conditions em requisições assíncronas concorrentes.
  - Restaurado o controle de atribuição visível (`attributionControl: { compact: true }`) do OpenStreetMap / OpenFreeMap.
- **Desambiguação e Prioridade de Categorias (F11):**
  - `mapService.js`: Reordenadas as categorias prioritárias (`pizzaria` antes de `restaurante`, `supermercado` antes de `mercado`).
  - Desambiguação de tags: `supermercado` vinculado a `shop=supermarket` e `building=supermarket`; `mercado` vinculado a `shop=grocery`, `shop=general` e `shop=farm`.
  - `getCategoryFromOSMTags`: adicionado suporte a `preferredCategory`, garantindo que quando o usuário filtra por uma categoria específica, ela tem precedência sobre categorias genéricas.
  - IDs compostos (`osm_${el.type}_${el.id}`) implementados para eliminar colisões entre nodes e ways de mesma numeração no OSM.
- **Alinhamento de Raio e Tratamento de Erros de Provedor (F12):**
  - `mapService.js`: Removido o corte artificial em 10.000m na query Overpass (`radiusMeters = Math.min(radiusKm * 1000, 25000)`), alinhando o raio consultado com o círculo desenhado e as opções da interface até 25 km.
  - Cache de POIs enriquecido com área de bounds completa (`south,west,north,east`) e TTL de 5 minutos (300.000 ms).
  - Distinção real entre área vazia e indisponibilidade: lançamento de erro estruturado (`OverpassUnavailableError`) e banner visual com botão "Tentar Novamente", sem exibir falso "sem locais".
- **Integração com Preferências Globais:**
  - `AddressMap.tsx` agora inicializa o raio a partir de `voyage_search_radius` salvo em [`/configuracoes`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/pages/Configuracoes/Configuracoes.tsx).
  - Respeita `voyage_auto_gps`: aciona geolocalização do navegador automaticamente sem travar a interface se o usuário optou por GPS automático.

### [CONCLUÍDO] Etapa 4 — Qualidade e Experiência (25/09/2026)
- **Eliminação de Colisões de Keyframes Globais:**
  - `AddressMap.css`: renomeado `@keyframes pulse` para `@keyframes map-pulse`.
  - `Payment.css`: renomeado `@keyframes pulse` para `@keyframes payment-pulse`, e atualizada a classe `.pix-pulse-dot` para `animation: payment-pulse 1.5s infinite;`.
  - Prevenção garantida contra efeitos colaterais visuais entre rotas de pagamento, mapas e painel.
- **Acessibilidade e Navegação por Teclado na Sidebar:**
  - `Sidebar.tsx`: adicionado listener de evento de teclado para a tecla `Escape`, fechando a gaveta lateral imediatamente.
  - Atributos ARIA aplicados: `aria-hidden={!isOpen}`, `role="dialog"` e `aria-modal={isOpen ? 'true' : undefined}`, garantindo que leitores de tela não processem nós ocultos quando a barra estiver recolhida.
- **Sincronização Dinâmica de Tema do Sistema (`matchMedia`):**
  - `ThemeProvider.tsx`: implementado listener dinâmico de evento `change` na media query `(prefers-color-scheme: dark)` quando o tema selecionado for `'system'`.
  - O tema agora reage instantaneamente a mudanças nas preferências do sistema operacional em tempo real sem exigir recarregamento da página.
- **Acessibilidade nos Modais do Mapa:**
  - `AddressMap.tsx`: listener global para tecla `Escape` fechando modal de categorias, drawer de detalhes de POI, menu de raio e prompt de localização.
  - Modal de Categorias: `role="dialog"`, `aria-modal="true"` e `aria-labelledby="category-modal-title"`.
  - Prompt de Localização: `role="dialog"`, `aria-modal="true"` e `aria-labelledby="location-prompt-title"`.
  - Card de Detalhes de POI: `role="region"` e `aria-label` dinâmico com o nome do estabelecimento.
- **Auditoria de Código e Linter:**
  - Zeradas todas as pendências de lint em `ProtectedRoute.jsx`, `AdminDashboard.jsx`, `Payment.jsx` e `Company.jsx`.
  - `npx eslint src`: **0 erros, 0 avisos**.
  - `npx tsc --noEmit`: **0 erros**.
  - Suíte completa de 46 testes sintéticos cobrindo as Etapas 1, 2, 3 e 4 com 100% de sucesso.

---

## 10. Módulo: Painel do Comerciante / Estabelecimento (`MerchantPanel`)

### [IMPLEMENTADO] Fase 1 — Fundação & Core Operacional (25/09/2026)
- **Tipagem Canônica (`src/types/merchant.ts`):**
  - Interfaces TypeScript estritas para `EstablishmentProfile`, `WeeklyBusinessHours`, `DaySchedule`, `TimeShift`, `PaymentMethodsConfig`, `EstablishmentAmenities` e `MediaItem`.
- **Camada de Serviço & Adapter (`src/services/merchantService.ts`):**
  - Gerenciamento de dados estendidos vinculado por `companyId`/`userId`.
  - Sincronização automática com a API nativa do Voyage (`companyService.updateCompany`), mantendo campos canônicos (`name`, `category`, `places`, `phone`) atualizados no banco sem quebrar contratos da API remota.
  - Função pura `isEstablishmentOpen(hours)` que calcula em tempo real o status operacional (🟢 Aberto agora / 🔴 Fechado no momento / Próxima abertura) baseado nos turnos e no fuso horário do usuário.
- **Componentes Modulares em TypeScript (`src/components/Merchant/`):**
  1. [`MerchantPanel.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/MerchantPanel.tsx): Orquestrador principal com barra de ações superior, botão de salvar com feedback em tempo real, navegação por abas horizontais no desktop e dropdown responsivo no mobile.
  2. [`MerchantOverview.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/MerchantOverview.tsx): Dashboard de resumo com badge de status ao vivo, cálculo automático de completude do perfil (0 a 100%), grid de 6 KPIs de engajamento (visualizações, rotas, WhatsApp, ligações, site e fotos) e gráfico de origem dos clientes (Busca no mapa, GPS, categorias, link direto).
  3. [`BusinessInfoForm.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/BusinessInfoForm.tsx): Formulário setorizado em 4 sub-abas (Dados Gerais, Endereço completo, Canais de Contato e Comodidades como Delivery, Wi-Fi, Estacionamento, Acessibilidade PNE e Pet Friendly), com upload de logotipo e capa via FileReader com preview imediato.
  4. [`BusinessHoursEditor.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/BusinessHoursEditor.tsx): Editor para os 7 dias da semana, suporte a múltiplos turnos/intervalos (ex: almoço e jantar), alternador "Fechado", botão de cópia rápida para dias úteis (Seg-Sex) e banner de status ao vivo sincronizado.
  5. [`PaymentMethodsEditor.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/PaymentMethodsEditor.tsx): Seletor visual de modalidades aceitas (Dinheiro, Pix, Débito, Crédito, Vale Refeição e Alimentação) e seleção de bandeiras aceitas (Visa, Mastercard, Elo, Hipercard, Amex, Alelo, Sodexo/Pluxee, Ticket, VR).
  6. [`MediaGalleryEditor.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/MediaGalleryEditor.tsx): Galeria de fotos categorizadas (Ambiente interno, Fachada, Produtos/Pratos, Serviços), suporte a upload múltiplo e marcação de foto principal.
  7. [`CatalogPlaceholder.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/CatalogPlaceholder.tsx): Estrutura modular legada substituída pelo `DynamicCatalogManager`.
- **Integração na Rota `/company` (`src/pages/Company/Company.jsx`):**
  - Painel do Comerciante integrado como aba primária e hero action, mantendo total retrocompatibilidade com as abas existentes de métricas, equipe, faturamento e segurança.

### [IMPLEMENTADO] Fase 2 — Catálogo Modular e Especializado por Segmento (25/09/2026)
- **Tipagens Estritas de Catálogo (`src/types/catalog.ts`):**
  - Modelos de dados para Restaurante (`RestaurantCatalog`, `MenuItem`, `MenuCategory`, `DiningOptions`).
  - Modelos de dados para Pizzaria (`PizzaCatalog`, `PizzaSize`, `PizzaCrust`, `PizzaFlavor`, `MenuItemAddon`).
  - Modelos de dados para Supermercado & Varejo (`SupermarketCatalog`, `SupermarketProduct`, `WeeklyOffer`, `DigitalFlyer`, `ProductUnit`).
  - Agregador unificado `MerchantCatalogData` e tipo discriminado `CatalogVertical`.
- **Módulos Especializados em TypeScript (`src/components/Merchant/Catalog/`):**
  1. [`RestaurantMenuManager.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/Catalog/RestaurantMenuManager.tsx):
     - Modalidades de atendimento (À la carte, Prato Feito, Buffet Livre, Buffet por KG, Self-Service, Delivery, Retirada, Consumo no Local).
     - Gestão de categorias com ordenação dinâmica e exclusão em lote de dependências.
     - Cadastro de pratos com foto, ingredientes em badges, adicionais com acréscimo de valor, preço regular, preço promocional e botão instantâneo de pausar/esgotar prato.
  2. [`PizzaManager.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/Catalog/PizzaManager.tsx):
     - Gestão de tamanhos com definição de fatias, preço base e quantidade máxima de sabores fracionados (ex: meia a meia, até 4 sabores).
     - Gestão de bordas recheadas (Catupiry, Cheddar, Chocolate, Vulcão) com acréscimo configurável de preço.
     - Sabores categorizados (Tradicional, Especial, Premium, Doce) com busca rápida, filtro por tipo, ingredientes e fotos.
     - Gestão de adicionais e coberturas extras.
  3. [`SupermarketCatalogManager.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/Catalog/SupermarketCatalogManager.tsx):
     - Gestão de departamentos (Hortifrúti, Açougue, Laticínios, Padaria, Bebidas, Limpeza).
     - Cadastro de produtos com marca, descrição, unidades de medida (`un`, `kg`, `g`, `l`, `ml`, `pacote`, `bandeja`), preço regular e promocional.
     - Módulo de Ofertas da Semana com cálculo automático do `% OFF`, período de validade (início e término) e teto de unidades por cliente.
     - Gestão de Encartes & Folhetos digitais para consulta interativa dos clientes.
  4. [`DynamicCatalogManager.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/Catalog/DynamicCatalogManager.tsx):
     - Orquestrador inteligente que detecta automaticamente a categoria da empresa (restaurante, pizzaria, mercado) ou permite alternância manual da vertical com um clique.
     - Integração direta no [`MerchantPanel.tsx`](file:///c:/Users/kevin.cdorinho/Desktop/PRJ_FrontEnd/voyagefrontend/src/components/Merchant/MerchantPanel.tsx) na aba "Catálogo & Cardápio", sincronizado com o `merchantService.ts`.
- **Validação e Qualidade:**
  - `npx tsc --noEmit`: 0 erros de compilação TypeScript em todo o frontend.
  - `npm run build`: Vite bundle compilado e validado com sucesso (código de saída 0).
  - Suíte de 14 testes sintéticos da Etapa 1 re-executada com 100% de sucesso.


