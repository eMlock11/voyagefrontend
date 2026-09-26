# Voyage — Nova análise do projeto

**Data:** 25/09/2026  
**Fonte atual:** PRJ_FrontEnd - Copia.7z, diretório voyagefrontend  
**Escopo:** revisão de frontend, documentos e integração declarada; reproduções locais com dados sintéticos.

## 1. Conclusão

O Voyage já possui um frontend substancial: React/Vite, JavaScript e TypeScript, login/cadastro, perfis, painéis de cliente/empresa/admin, mapa, configurações, temas e fluxo demonstrativo de assinatura. Não se deve mais descrever o frontend como inexistente nem reconstruí-lo do zero.

A arquitetura de páginas, serviços e componentes oferece base para continuar. Há avanços reais em organização visual e navegação. A prioridade agora é corrigir persistência de dados, segurança no navegador e comportamento das integrações antes de ampliar funcionalidades.

**Avaliação:** adequado como base em desenvolvimento e demonstração controlada; ainda não validado para uso com contas/dados reais. A revisão encontrou senha gravada em texto puro no armazenamento do navegador, sucesso anunciado quando operações não foram persistidas e conteúdo externo inserido como HTML.

O arquivo contém somente o frontend; não comprova que os problemas históricos do backend foram corrigidos ou continuam presentes hoje. Não houve acesso à API publicada.

## 2. O que foi analisado e executado

Foram lidos os documentos de orientação e módulos principais de autenticação, perfil, empresas, pagamentos, mapa, configurações, navegação, tema e serviços; examinadas configurações de build/lint/tipos e trechos de CSS.

O pacote inclui código-fonte, docs, imagens, package-lock, node_modules e um dist anterior. Foram extraídos cerca de 197 MB, com 17.061 arquivos, majoritariamente dependências. A pasta extraída foi usada apenas para inspeção e execução local controlada; não foram aplicadas correções aos fontes.

| Verificação | Resultado | Limite |
| --- | --- | --- |
| ESLint configurado no projeto | **10 erros e 1 aviso** | Configuração cobre JS/JSX, não TS/TSX |
| ESLint diretamente em AddressMap.tsx | Arquivo ignorado por falta de configuração correspondente | Não interpretar como código aprovado |
| Vite build | **Bloqueado no ambiente**: falta @rollup/rollup-linux-x64-gnu | node_modules recebido contém dependências de outra plataforma; não prova falha de compilação dos fontes |
| TypeScript --noEmit | **Bloqueado no ambiente**: falta @typescript/typescript-linux-x64 | Não foi possível confirmar ausência/presença de erros de tipos com a versão do projeto |
| Handlers de edição de perfil, isolados com API simulando erro | Client e Owner gravam a senha e mostram sucesso | Código dos handlers executado com mocks; sem servidor e sem navegador completo |
| Handler de senha em configurações | Mostra sucesso sem chamada de API | Reprodução local do handler |
| Preferências em configurações | Storage muda, mas estado usado pelos controles não muda | Reprodução local de setPreferences e storage |
| mapService com fetch simulado | Categorias e limite de raio inconsistentes; notas geradas | Executado módulo real sem chamadas externas |
| apiFetch com resposta 401 simulada | Retorna null e deixa cache da empresa | Executado cliente HTTP com fetch/storage simulados |

Não houve instalação limpa, teste E2E, renderização visual, medição de contraste, acesso real a provedores de mapa, teste de backend/banco, migração ou publicação. O dist enviado não foi considerado evidência de build reproduzido ou sincronizado com src.

## 3. Evolução confirmada

- Rotas distintas `/dashboard`, `/company` e `/admin`, com allowedRoles no ProtectedRoute.
- Rotas compartilhadas `/map`, `/editar-perfil`, `/payment` e `/configuracoes`; login/cadastro públicos.
- Componentes compartilhados Sidebar, ThemeProvider e ThemeToggle.
- Tailwind, tokens de tema, clsx/tailwind-merge e Lucide presentes na base enviada.
- Tokens claro/escuro e persistência de preferência de tema implementados.
- O CSS de Payment já não altera #root como antes.
- Animações antigas fadeIn foram prefixadas para Company e mapa; ainda existe outra colisão, descrita adiante.
- Há banner “Painel Demo” em Company e “Ambiente Demo” em Payment. Essa sinalização é uma melhoria, mas não isola operações reais.
- Mapa usa MapLibre com pontos OSM, busca Nominatim, Overpass e rota OSRM.
- Cliente HTTP central injeta Bearer e há serviços de usuário/empresa.
- JavaScript/JSX e TypeScript/TSX coexistem, conforme a transição prevista. Não é necessário converter tudo para continuar.

