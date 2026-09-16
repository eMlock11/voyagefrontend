# Backlog do Projeto Voyage (Frontend)

Este arquivo registra o histórico e status das entregas para acompanhamento de agentes de IA e desenvolvedores.

---

## [2026-09-14] — Implementação da Tela de Gestão da Empresa (`Company`)

- **Status**: Concluído (Etapa 1: Front-end e Design).
- **Documento de Requisitos**: `docs/company.md`.
- **Diretrizes de Arquitetura**: `docs/arquitetura.md` (Monobloco, CSS puro escopado com `#company-page`, sem pacotes externos extras).
- **Padrão Visual Seguido**: Referências da pasta `imagens` (estilo das telas de perfil, abas em pílula do Sushifan/Tabajara Grill, botões de ação verde `#4f934f`, cards em azul escuro `#131731`).

### Arquivos Criados / Modificados:
1. `src/pages/Company.jsx`:
   - Componente monobloco com estado de abas (`kpis`, `profile`, `team`, `billing`, `security`).
   - Cabeçalho executivo com logotipo Voyage, badge de "Empresa Verificada", avaliação com estrelas (`4.8/5 ★`).
   - Painel Executivo / KPIs (Volume de operações, clientes atendidos, visualizações no guia).
   - Perfil corporativo completo (Razão social, nome fantasia, CNPJ, categoria, telefone comercial, endereço/places e descrição sobre a empresa).
   - Gestão de equipe e níveis de permissão (Proprietário, Gerente, Operacional) com botão de convite.
   - Assinatura & Planos (Plano ativo, limites, data de renovação, lista de benefícios e histórico de faturas).
   - Segurança & Auditoria (Políticas de 2FA e histórico de logs críticos).
   - Rodapé de navegação e botão de saída.
2. `src/pages/Company.css`:
   - Estilos CSS puros isolados estritamente sob o seletor `#company-page`.
3. `src/globals.css`:
   - Reset CSS e importação da fonte Inter.
4. `src/App.jsx`:
   - Atualizado para renderizar a página `Company`.
5. `src/main.jsx`:
   - Conectado com `globals.css`.

### Próximos Passos (Conforme Etapas Futuras):
- **Etapa 2**: Conectar com os endpoints `/company` e `/company/:id` via `fetch` ou biblioteca centralizada quando o backend estiver ativo.
- **Etapa 3**: Conexão de formulários, tratamento de chaves estrangeiras e edição com dados persistidos.
