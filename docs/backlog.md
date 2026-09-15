# Backlog de Funcionalidades e Telas — Voyage Frontend

Este arquivo é mantido por agentes de IA para registrar o estado de implementação de features no frontend.

---

## 1. Módulo: User / Autenticação (Etapa 1: Front-end e Design)

### [IMPLEMENTADO] Tela de Cadastro / Criação de Perfil
- **Arquivos:** `src/Cadastro.jsx`, `src/Cadastro.css`
- **Rota:** `/cadastro`
- **ID da Tela:** `#tela-cadastro`
- **Padrão visual:**
  - Segue estritamente `docs/User.md` e a captura de tela `Captura de tela 2026-09-11 201441.png`.
  - Design monobloco com tema escuro (`#070a14`), borda azul-celeste estilo dispositivo mobile (`#0095ff`).
  - Cabeçalho com título "Foto de Perfil".
  - Avatar circular cinza (`#d1d5db`) com ícone vetorizado de busto, clique para selecionar foto local e preview em tela.
  - Campos borderless com linha inferior: Nome (ícone usuário), E-mail (ícone envelope), Senha (ícone cadeado).
  - Botão verde arredondado "Criar".
  - Link de navegação para a rota de login (`/login`).
- **Isolamento CSS:** Todas as regras no CSS estão restritas ao seletor `#tela-cadastro` para evitar vazamento de estilos.

### [IMPLEMENTADO] Tela de Login
- **Arquivos:** `src/Login.jsx`, `src/Login.css`
- **Rota:** `/login`
- **ID da Tela:** `#tela-login`
- **Padrão visual:**
  - Segue a identidade visual do Voyage e a consistência visual de `User.md`.
  - Logo Voyage em destaque com tipografia personalizada e subtítulo.
  - Campos borderless com linha inferior: E-mail (ícone envelope), Senha (ícone cadeado).
  - Botão verde arredondado "Entrar".
  - Link de navegação para a rota de cadastro (`/cadastro`).
- **Isolamento CSS:** Todas as regras no CSS estão restritas ao seletor `#tela-login`.

### [IMPLEMENTADO] Tela de Edição de Perfil
- **Arquivos:** `src/EditarPerfil.jsx`, `src/EditarPerfil.css`
- **Rota:** `/editar-perfil` (e `/perfil/editar`)
- **ID da Tela:** `#tela-editar-perfil`
- **Padrão visual:**
  - Segue estritamente a especificação de `docs/User.md` (modo `edit`).
  - Cabeçalho alinhado à esquerda com botão circular de retorno `(←)` e título "Editar Perfil".
  - Avatar circular com foto cadastrada (ou placeholder) e overlay de câmera para alterar imagem.
  - Campos preenchidos previamente com os dados atuais do usuário (Nome, E-mail, Senha).
  - Botão verde arredondado "Salvar".
- **Isolamento CSS:** Todas as regras no CSS estão restritas ao seletor `#tela-editar-perfil`.

### [IMPLEMENTADO] Configuração Base e Estilos Globais
- **Arquivos:** `src/globals.css`, `src/App.jsx`, `src/main.jsx`
- **Dependência instalada:** `react-router-dom` (configurado no `App.jsx` com rotas `/cadastro`, `/login`, `/editar-perfil` e redirecionamento de fallback).
- **Identidade Visual:** Detalhes de borda, glow/sombra, foco de inputs e links atualizados para o tom de roxo característico do Voyage (`#5a45ff` / `#7966ff`).
- **Etapa atual do projeto:** Etapa 1 (apenas HTML, CSS e estrutura React, sem chamadas a APIs ou lógica pesada).


