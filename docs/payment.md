# Contexto das Telas — Pagamentos e Assinatura

Este documento descreve a estrutura visual, componentes, estados e regras funcionais para o fluxo de **Pagamentos e Assinatura (Voyage+)**, baseado nos layouts de tela fornecidos nos prints.

---

## 1. Identidade Visual & Design System

- **Fundo**: Dark Mode em azul-marinho muito escuro / tom violeta.
- **Tipografia**: Texto sans-serif branco de alto contraste. Labels pequenos acima das linhas dos campos.
- **Campos de Entrada (Inputs)**:
  - Estilo minimalista sem caixa (borderless), com linha horizontal inferior delimitar a área do campo.
  - Labels explicativos acima da linha de digitação.
- **Botões Primários**: Botão verde com cantos arredondados, texto branco centralizado em destaque (bold) para confirmações.
- **Botões Secundários & Seleções**: Botões roxos/lilás arredondados para seleção de plano, opções de pagamento e adição de cartões.
- **Cards e Containers**: Containers retangulares com cantos arredondados em cinza escuro para cartões salvos e áreas de destaque.

---

## 2. Descrição das Telas

### A. Tela de Menu Lateral / Atalho de Assinatura
- **Cabeçalho do Usuário**: Exibe a foto/avatar do usuário, nome e e-mail cadastrados.
- **Lista de Navegação**:
  - Resumo
  - Ofertas e Promoções
  - Avaliações
  - Editar Perfil
  - Agendamentos
  - **Assinatura** *(item destacado com fundo roxo arredondado indicando a tela selecionada)*
  - Acessibilidade
- **Rodapé**: Botão `"Sair"` com ícone de retorno.

### B. Tela de Assinatura (`Voyage+`)
- **Cabeçalho**: Logo Voyage acompanhada do ícone `"Voyage+"`. Título centralizado `"Assinatura"`.
- **Card Comparativo**:
  - Painel roxo dividido exibindo os benefícios do plano:
    - **Sem Cupons / Com Anúncios / Personalizações Limitadas** (Gratuito).
    - **Cupons Exclusivos / Sem Anúncios / Personalizações Exclusivas** (Voyage+).
- **Ação Principal**: Botão verde com o valor da assinatura (`"Assinar R$ 19,90"`).

### C. Tela de Seleção da Forma de Pagamento
- **Cabeçalho**: Logo Voyage centralizada no topo. Título `"Formas de Pagamento"`.
- **Opções de Pagamento** (Botões roxos selecionáveis):
  - **Crédito**: Ícone de cartão de crédito + texto `"Crédito"`.
  - **Débito**: Ícone de cartão de débito + texto `"Débito"`.
  - **PIX**: Ícone do PIX + texto `"PIX"`.
- **Ação Principal**: Botão verde com texto `"Continuar"`.

### D. Tela de Cartões Salvos
- **Cabeçalho**: Logo Voyage no topo. Título `"Cartões Salvos"`.
- **Lista de Cartões**:
  - Exibe os cartões cadastrados em containers cinza escuro com o ícone da bandeira (ex: Visa, Mastercard) e número mascarado (`**** **** **** ....`).
- **Ação Secundária**: Botão roxo `"+ Adicionar Cartão"` para cadastrar um novo meio de pagamento.

### E. Tela de Formulário de Cartão (Crédito/Débito)
- **Cabeçalho**: Logo Voyage no topo. Título `"Cartões Crédito/Débito"`.
- **Visualização**: Ilustração de um cartão virtual azul/ciano centralizado no topo.
- **Formulário**:
  - **Card Number**: Linha para inserção do número do cartão.
  - **CVC**: Campo para o código de segurança.
  - **Expires Card**: Campo para a data de validade (`MM/AA`).
  - **Nome no Cartão**: Campo para o nome do titular.
- **Ação Principal**: Botão verde com texto `"Continuar"`.

### F. Tela de Checkout PIX & Confirmação
- **Cabeçalho**: Logo Voyage no topo. Título `"PIX"` e mensagem `"Pedido Recebido!"`.
- **QR Code**: Imagem do QR Code centralizada para escaneamento.
- **Timer de Expiração**: Alerta de tempo limite `"Código Expira em 30 Minutos!"`.
- **Código Copia e Cola**: Campo de texto com a chave PIX alfanumérica (`XXXXXX-XXX-XXX-XXXX`).
- **Instruções de Pagamento**: Lista explicativa passo a passo ("Como pagar com PIX") contendo as 4 etapas de finalização pelo aplicativo do banco.

---

## 3. Arquitetura de Componentes Reutilizáveis

1. **`SubscriptionScreen` / `PaymentLayout`**:
   - Container base com dark mode e cabeçalho padrão com a logo Voyage.
2. **`PlanComparisonCard`**:
   - Componente visual que exibe as vantagens e diferenças do plano Voyage+.
3. **`PaymentOptionButton`**:
   - Botão roxo reutilizável para seleção da modalidade de pagamento (Crédito, Débito ou PIX).
4. **`SavedCardItem`**:
   - Card retangular para exibição dos cartões gravados com bandeira e máscara.
5. **`CreditCardForm`**:
   - Formulário de cadastro de cartão acompanhado da pré-visualização gráfica do cartão virtual.
6. **`PixCheckoutDisplay`**:
   - Renderiza o QR Code, contagem regressiva de expiração (30 min) e área do código copia e cola.
7. **`PrimaryButton`**:
   - Botão verde reutilizável ("Assinar R$ 19,90" / "Continuar") com suporte aos estados habilitado, desabilitado e carregando.

---

## 4. Fluxo e Requisitos Funcionais

- **Navegação**: Acesso ao fluxo de pagamento a partir da opção "Assinatura" no menu lateral.
- **Seleção de Plano**: Apresentação dos benefícios do plano Voyage+ com o valor da assinatura.
- **Opções de Pagamento**: Permite escolher entre Cartão de Crédito, Cartão de Débito ou PIX.
- **Gestão de Cartões**: Possibilidade de selecionar um cartão previamente salvo ou cadastrar um novo cartão via formulário.
- **Validação de Formulário**: Validação dos campos de cartão (número, validade, CVC e nome do titular).
- **Checkout PIX**: Geração de QR Code e código alfanumérico copia e cola com validade de 30 minutos e instruções de uso.
- **Confirmação de Pagamento**: Atualização do status da assinatura após a conclusão da transação.
