# Módulo: Empresa (Company) & Painel do Comerciante (Merchant)

> **Controle de Acesso:** Exclusivo para **Proprietários / Donos da Empresa** (`ROLE_OWNER` / `ADMIN`).

---

## 1. Visão Geral
Área de gerenciamento e administração do estabelecimento comercial no ecossistema Voyage.
Permite configurar informações cadastrais corporativas, gerenciar planos/assinatura e operar o Painel do Comerciante com horários de funcionamento, cardápio/catálogo dinâmico, formas de pagamento e galeria de mídia.

---

## 2. Matriz de Integração: API Real vs. Rascunho Local

Para manter a integridade operacional e não mascarar falhas da API com falsos sucessos, o frontend separa explicitamente os dados com persistência no servidor daqueles mantidos em rascunho local no navegador:

| Seção / Recurso | Estado no Frontend | Tipo de Persistência | Endpoint do Backend | Status do Contrato |
| :--- | :--- | :--- | :--- | :--- |
| **Cadastro Básico** (Nome, Categoria, CNPJ, Places) | Implementado & Verificado | **Remota (API)** | `PUT /company/:id`, `POST /company` | Integrado e em produção |
| **Horários de Funcionamento** (Turnos, 24h, Virada meia-noite) | Implementado & Verificado | **Rascunho Local** | *Pendente no Backend* | Salvo no localStorage por empresa e usuário |
| **Horários Especiais** (Feriados, datas sazonais) | Implementado & Verificado | **Rascunho Local** | *Pendente no Backend* | Salvo no localStorage com precedência sobre semanal |
| **Formas de Pagamento** (Dinheiro, Pix, Cartões, Vales) | Implementado & Verificado | **Rascunho Local** | *Pendente no Backend* | Salvo no localStorage por empresa |
| **Galeria de Fotos** (Fachada, logo, produtos) | Implementado & Verificado | **Rascunho Local** | *Pendente no Backend* | Blobs em IndexedDB + metadados no localStorage |
| **Catálogo Dinâmico** (Restaurante, Pizzaria, Supermercado) | Implementado & Verificado | **Rascunho Local** | *Pendente no Backend* | Salvo no localStorage por empresa |
| **Telemetria de Acesso / Analytics** (Views, rotas, cliques) | Interface Ilustrativa | **Aguardando Backend** | *Pendente no Backend* | Marcado como "Dados ainda indisponíveis" |
| **Gráficos Avançados de Desempenho** | Interface Ilustrativa | **Aguardando Backend** | *Pendente no Backend* | Marcado explicitamente como "Amostragem Demonstrativa" |

---

## 3. Comportamento e Regras Implementadas

### 3.1. Carregamento e Identificação da Empresa
- **Adaptador Tipado:** [`src/services/merchantService.ts`](file:///c:/Users/Zeusr/Desktop/gitFRONT_END/voyagefrontend/src/services/merchantService.ts) realiza a tradução entre o modelo da API (`name`, `category`, `cnpj`, `places`, `phone`) e o `EstablishmentProfile`.
- **Eliminação de IDs Fictícios:** Bloqueado qualquer envio de `'company-default'`. Quando não há empresa cadastrada, a interface apresenta mensagem orientativa com direcionamento ao cadastro básico.
- **Separação de Estados:** `loading`, `loadError` (falha de rede/API com botão de retry) e `!companyId` (ausência de cadastro) são tratados individualmente.
- **Isolamento de Rascunhos:** Chave única estruturada por usuário e empresa (`voyage_merchant_draft_${userId}_${companyId}`) impede compartilhamento acidental de rascunhos entre contas.

### 3.2. Salvamento e Transparência
- **Ordem de Operações:** O envio à API remota ocorre **antes** de qualquer persistência local. Falhas na API interrompem o fluxo e são propagadas em vermelho na UI, preservando integralmente o formulário para nova tentativa.
- **Feedback Transparente:** O alerta pós-salvamento detalha textualmente quais campos foram sincronizados no servidor (`name`, `category`, `places`) e quais permaneceram em rascunho local neste navegador.
- **Prevenção de Perda:** Indicador de alterações pendentes e hook `beforeunload` alertam o lojista caso tente fechar ou navegar sem salvar.

### 3.3. Remoção de Dados Fictícios do Fluxo Normal
- Cadastros novos são inicializados limpos: sem pizzas sintéticas, produtos de supermercado inventados, avaliações 4.8 fixas ou suposições de delivery/acessibilidade ativadas.
- O botão **"Carregar Exemplo"** está disponível em modo opt-in explícito para quem deseja visualizar uma demonstração.
- Selo de "Verificada" só é exibido mediante validação booleana real (`isVerified: true`).

### 3.4. Motor de Horários e Fuso Horário
- Motor puro com fuso horário padrão `America/Sao_Paulo`.
- Suporte a turnos noturnos que atravessam a meia-noite (avaliando inclusive o turno do dia anterior).
- Precedência de horários especiais em datas comemorativas e feriados.
- Instante exato de término é considerado fechado (`tempo < close`).
- Timer periódico de 30 segundos reavalia o status com a passagem do tempo.

### 3.5. Fotos e Armazenamento Otimizado
- Processamento assíncrono via `Promise.all`, eliminando race condition na seleção múltipla.
- Validação estrita de limites: máximo de 15 imagens, limite de 2MB por arquivo, formatos JPG/PNG/WEBP/GIF.
- Uso de **IndexedDB** (`src/utils/mediaStorage.ts`) para blobs de imagens, evitando estouro de cota (5MB) do `localStorage`.

---

## 4. Pendências de Backend
1. **Endpoint de Horários:** `PUT /company/:id/hours` para persistência dos turnos semanais e feriados.
2. **Endpoint de Catálogo:** `PUT /company/:id/catalog` para recebimento da árvore modular de produtos.
3. **Endpoint de Mídia:** `POST /company/:id/media` com suporte a multipart/form-data ou upload assinado (S3/Cloud Storage).
4. **Endpoint de Formas de Pagamento:** `PUT /company/:id/payments`.
5. **Telemetria de Métricas:** `GET /company/:id/metrics` para fornecer views, cliques de rotas e contatos reais.
