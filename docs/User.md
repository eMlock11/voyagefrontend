# Contexto das Telas — Perfil de Usuário (Criar e Editar)

Este documento descreve a estrutura visual, componentes, estados e regras funcionais para o fluxo de **Perfil de Usuário**, baseado nos layouts de tela fornecidos nos prints.

---

## 1. Identidade Visual & Design System

- **Fundo**: Dark Mode em azul-marinho muito escuro.
- **Moldura/Borda**: Container da tela possui uma borda fina azul/ciano nas extremidades (destacada na tela de criação).
- **Tipografia**: Texto sans-serif branco de alto contraste. Labels pequenos acima das linhas dos campos.
- **Campos de Entrada (Inputs)**: 
  - Estilo minimalista sem caixa (borderless), com ícone vetorial branco à esquerda.
  - Label pequeno acima da entrada.
  - Linha horizontal inferior cinza/branca delimitando a área do campo.
- **Botões Primários**: Botão verde médio com cantos arredondados, texto branco centralizado em destaque (bold).
- **Avatar**: Formato circular grande no centro superior da tela.

---

## 2. Descrição das Telas

### A. Tela de Criar Perfil (`mode="create"`)
- **Cabeçalho**: Título centralizado `"Foto de Perfil"` em texto branco bold. Sem botão de retorno.
- **Avatar**: Círculo cinza claro contendo ícone vetorial branco de usuário genérico (busto). Indica o local para adicionar a foto.
- **Formulário** (Campos inicialmente vazios):
  - **Nome**: Ícone de usuário à esquerda + label `"Nome"` + linha inferior delimitadora.
  - **E-mail**: Ícone de envelope à esquerda + label `"E-mail"` + linha inferior delimitadora.
  - **Senha**: Ícone de cadeado à esquerda + label `"Senha"` + linha inferior delimitadora.
- **Ação Principal**: Botão verde com cantos arredondados e texto `"Criar"`.

### B. Tela de Editar Perfil (`mode="edit"`)
- **Cabeçalho**: Alinhado à esquerda no topo, contendo ícone circular de voltar `(←)` seguido do texto `"Editar Perfil"`.
- **Avatar**: Exibe a foto circular cadastrada do usuário (ex: foto do perfil).
- **Formulário** (Campos preenchidos com os dados existentes):
  - **Nome**: Exibe o nome atual do usuário (ex: `"Linus Torvalds"`).
  - **E-mail**: Exibe o e-mail atual do usuário (ex: `"linusrvainalovvs71@gmail.com"`).
  - **Senha**: Exibe a senha mascarada em asteriscos (`**************`).
- **Ação Principal**: Botão verde com cantos arredondados e texto `"Salvar"`.

---

## 3. Arquitetura de Componentes Reutilizáveis

1. **`ProfileScreen` / `ProfileForm`**:
   - Container principal reutilizado para ambas as telas, alternando via prop/estado (`mode: 'create' | 'edit'`).
2. **`ProfileHeader`**:
   - Renderiza título centralizado `"Foto de Perfil"` no modo `create` ou o botão de retorno `(←)` com `"Editar Perfil"` no modo `edit`.
3. **`ProfileAvatar`**:
   - Exibe o placeholder cinza com ícone genérico (`create`) ou a imagem real do usuário (`edit`). Permite interagir para seleção de imagem.
4. **`ProfileInput`**:
   - Componente reutilizável para os campos (`Nome`, `E-mail`, `Senha`). Suporta ícone à esquerda, label, valor e tipo (text, email, password mascarado).
5. **`PrimaryButton`**:
   - Botão verde reutilizável ("Criar" / "Salvar") com suporte aos estados `enabled`, `disabled` e `loading`.

---

## 4. Fluxo e Requisitos Funcionais

- **Navegação**: O modo de edição possui botão de retorno no cabeçalho para voltar à tela anterior.
- **Upload de Foto**: O usuário pode clicar no avatar circular para carregar ou alterar a foto de perfil.
- **Mascaramento de Senha**: O campo de senha oculta os caracteres digitados/preenchidos.
- **Validação**: Validação de formulário (e-mail válido, preenchimento obrigatório e senha) antes da submissão.
- **Persistência**: Botão `"Criar"` cadastra o perfil; botão `"Salvar"` atualiza as informações existentes.