O backlog chama o tema de “shadcn/ui”. O pacote demonstra Tailwind, tokens e componentes de tema, mas não contém um conjunto de componentes shadcn/ui em src/components/ui nem configuração components.json. Descrever o que realmente está incorporado, sem tratar o kit inteiro como implementado.

## 4. Achados prioritários

### F01 — Alta: senha em texto puro no localStorage

**Evidência:** `src/pages/User/EditarPerfilClient.jsx:122–136`; `src/pages/User/EditarPerfilOwner.jsx:142–154`.

Os handlers adicionam password ao payload da API e depois mesclam esse mesmo payload no objeto user salvo em localStorage. Se a API retorna um usuário sem password, a propriedade adicionada localmente continua no objeto; se falha, o payload também é salvo.

**Reprodução:** com senha sintética e API simulando erro, ambas as páginas persistiram password e apresentaram sucesso. Não foi usada nenhuma credencial real.

**Impacto:** a senha fica acessível a scripts da mesma origem e persiste no navegador, potencialmente até logout. Limpar apenas o input com setSenha('') não remove a propriedade armazenada.

**Correção:** construir explicitamente um objeto de sessão com campos públicos; nunca mesclar payload de senha na sessão. Atualizar storage somente a partir de resposta bem-sucedida e sanitizada. Remover password de sessões locais antigas quando a correção entrar em uso. Não confundir isso com a sanitização do backend: o problema é criado pelo próprio frontend.

**Aceite:** após editar senha com sucesso ou falha, nenhum objeto persistido contém password; erros não modificam a sessão como se a API tivesse confirmado a alteração.

### F02 — Alta: nomes externos inseridos em innerHTML no mapa

**Evidência:** `src/pages/AddressMap/AddressMap.tsx:352–358`; nomes vêm de `mapService.js`, que lê OSM/Nominatim.

O marcador interpola `${poi.name}` em `el.innerHTML`. Esse texto externo não é sanitizado. O escape automático de JSX não protege esse caminho, porque o DOM é criado manualmente.

**Impacto:** conteúdo de nome pode virar marcação HTML e abrir caminho para XSS. O token e, pelo achado F01, senhas podem estar no storage acessível à mesma origem. Não foi executado ataque nem comprovada exploração em produção.

**Correção:** criar elementos com document.createElement e preencher nomes por textContent; atribuir atributos/estilos controlados separadamente. Não precisar de HTML arbitrário para mostrar o nome de um estabelecimento.

**Aceite:** um nome contendo marcação aparece como texto literal, sem criar elementos ou executar eventos.

### F03 — Alta: sucesso de perfil e senha sem persistência confirmada

**Evidência:** `EditarPerfilClient.jsx:127–145`, `EditarPerfilOwner.jsx:146–189`; `Configuracoes.tsx:98–121`.

- Edição de perfil captura falha da API, apenas escreve console.warn e segue para atualização local/mensagem de sucesso.
- Configurações pede senha atual/nova, valida somente parte das regras e exibe “Senha atualizada com sucesso!” sem chamar userService nem qualquer endpoint.
- Em configurações, a senha atual é somente verificada como não vazia; não é autenticada. O mínimo de 8 diverge do mínimo de 10 no contrato histórico.

**Reprodução:** ambos os perfis mostraram sucesso após falha simulada; configurações mostrou sucesso com zero chamadas de API.

**Correção:** propagar falhas, preservar dados confirmados e anunciar sucesso apenas após resposta. Desabilitar ou marcar troca de senha como demonstração até existir integração adequada; definir o contrato de confirmação de senha atual no backend antes de afirmar que ela é verificada.

### F04 — Alta: modo demo mistura escrita real e dados fictícios

**Evidência:** Company.jsx contém “Painel Demo”, mas handleSubmit chama companyService.createCompany/updateCompany. Payment.jsx altera plano somente por userService.updateCurrentUserPlan, em localStorage. api.js usa fallback remoto.

Um banner demo não torna a página isolada: o formulário da empresa continua realizando requisições reais, enquanto assinatura é local. Quem testa pode acreditar que todas as ações são fictícias ou que o plano foi realmente ativado.

**Correção:** definir modo de demonstração explícito com serviços sintéticos e sem escrita remota; modo integrado deve usar respostas reais. Sinalizar blocos locais e não usar fallback automático para dados inventados após erro real. O servidor deve continuar sendo a autoridade de permissões/plano.

