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



