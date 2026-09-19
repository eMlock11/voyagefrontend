# Backlog do Projeto Voyage (Frontend)

Este arquivo é mantido por agentes de IA e desenvolvedores para registrar o estado de implementação de features e telas no frontend.

---

## 1. Módulo: User / Autenticação (Etapa 1: Front-end e Design)

### [IMPLEMENTADO] Tela de Cadastro / Criação de Perfil
- **Arquivos:** `src/Cadastro.jsx`, `src/Cadastro.css`
- **Rota:** `/cadastro`
- **ID da Tela:** `#tela-cadastro`
- **Padrão visual e funcionalidade:**
  - Segue estritamente `docs/User.md` e a identidade visual do Voyage.
  - Seletor de tipo de conta: **Cliente** vs **Empresário** (`owner`).
  - Para tipo **Empresário (Owner / Companhia)**:
    - Exige obrigatoriamente: **CNPJ**, **Categoria da Empresa** e **Localização / Endereço**.
    - Cadastra o usuário no backend e insere automaticamente os dados da empresa via `companyService`.
  - Design monobloco com tema escuro (`#070a14`), borda estilo dispositivo mobile.
  - Cabeçalho com título "Foto de Perfil".
  - Avatar circular com clique para selecionar foto local e preview em tela.
  - Campos com linha inferior: Nome Fantasia / Razão, E-mail corporativo, CNPJ, Categoria, Localização, Telefone, Senha.
  - Botão verde arredondado "Criar".
  - Link de navegação para a rota de login (`/login`).
- **Isolamento CSS:** Todas as regras no CSS estão restritas ao seletor `#tela-cadastro`.

### [IMPLEMENTADO] Tela de Login
- **Arquivos:** `src/Login.jsx`, `src/Login.css`
- **Rota:** `/login`
- **ID da Tela:** `#tela-login`
- **Padrão visual:**
  - Segue a identidade visual do Voyage e a consistência visual de `User.md`.
  - Logo Voyage em destaque com tipografia personalizada e subtítulo.
  - Campos borderless com linha inferior: E-mail, Senha.
  - Botão verde arredondado "Entrar".
  - Link de navegação para a rota de cadastro (`/cadastro`).
- **Isolamento CSS:** Todas as regras no CSS estão restritas ao seletor `#tela-login`.

### [IMPLEMENTADO] Tela de Edição de Perfil
- **Arquivos:** `src/EditarPerfil.jsx`, `src/EditarPerfil.css`
- **Rota:** `/editar-perfil` (e `/perfil/editar`)
- **ID da Tela:** `#tela-editar-perfil`
- **Padrão visual:**
  - Segue estritamente a especificação de `docs/User.md` (modo `edit`).
  - Cabeçalho com botão circular de retorno `(←)` e título "Editar Perfil".
  - Avatar circular com foto cadastrada e overlay de câmera para alterar imagem.
  - Campos preenchidos previamente com os dados do usuário.
  - Botão verde arredondado "Salvar".
- **Isolamento CSS:** Todas as regras no CSS estão restritas ao seletor `#tela-editar-perfil`.

---

## 2. Módulo: Endereço e Mapa (Address & Map)

### [IMPLEMENTADO] Tela de Endereço e Mapa Interativo
- **Arquivos:** `src/pages/AddressMap/AddressMap.tsx`, `src/pages/AddressMap/AddressMap.css`
- **Rota:** `/address` / `/map`
- **ID da Tela:** `#address-map-container`
- **Funcionalidades:**
  - Integração com `maplibre-gl`.
  - Busca de endereço, fixação de pontos e seleção manual de localização.

---

## 3. Módulo: Pagamento e Assinatura (Payment / Voyage+)

### [IMPLEMENTADO] Telas de Pagamento e Assinatura (3 Planos, Cartões & PIX)
- **Arquivos:** `src/pages/payment/Payment.jsx`, `src/pages/payment/Payment.css`
- **Rota:** `/payment`
- **ID da Tela:** `#payment-root`
- **Funcionalidades:**
  - **3 Planos de Assinatura:** Seleção interativa entre **Básico (Gratuito)**, **Intermediário (R$ 14,90/mês)** e **Plus (Voyage+ R$ 29,90/mês)** com badges, lista de recursos e cálculo dinâmico de botões.
  - **Métodos de pagamento:** Cartão de Crédito, Débito e PIX Instantâneo.
  - **Gestão & Cadastro de Cartões:** Máscara de digitação automática em tempo real para número (`0000 0000 0000 0000`), validade (`MM/AA`) e CVC. Detecção inteligente de bandeira (Visa, Mastercard, Elo, Amex) com preview dinâmico no cartão virtual e persistência na lista de cartões salvos.
  - **PIX Fictício Interativo:** Geração de QR Code vetorial de alta definição com ícone centralizado, chave Copia e Cola dinâmica com o plano escolhido, timer regressivo visual de 30 minutos e confirmação simulada.

---

## 4. Módulo: Empresa / Parceiro (Company)

### [IMPLEMENTADO] Tela de Gestão da Empresa (`Company`)
- **Arquivos:** `src/pages/Company.jsx`, `src/pages/Company.css`
- **Rota:** `/company`
- **ID da Tela:** `#company-page`
- **Funcionalidades:**
  - Componente monobloco com navegação por abas (`kpis`, `profile`, `team`, `billing`, `security`).
  - Cabeçalho executivo com logotipo Voyage, badge de "Empresa Verificada", avaliação (`4.8/5 ★`).
  - Painel de KPIs operacionais e visualizações.
  - Formulário de perfil corporativo (Razão social, nome fantasia, CNPJ, categoria, telefone, places, descrição).
  - Gestão de equipe com níveis de permissão.
  - Assinatura & Planos corporativos e histórico de faturas.
  - Auditoria de segurança e logs de acesso.

---

## 5. Configuração Base, Rotas e Estilos Globais
- **Arquivos:** `src/globals.css`, `src/App.jsx`, `src/main.tsx`
- **Roteamento:** `react-router-dom` centralizando todas as telas implementadas (`/login`, `/cadastro`, `/editar-perfil`, `/company`, `/payment`, `/address`).