### F05 — Alta: avaliação inventada enviada à API

**Evidência:** `Company.jsx:183–190`; `Cadastro.jsx:94–101`; `EditarPerfilOwner.jsx:162–167`.

Cadastro e edição de empresa enviam evaluate: 4.8 fixo. Editar endereço também usa `storedCompany.evaluate || 4.8`, convertendo uma avaliação zero válida em 4.8. Isso pode sobrescrever informação persistida apenas ao salvar nome ou endereço.

No mapa, mapService fabrica notas a partir do ID OSM e usa 4.8 na busca textual. Cliques em pontos do mapa também recebem notas fixas, sem fonte de avaliações.

**Correção:** remover evaluate dos payloads de edição que não alteram nota; manter ausência de avaliação explícita. Usar somente métricas com fonte confirmada, ou dados sintéticos isolados e identificados. Não usar `||` para substituir zero quando zero é válido.

### F06 — Média/alta: associação de empresa por nome e cache sem escopo confiável

**Evidência:** `Company.jsx:103–141`; `EditarPerfilOwner.jsx:70–95`; `api.js:33–39` e userService.logout.

Company aceita empresa pelo userId OU por nome/CNPJ; pessoas ou empresas com mesmo nome podem receber o registro errado na interface. EditarPerfilOwner aceita user_company do storage sem checar dono e na busca ignora userId, usando nome/CNPJ. O tratamento 401 limpa token/user, mas deixa user_company; login também não limpa todos os caches da conta anterior.

Isso não comprova acesso indevido no servidor: um backend correto deve recusar alteração alheia. Mesmo assim, a interface pode carregar dados errados, sugerir operações inválidas e reutilizar cache de outra conta.

**Correção:** vincular por IDs e contrato do servidor, nunca por nome; cache por usuário/empresa; limpeza central de sessão; sempre revalidar registro selecionado. Definir seleção para usuários com múltiplas empresas.

### F07 — Média: cadastro de owner pode terminar com empresa não criada

**Evidência:** `Cadastro.jsx:88–114`.

O fluxo cria usuário e depois empresa. Falha da empresa é capturada apenas em console.warn; a interface anuncia conta criada e redireciona, sem explicar que o estabelecimento não foi salvo. O nome do usuário também é reutilizado como nome da empresa, embora o contrato de nome de pessoa tenha regras diferentes.

**Correção:** separar pessoa e empresa, mostrar resultado parcial e permitir retomar só o cadastro do estabelecimento. Não repetir POST /user para resolver a segunda etapa. Validar previamente os campos compatíveis e não colocar nota fictícia no cadastro.

### F08 — Média: cliente HTTP retorna null em 401 e esconde formatos de erro

**Evidência:** `src/services/api.js:33–54`.

Após iniciar redirecionamento, apiFetch retorna null em vez de rejeitar. Chamadores podem continuar o caminho de sucesso antes da navegação. A limpeza deixa cache da empresa/perfil. O normalizador não contempla erro/erroPrincipal/solucoesDetalhadas/detalhes conhecidos do backend histórico.

**Reprodução:** resposta 401 simulada resolveu como null, redirecionou e preservou user_company.

**Correção:** erro autenticado tipado/rejeitado, limpeza central, normalização completa e nenhuma mensagem de sucesso depois de 401. Limitar o cliente autenticado à base da API: ele também aceita URL absoluta e injeta token; não usar esse helper para provedores externos. Nenhum uso externo desse helper foi identificado nesta análise.

### F09 — Média: estado de preferências não acompanha os controles

**Evidência:** `Configuracoes.tsx:47–54,81–86,334–355,370,495`.

O estado usa searchRadius/autoGps/pushNotifications/businessVisibility. Os handlers são chamados com search_radius/auto_gps/push_notify/biz_visible. A escrita no storage usa as chaves snake_case esperadas, mas `setPreferences({...prev,[key]:value})` cria propriedades diferentes das lidas pelos controles.

**Reprodução:** alterar raio para 25 e GPS para false gravou os valores no storage, mas searchRadius permaneceu 10 e autoGps permaneceu true no estado. Pode parecer que a opção não muda até remontar a tela.

Além disso, AddressMap não consome essas preferências: inicia com raio 3, estilo bright e prompt de localização próprio. Visibilidade empresarial/notificações são preferências locais sem integração correspondente demonstrada.

