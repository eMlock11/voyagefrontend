# Voyage — Arquitetura para redesign com biblioteca visual

Versão alternativa: 22/09/2026. Revisão técnica de origem: 21/09/2026. Base: arquitetura anterior, contexto, package(1).json e src.zip enviados. Inspeção estática; não houve execução do frontend ou da API.


## Como usar esta versão alternativa

Usar este arquivo junto com `contexto_com_biblioteca.md`. Eles substituem as restrições de CSS puro da versão anterior na tarefa de redesign. Você pode copiar seus conteúdos para os arquivos canônicos `arquitetura.md` e `contexto.md`, ou apontar explicitamente o Antigravity para os nomes alternativos. Não carregar simultaneamente instruções antigas de proibição de bibliotecas. Os arquivos anteriores foram preservados.

## 1. Papel dos documentos

- Este arquivo define estrutura frontend, CSS, processo de design e critérios de aceite visual.
- `contexto.md` (anexo chamado `contexto(1).md`) define contratos, regras de negócio, pendências e evidências. No projeto, manter uma única cópia canônica do contexto.
- Instruções atuais do usuário prevalecem. Para comportamento existente, conferir o código; bugs e exemplos visuais não se tornam requisitos por já estarem implementados.
- Esta revisão substitui as antigas exigências de páginas monobloco, ausência de lógica, MySQL e isolamento obrigatório por IDs. Não reiniciar o frontend.

## 2. Base real e limites

Já existem login, cadastro, edição de perfil, empresa, pagamentos e mapa, serviços HTTP e proteção de rotas. O trabalho atual é melhoria visual de frontend existente, com integração parcial e demonstrações.

O package enviado declara React ^18.3.1, Vite ^5.4.10, React Router DOM ^7.18.3, MapLibre GL ^6.9.1 e TypeScript ^7.0.2. São faixas declaradas, não versões instaladas verificadas. Está autorizada a inclusão de uma solução visual principal e de suas dependências necessárias. Preservar as versões da base sempre que possível; verificar compatibilidade antes de instalar.

O código mistura `.jsx`/`.js` com `.tsx` e declarações `.d.ts`. Manter JavaScript no backend Express, Prisma e PostgreSQL, conforme contexto; esta entrega não incluiu novo backend. Novos componentes frontend devem usar TypeScript. Preservar os arquivos JSX existentes e migrar pontualmente quando necessário; não converter o projeto inteiro numa tarefa de design.

CSS puro deixa de ser obrigatório. O usuário autoriza adotar uma biblioteca de estilos, componentes ou uma combinação coerente entre elas para o redesign. O Antigravity pode selecionar e instalar a solução visual e suas dependências necessárias, alterar package.json, lockfile e configuração de estilos, sem solicitar nova permissão para cada pacote dentro desse escopo. Esta autorização não abrange pacotes sem relação com a interface, serviços pagos, troca de framework ou reescrita do backend.

### Escolha e implantação da biblioteca

- Conferir package.json, lockfile, configuração Vite/TypeScript e versões realmente instaladas. Consultar a documentação oficial atual da solução escolhida antes de definir comandos e versões. Não presumir que a versão mais recente é compatível com React 18/Vite 5.
- Registrar em um plano curto a solução escolhida, motivo, dependências, impacto do reset/tema e primeira tela a migrar. Na ausência de preferência do usuário, escolher com base em personalização, acessibilidade, documentação, manutenção e compatibilidade; registrar a escolha e prosseguir.
- Escolher uma solução principal. Pode combinar utilitários CSS com componentes acessíveis quando fizerem parte de uma mesma estratégia; evitar vários kits completos concorrentes.
- São permitidos framework utilitário, kit de componentes tematizável, primitivas acessíveis, biblioteca de ícones e mecanismo de estilos exigido pela solução. Não fixar neste documento uma marca ou versão ainda não avaliada.
- Usar o gerenciador indicado pelo lockfile. Atualizar um único lockfile e verificar instalação, lint/build e tipos conforme configuração disponível. Não usar force ou ignorar peer dependencies para esconder incompatibilidades.
- Preferir versão compatível da biblioteca a atualizar toda a base. Se nenhuma opção atender sem migração ampla de React/Vite, apresentar o impacto e pedir decisão específica sobre essa migração.
- Migrar incrementalmente: tema/tokens e componentes básicos, uma tela piloto, depois as demais telas solicitadas. Manter CSS legado onde necessário; remover apenas regras comprovadamente substituídas.
- Conferir ordem de importação, reset/preflight, portais, z-index, fonte e estilos do MapLibre. O novo tema não pode quebrar controles, atribuições ou dimensões do mapa.
- Não considerar a biblioteca instalada ou o redesign executado somente porque esta documentação os autoriza.

## 3. Liberdade para melhorar a interface

O Antigravity pode reorganizar JSX/TSX, criar componentes visuais, alterar classes, espaçamentos, tipografia, cores, grids, bordas, sombras e hierarquia dentro da tela solicitada. Pode usar Flexbox, Grid, variáveis CSS, clamp, media queries e estados React para menus, abas e interações visuais.