**Correção:** mapa explícito entre chave de estado e storage; contexto de preferências compartilhado; ligar somente opções implementadas. Não anunciar ocultação da empresa ou envio de notificações a partir de uma escrita local.

### F10 — Média: ciclo de vida e eventos do mapa usam estado antigo

**Evidência:** `AddressMap.tsx:123–282`.

O efeito de criação do mapa depende só de radiusKm, mas os listeners capturam isSettingManualLocation, centerPos e fetchPOIs. Ao clicar em “Escolher no Mapa”, o listener pode continuar vendo false capturado na criação; no modo livre, mudanças de categoria/centro podem não chegar ao listener moveend. Alterar raio destrói e recria toda a instância.

A busca inicial usa efeito que aparece antes da criação do mapa e retorna se mapRef é nulo; não há carregamento explícito de POIs no onload. O resultado inicial passa a depender de outra mudança de estado. Requisições concorrentes também podem sobrescrever resultados recentes por antigos.

**Verificação:** inspeção estática do fluxo de hooks; não reproduzido em navegador completo.

**Correção:** criar mapa uma vez; listeners com estado atual por refs ou efeitos próprios; buscar quando mapa estiver pronto; atualizar fontes sem destruir instância; cancelar/ignorar respostas ultrapassadas. Testar escolha manual, mudança de categoria no modo livre e carregamento inicial.

### F11 — Média: categorias válidas desaparecem da busca

**Evidência:** `mapService.js:94–103,176,240–245`.

O classificador escolhe a primeira categoria cujo conjunto de tags corresponda. Mercado e Supermercado compartilham shop=supermarket; Mercado vem antes. Um restaurante com cuisine=pizza pode ser classificado como Restaurante antes de Pizzaria. Depois o resultado é filtrado pelo ID exato selecionado e desaparece.

**Reprodução com fixtures locais:** supermercado foi classificado como mercado e a busca específica retornou zero; restaurante com cuisine=pizza foi classificado como restaurante.

**Correção:** definir prioridade de categorias específicas ou classificação múltipla, compatível com o filtro selecionado. Usar IDs compostos tipo OSM + ID para evitar colisões entre node/way, que hoje usam só el.id.

### F12 — Média: raio exibido não corresponde ao consultado; erros viram vazio

**Evidência:** `mapService.js:116,217,263`; `AddressMap.tsx:549`.

A interface oferece 15 km, mas a consulta limita `radiusKm * 1000` a 10.000 metros. O círculo desenhado usa o raio completo. Reprodução com parâmetro 20 km confirmou consulta de 10 km; a mesma limitação vale para 15 km da UI.

Quando todos os provedores Overpass falham, retorna [] e a aplicação não distingue indisponibilidade de ausência de resultados. O cache não tem TTL e sua chave de bounds omite norte/leste, permitindo reutilizar resultado para áreas diferentes.

**Correção:** alinhar limite/legenda/círculo, retornar erro explícito com nova tentativa, incluir área completa na chave e política de atualização. Não exibir “sem locais” quando a fonte está indisponível.

### F13 — Média: painel admin inventa totais e tem caminhos inconsistentes

**Evidência:** `AdminDashboard.jsx:140–175`; App.jsx; Configuracoes.tsx; Login.jsx.

A expressão `companies.length || '18'` transforma zero empresas em 18. Outros números e “Zero incidentes” são fixos. A tabela é descrita como sincronizada mesmo quando a consulta falha e somente escreve no console.

A rota /company e o componente Company permitem apenas owner. Configurações oferece atalhos empresariais para admin também; esse usuário é devolvido a /admin pelo guard. Isso diverge da permissão do backend histórico e da documentação de Company, mas é necessária uma decisão de produto antes de ampliar acesso. Login envia qualquer não-owner para /map, embora existam dashboards próprios.

**Correção:** zero deve permanecer zero; separar erro/carregamento/vazio/demonstração; ajustar atalhos por permissão e definir destino após login. Não anunciar métricas operacionais/segurança que não são coletadas.

## 5. Mapa e produto: integração que ainda falta

O mapa consulta provedores externos; não há chamada à API Voyage de Company/Address nesse fluxo. Cadastrar uma empresa no Voyage não a faz aparecer automaticamente nesse mapa. O frontend enviado também não possui serviço próprio de CRUD de Address ou Payment equivalente aos de User/Company.

É preciso definir a união entre estabelecimentos cadastrados no Voyage e pontos OSM: origem visível, IDs separados, deduplicação, categorias e quais campos são editáveis. Evitar prometer “divulgar empresa no mapa” antes de ligar esses fluxos.