Priorizar código legível, nomes claros e comentários breves para técnicas menos familiares. O nível de aprendizado do usuário não deve obrigar interfaces rudimentares. Componentizar quando houver repetição ou responsabilidade visual clara; evitar tanto monoblocos quanto abstrações sem utilidade.

Preservar handlers, validações, contratos, navegação e comportamento de autenticação. Mudanças de CSS não autorizam novas regras comerciais ou integração financeira. Alterações de estado visual devem respeitar teclado e foco.

## 4. Sistema visual compartilhado

A aparência atual escura/roxa é uma referência histórica, não uma obrigação. Está autorizado criar uma direção visual diferente, inclusive tema claro, nova paleta, tipografia, navegação, composição de cards e organização de conteúdo. Preservar nome Voyage, significado das informações e funcionalidades. Usar referências fornecidas pelo usuário; na ausência delas, definir e registrar uma proposta coerente e aplicá-la à tela piloto. Não é necessário repetir a moldura de celular nem o layout atual. Não declarar a nova identidade aprovada antes da avaliação do usuário.

- Centralizar no tema da biblioteca e/ou em `globals.css` o reset, fonte, tokens e estilos realmente globais, sem duplicar resets. Criar tokens semânticos para fundo, superfície, texto, texto secundário, destaque, borda, sucesso, erro, foco, espaçamentos, raios e sombras.
- Partir de escala de espaçamento 4, 8, 12, 16, 24, 32 e 48px; usar tamanhos intermediários quando o conteúdo justificar.
- Definir hierarquia de título, subtítulo, corpo e texto auxiliar. Usar Inter com fallback consistente, inclusive nos controles do mapa; preservar legibilidade se a fonte externa falhar.
- Criar estilos/componentes comuns para botão, campo, aviso, card e cabeçalho conforme a repetição real. Prever hover, focus-visible, disabled, loading e erro.
- Manter superfícies do mapa adequadas à leitura; a consistência deve vir de fonte, controles, espaçamentos e cores semânticas, sem exigir mapa escuro.
- Usar ícones SVG existentes de forma consistente. Não inventar indicadores, selos de verificação, resultados financeiros ou imagens de empresas para decorar a tela.

## 5. Organização e isolamento de CSS

Cada página/componente usa o mecanismo de estilo da solução escolhida: classes utilitárias, tema, variantes, CSS Modules ou API de estilos da biblioteca. Arquivo CSS próprio só é necessário para estilos complementares. Quando houver CSS manual, preferir classes prefixadas e baixa especificidade. IDs atuais podem permanecer durante a transição.

CSS de página não pode alterar `body`, `#root` ou controles globais. Colocar essas regras em `globals.css` apenas se realmente se aplicarem a toda a aplicação. Classes geradas pelo MapLibre devem ser customizadas com escopo do mapa quando possível.

Extrair estilos inline estáticos para classes, variantes ou API de tema da biblioteca, conforme o padrão escolhido. Manter inline apenas valores dinâmicos necessários, como cor de categoria ou posição calculada. Evitar `!important`; exceções pontuais para o comportamento da biblioteca devem ser justificadas.

Prefixar nomes de animações, por exemplo `company-fade-in` e `map-tooltip-fade-in`: IDs não isolam `@keyframes`. Evitar seletores sem correspondência no JSX. Ao alterar classe, atualizar estilos e usos juntos.

## 6. Correções prioritárias identificadas no código

| Prioridade | Evidência | Orientação |
| --- | --- | --- |
| 1 | `Payment.css`, media query de 768px, altera `body > #root` e `#root` | Mover espaçamento/alinhamento para um wrapper exclusivo de pagamentos. Como App importa a página estaticamente, esse CSS pode afetar outras rotas. |
| 1 | `Company.css` usa `.company-tabs`, `.tab-content` e `.stats-grid` em desktop, enquanto JSX usa `.company-tabs-nav`, `.company-tab-content` e `.kpi-grid` | Corrigir os seletores e revisar os demais do breakpoint; não acumular novas regras sobre seletores sem uso. |
| 1 | `Company.css` e `AddressMap.css` declaram `@keyframes fadeIn` com transforms diferentes | Renomear definições e respectivos usos para impedir colisão global. |
| 2 | `globals.css` não define tokens; cores e medidas são repetidas nas páginas | Centralizar decisões visuais e substituir valores gradualmente na tela alterada. |
| 2 | Estilos inline estáticos em Company e outras telas | Extrair para classes, preservando valores dinâmicos necessários. |
| 2 | Login usa card de 360px/min-height 560px; Payment usa 400px/min-height 840px antes dos breakpoints | Rever molduras, alturas e aproveitamento desktop. Formulários podem continuar estreitos, mas o layout da página deve ser intencional. |
| 2 | Company amplia para 860/980px; Payment para 600px, com estrutura predominantemente vertical | Já há responsividade parcial. Melhorar a organização, não afirmar que ela inexiste. |
| 2 | Mapa usa 100vh, controles absolutos e não possui media queries no CSS enviado | Verificar sobreposição, teclado móvel, áreas seguras e conteúdo longo em telas pequenas. |
| 2 | `body` usa `overflow-x: hidden` | Investigar estouros em vez de apenas escondê-los. Não remover sem conferir impacto. |

## 7. Layout responsivo e acessibilidade

Adotar mobile-first. Na tela pequena, usar largura disponível e margens confortáveis, sem moldura artificial de aparelho salvo pedido explícito. No desktop, distribuir conteúdo em colunas quando fizer sentido; não apenas ampliar textos. Formulários de autenticação podem manter largura de leitura restrita.

Usar altura guiada pelo conteúdo; considerar `100dvh` com fallback onde houver tela inteira. No mapa, conferir controles, painéis e atribuições do provedor ao redimensionar; chamar resize da instância se a mudança de container exigir.

Verificar 360, 390, 768, 1024 e 1440px como amostras, além de larguras intermediárias. Evitar scroll horizontal involuntário, sobreposição e cortes com zoom de 200%. Não esconder funcionalidades no celular para fazê-las caber.

Manter labels, HTML semântico, nomes acessíveis em botões de ícone, foco visível e operação por teclado. Para modais, gerenciar entrada/retorno do foco e fechamento. Definir como meta contraste de 4,5:1 no texto comum e alvos de interação de pelo menos 44px. Respeitar `prefers-reduced-motion`. Não depender só de cor ou hover para transmitir informação.

## 8. Dados reais e demonstrações

Há chamadas à API e a provedores de mapa; não tratar o aplicativo inteiro como mock nem acessar serviços automaticamente para validar CSS. Preferir fixtures sintéticas e interceptação local na revisão visual, sem fallback silencioso em falhas reais.

A página Company contém receita, preço de plano e 2FA fixos; Payment contém três planos comerciais e fluxo local de cartão/PIX. Isso não comprova contratos nem funcionalidades reais. Marcar blocos demonstrativos de modo visível, usar dados sintéticos e não apresentar cobrança, assinatura ou segurança como concluídas. Não inserir dados reais de cartão nesse protótipo. Não implementar gateway ou transformar o backend de registros em checkout por iniciativa de design.

Preservar as rotas atuais. Login/cadastro são públicos; Company, perfil, mapa e Payment estão sob ProtectedRoute. A abertura do catálogo/mapa deve ser decidida em tarefa funcional própria. Proteção no navegador não substitui autorização no servidor.

## 9. Execução para o Antigravity

1. Ler este arquivo e a atualização de estado no contexto. Inspecionar a tela e CSS atuais.
2. Para redesign amplo, registrar plano curto com tela-alvo, componentes afetados e direção visual. Resolver escolhas rotineiras sem pedir aprovação por arquivo. Pedir decisão apenas quando houver ampliação funcional, mudança de nome/logo, serviço pago ou migração ampla da base. Escolha da biblioteca visual, dependências necessárias e nova direção estética já estão autorizadas neste escopo.
3. Corrigir vazamento de estilos, seletores ineficazes e animações antes de refinar aparência. Conferir outras rotas afetadas pelo CSS global.
4. Aplicar tokens e componentes proporcionais à tarefa; preservar integração e comportamento existente. Não reestruturar backend nem toda a pasta src.
5. Conferir desktop, celular, teclado, estados vazio/erro/carregando e textos longos em ambiente local controlado. Usar capturas antes/depois quando houver ambiente executável.
6. Executar lint/build se o projeto completo e dependências estiverem disponíveis. Não afirmar que build valida tipos: o script recebido só executa `vite build`; conferir a configuração e a checagem TypeScript separadamente quando necessário.
7. Informar arquivos alterados, resultado, verificações realmente executadas e pendências. Não inventar testes ou capturas. Não publicar nem gravar dados remotos como parte do redesign.

## 10. Prompt de implementação

> Leia arquitetura_com_biblioteca.md e contexto_com_biblioteca.md (ou arquitetura.md/contexto.md se estas versões substituírem os arquivos canônicos). Melhore a tela solicitada do Voyage usando React/Vite e uma biblioteca visual compatível. Selecione a solução, registre a justificativa e instale suas dependências necessárias; esta ação está autorizada dentro do redesign. Defina uma direção visual diferente e coerente, sem obrigação de manter tema escuro/roxo ou molduras de celular. Corrija primeiro o CSS de Payment que afeta #root, as classes divergentes no breakpoint de Company e a colisão de fadeIn, conforme os arquivos envolvidos. Organize tokens e componentes simples, remova estilos inline estáticos da área alterada e melhore hierarquia, espaçamento e adaptação ao desktop/celular. Preserve rotas, handlers e contratos. Novos componentes em TSX; sem conversão massiva dos JSX. Separe demonstrações dos dados reais. Não adicione pacotes fora do escopo visual, novas regras comerciais ou gravações remotas. Confira a documentação oficial da biblioteca e valide instalação/configuração antes de afirmar conclusão. Valide o resultado visual e relate somente verificações executadas.