`attributionControl: false` desativa o controle de atribuição do mapa e não foi encontrado substituto na implementação. Repor créditos visíveis dos provedores; esta revisão não fez auditoria jurídica/licenciamento.

## 6. Interface, acessibilidade e manutenção

A organização visual melhorou e há breakpoints, mas não foi feita inspeção visual em navegador. Portanto, não há aprovação de contraste, responsividade ou comportamento em dispositivos reais nesta entrega.

Achados estáticos:

- Company tem cerca de 855 linhas JSX e 1.488 de CSS; mapa 782 linhas TSX; Payment 705 JSX. Extrair componentes por responsabilidade gradualmente, sem reescrever a aplicação.
- Novos componentes continuam dentro de JS/TS. Preservar JSX existente; novos componentes em TSX, conforme plano.
- Tema sistema consulta matchMedia, mas não escuta mudanças do sistema enquanto a aplicação está aberta.
- globals.css usa muitas sobrescritas !important para tema claro. Consolidar tokens/variantes por componente para reduzir dependência de ordem e seletores amplos.
- A colisão fadeIn foi corrigida, mas `@keyframes pulse` ainda é definido de formas diferentes em AddressMap.css:192 e Payment.css:536. Prefixar também essas animações.
- Sidebar fechada permanece no DOM, apenas transladada para fora da tela; não aplica inert/hidden aos controles. Não há gerenciamento de foco, Escape ou retorno de foco. Pode continuar acessível por Tab mesmo fechada.
- Modais do mapa não implementam semântica/gerenciamento de foco completo. Testar teclado, fechar/retornar foco e bloqueio de interação com o fundo.
- Avatar de cadastro é somente preview local; perfis enviam avatar não presente no contrato histórico e o mesclam localmente. Não comprova upload/persistência no servidor.
- Campo de telefone/sobre/razão social separado em Company não corresponde integralmente ao payload enviado. Documentar dados apenas locais ou adequar contrato; botão salvar não deve sugerir que todos foram persistidos.

## 7. Qualidade automatizada e reprodutibilidade

### Lint observado

| Local | Resultado |
| --- | --- |
| ProtectedRoute.jsx | 3 erros react/prop-types em allowedRoles |
| AdminDashboard.jsx | Import Clock não utilizado |
| Company.jsx | 2 erros de aspas em texto JSX; 1 aviso de dependência de hook |
| Payment.jsx | 3 imports não utilizados e variável isPopular não utilizada |
| Total | 10 erros, 1 aviso |

eslint.config.js cobre apenas `**/*.{js,jsx}`. Adicionar suporte TypeScript para TS/TSX; a ausência desse suporte deixa justamente mapa/configurações/tema fora da análise de hooks e variáveis. Declarações .d.ts com any não validam automaticamente a implementação dos serviços JS. O script build executa somente vite build e não substitui typecheck.

### Build e tipos

As tentativas usaram as dependências recebidas. Rollup e TypeScript faltam com binários Linux, enquanto o pacote veio de Windows. Isso é limitação de portabilidade da cópia, não conclusão de que falha no computador do usuário.

Próxima validação: instalação limpa com o lockfile em ambiente de teste; executar build, lint e typecheck com as versões correspondentes. Não apagar lockfile, forçar versões ou usar outro compilador silenciosamente só para produzir resultado verde. Não há script de teste automatizado no package enviado.

### Pacote compartilhado

Enviar fonte, configuração, docs, lockfile e exemplo de ambiente é suficiente para revisão. Excluir node_modules/dist de novos pacotes para reduzir tamanho e evitar binários de plataforma errada; o .gitignore já os exclui de commits, mas não os remove de um arquivo 7z criado manualmente.

O .env presente contém somente a variável VITE_API_BASE_URL; nenhum segredo foi mostrado no relatório. O .gitignore não inclui .env explicitamente. Manter .env.example com placeholders e garantir que segredos de backend nunca sejam adicionados ao frontend.

## 8. Documentação e controle de escopo no Antigravity

Os documentos atuais reconhecem o frontend existente e autorizam biblioteca visual. Isso substitui a proposta inicial de frontend do zero/CSS puro. Porém, ainda há fontes contraditórias:

- docs/contexto.md e arquitetura.md continuam listando como pendentes correções de CSS já realizadas.
- Backlog marca como implementado um conjunto de funções demonstrativas e algumas apenas visuais. Separar “UI implementada”, “integração implementada” e “verificada”.
- Referências a /address e /perfil/editar não correspondem às rotas atuais do App; ambas caem no redirecionamento padrão se acessadas.
- docs/payment.md fala em R$ 19,90; Payment usa R$ 14,90/R$ 29,90; Company mostra R$ 149,90. Plano histórico do banco é BASIC/PREMIUM. Nenhum desses valores deve virar regra comercial por acaso.
- docs/company.md descreve equipe, faturamento, auditoria e 2FA; isso não comprova implementação no servidor.
- Backlog contém links absolutos da máquina Windows do autor e nomes de arquivos alternativos ainda mencionados como instrução. Preferir caminhos relativos e uma versão canônica por assunto.
- Backend de setembro 12 deve permanecer identificado como histórico. Esta entrega não contém seus serviços atualizados para revalidar aquelas falhas.

Recomendação: uma seção de “estado atual” curta com origem de cada dado (API Voyage, provedor externo, armazenamento local ou mock) e data da última verificação. As regras devem proibir sucesso fictício e dados sintéticos dentro de payloads reais, além de manter JS/TS.

## 9. Sequência proposta de correção

### Etapa 1 — Dados e sessão

1. Remover persistência de senha e sanear objetos de sessão locais.
2. Eliminar innerHTML com dados externos.
3. Propagar falhas de perfil; corrigir senha de configurações e 401.
4. Centralizar limpeza de cache e vincular empresa por userId/companyId.

**Aceite:** sem senha no storage, conteúdo externo literal, nenhum sucesso após falha, sessão/cache não misturam contas.

### Etapa 2 — Contratos e demonstrações

1. Remover notas inventadas dos payloads reais.
2. Tornar cadastro de empresa retomável após sucesso parcial da conta.
3. Isolar demo de integração real; não ativar plano real no storage.
4. Mostrar resultados vazios/erros reais e explicitar métricas fictícias.
5. Definir cadastro Voyage → mapa, avatar e campos corporativos efetivamente persistidos.

**Aceite:** toda ação informa o que realmente salvou; demo não grava na API; zero permanece zero; empresas e dados exibidos têm origem identificável.

### Etapa 3 — Mapa e preferências

1. Corrigir listeners/ciclo de vida, busca inicial e respostas atrasadas.
2. Corrigir prioridades de categorias, limite de raio e falhas de provedor.
3. Conectar preferências e corrigir chaves de estado.
4. Restaurar atribuições e gerenciar IDs/cache adequadamente.

**Aceite:** escolha manual funciona; categorias específicas retornam fixtures corretas; raio e círculo concordam; falha é distinta de vazio; preferências visíveis aplicam-se ao mapa.

### Etapa 4 — Qualidade e experiência

1. Instalação reproduzível, lint para JS/TS e typecheck separado.
2. Resolver lint e revisar hooks do mapa com cobertura apropriada.
3. Corrigir foco de sidebar/modais, tema sistema e colisão pulse.
4. Validar telas em 360, 390, 768, 1024 e 1440px, teclado e zoom de 200%.
5. Atualizar docs/backlog somente com evidências reais.

Não há necessidade de trocar linguagens, reescrever backend ou instalar outro kit visual para executar essa sequência.

## 10. Prompt sugerido para o Antigravity

> Leia esta análise e os documentos canônicos. Preserve JavaScript no backend e JS/JSX existentes; novos componentes frontend em TypeScript/TSX. Comece pela Etapa 1, com alterações pequenas. Nunca salve password no estado persistente e nunca mescle o payload de senha no usuário da sessão. Corrija a inserção de nomes externos no mapa usando textContent. Perfil e troca de senha só podem exibir sucesso após resposta confirmada; 401 deve interromper o fluxo e limpar a sessão de forma centralizada. Empresa deve ser identificada por IDs, sem inferir propriedade pelo nome. Use mocks sintéticos nos testes locais e não grave na API remota. Informe arquivos alterados, testes executados e pendências. Não inclua novas funcionalidades comerciais nessa correção. Depois, avance pelas etapas 2 a 4 conforme a tarefa solicitada, atualizando docs/backlog com status real.

## 11. Síntese do produto após esta revisão

O Voyage evoluiu para uma aplicação de descoberta de estabelecimentos com mapa e rotas, contas por perfil e painel para empresas. A interface já existe e integra fontes externas e parte da API. Assinaturas, métricas e certas configurações ainda misturam demonstração e estado local. A próxima etapa é transformar essa experiência em fluxos confiáveis e verificáveis, preservando a base criada.
