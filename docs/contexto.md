# Voyage — Contexto para redesign com biblioteca visual

Versão alternativa de 22/09/2026. Revisão técnica de origem: 21/09/2026, com inspeção estática do frontend em src.zip e package(1).json. A revisão histórica do backend é de 12/09/2026; seus achados não foram revalidados nesta entrega. Nenhuma execução da aplicação ou chamada à API foi realizada nesta revisão visual.



## Autorização atual — biblioteca visual e nova direção de design

Esta versão deve ser usada com `arquitetura_com_biblioteca.md`; substitui as regras anteriores de CSS puro e de proibição de novas dependências visuais. O usuário autoriza selecionar, instalar e configurar uma solução visual principal, seus pacotes necessários e ícones quando úteis ao redesign, sem pedir nova autorização para cada etapa. A escolha deve ser justificada no plano e conferida na documentação oficial atual, considerando React/Vite e versões instaladas. Uma combinação de utilitários e componentes é permitida se formar uma estratégia única; não empilhar kits completos concorrentes.

Pode alterar paleta, tema claro/escuro, tipografia, componentes, navegação visual, espaçamentos e composição para obter aparência diferente. Não precisa preservar o roxo, fundo escuro ou molduras de celular. Preservar nome Voyage, regras de negócio, rotas e handlers; mudança de nome/logo e ampliação funcional exigem decisão específica. Na ausência de referências, registrar uma direção visual e iniciar por uma tela piloto.

Pode modificar package.json, lockfile, configuração visual e componentes TSX necessários. Não atualizar toda a base nem forçar dependências incompatíveis. CSS legado pode coexistir durante a migração, sem resets duplicados ou conflitos com MapLibre. A escolha e instalação da biblioteca ficam para a implementação: nenhuma biblioteca foi instalada ao criar estes documentos.

Não há autorização para novos serviços pagos, gateway de pagamento, mudança de backend/banco ou gravações remotas como parte do design. Permanecem as regras de demonstração, dados sintéticos, autenticação e contratos abaixo. Validar interface, teclado, responsividade, lint/build e tipos conforme ambiente disponível, sem anunciar testes não executados.

Para uso, apontar o Antigravity aos dois arquivos alternativos ou substituir o conteúdo dos arquivos canônicos. Não manter as proibições antigas carregadas em paralelo. Onde as seções históricas mencionarem arquitetura.md, considerar a versão com biblioteca visual.

## Atualização de estado — ler antes das seções históricas

Esta atualização e `arquitetura.md` revisado em 21/09/2026 substituem as afirmações antigas de que o frontend não existe, de que toda integração ainda é futura e de que a etapa atual proíbe lógica. As seções de backend preservam evidências históricas; não comprovam o estado do servidor hoje.

### Fontes e estado observado

Foram inspecionados `src.zip` e `package(1).json`. Já existem App.jsx, main.tsx, ProtectedRoute.jsx, páginas de login, cadastro, edição de perfil, Company.jsx, Payment.jsx, AddressMap.tsx, estilos por página e serviços api.js, companyService.js, userService.js e mapService.js. A base mistura JavaScript/JSX e TypeScript/TSX. Novos componentes devem usar TSX, preservando os existentes sem conversão massiva nesta tarefa.

O package declara React ^18.3.1, Vite ^5.4.10, React Router DOM ^7.18.3, MapLibre GL ^6.9.1 e TypeScript ^7.0.2. Versões instaladas, compatibilidade, compilação e funcionamento não foram verificados. A inclusão de dependências visuais está autorizada conforme a seção inicial; verificar compatibilidade e preservar a base sempre que possível.

| Área | Evidência atual | Implicação para o trabalho |
| --- | --- | --- |
| Rotas públicas | /login e /cadastro | Preservar os caminhos existentes. |
| Rotas sob ProtectedRoute | /company, /editar-perfil, /perfil/editar, /address, /map e /payment | O mapa atual é protegido no frontend; o catálogo público do plano anterior continua proposta. Não mudar permissões numa tarefa visual. |
| Rota inicial e desconhecidas | Redirecionam para /login | Não substituir automaticamente pelo catálogo proposto. |
| Sessão | userService guarda token/user em localStorage; isAuthenticated verifica presença do token | A proposta histórica de token só em memória não foi a implementação adotada. Preservar a sessão no redesign; registrar decisão de persistência como pendente de revisão funcional. |
| HTTP | api.js centraliza fetch e Bearer, com fallback para servidor remoto | Chamadas já estão escritas, mas não verificadas. Usar ambiente controlado para revisar telas; não disparar operações reais por acidente. |
| Mapa | MapLibre, tiles OpenFreeMap, consultas Overpass, Nominatim e rotas OSRM aparecem no código | Geocodificação e rotas existem no código frontend; isso não significa novos endpoints no backend Voyage. Preservar atribuições e distinguir origem dos dados. |
| Pagamentos | Interface local de planos, cartão e PIX em Payment.jsx | Não há comprovação de cobrança real; diverge do escopo histórico de registros de pagamento. |

### Prioridade atual: qualidade visual sobre a base existente

A tarefa atual é revisar instruções e orientar redesign. Problemas do backend continuam condicionando a integração de cada módulo, mas não impedem trabalhar visualmente com dados sintéticos. Não reconstruir o frontend do zero nem iniciar correções amplas do backend como efeito colateral de CSS.

`arquitetura.md` contém as regras visuais e o checklist. Este contexto mantém contratos e negócio. Componentes reutilizáveis, Grid/Flexbox, variáveis CSS, classes de baixa especificidade, estados React e mudanças de estrutura da tela estão permitidos dentro do redesign. Selecionar e instalar a biblioteca visual conforme autorização inicial e arquitetura_com_biblioteca.md.

### Achados concretos de design

1. Payment.css altera #root global em desktop. Como as páginas são importadas estaticamente no App, essas regras podem afetar outras rotas. Transferir para wrapper local.
2. Company.css tem seletores de desktop sem correspondência: .company-tabs/.tab-content/.stats-grid versus .company-tabs-nav/.company-tab-content/.kpi-grid no JSX. Ajustar nomes antes de aumentar a quantidade de CSS.
3. Company.css e AddressMap.css definem fadeIn com transforms diferentes. Prefixar animações e usos: IDs não isolam keyframes.
4. Cores e medidas repetidas sem tokens em globals.css, estilos inline estáticos e páginas extensas dificultam padronização. Extrair gradualmente apenas o que a tarefa requer.
5. Há breakpoints de desktop em conta, empresa e pagamentos; não dizer que inexiste responsividade. O mapa usa controles absolutos e 100vh sem media queries no CSS enviado. Conferir sobreposição, teclado móvel e alturas.
6. Há uma base escura/roxa e mapa claro. Esta aparência não é obrigatória: a nova direção estética está autorizada, preservando nome e regras do produto. Melhorar hierarquia e layout antes de efeitos decorativos.

### Divergências de conteúdo que afetam a apresentação

Company.jsx inclui receita de R$ 48.250, plano de R$ 149,90/mês, histórico e indicação fixa de 2FA ativo. Payment.jsx define Básico, Intermediário e Voyage+, com preços/benefícios, cartões sintéticos e PIX local. Esses elementos não comprovam regras aprovadas, contratos ou segurança implementada. O contexto anterior prevê apenas BASIC/PREMIUM e registros de pagamento.

Preservar a distinção entre protótipo e produto: sinalizar os blocos demonstrativos, usar dados sintéticos e não anunciar pagamento, ativação de plano ou 2FA como reais. Não solicitar dados reais de cartão no protótipo. Não promover esses exemplos a regras comerciais nem removê-los como decisão de produto sem esclarecer o escopo. Quando uma tarefa exigir definir o produto final, confirmar quais planos e funcionalidades são pretendidos.

As funções de mapa consultam fontes externas diferentes da API Voyage. As restrições históricas sobre ausência de geocodificação e radius em graus referem-se aos contratos de Address do backend analisado. Não aplicá-las automaticamente ao cálculo local ou aos dados do provedor externo: conferir implementação e origem antes de usar rótulos como quilômetros.

### Verificação desta entrega

Inspeção estática de arquivos e comparação das instruções com o código. Apenas documentos foram editados. Não houve build, lint, teste de tipos, renderização no navegador, requisição remota ou revisão nova do backend. O ZIP contém src, mas não a entrada HTML, configuração Vite/TypeScript nem lockfile; uma execução fiel exige completar a raiz do frontend. Prints e referências visuais ainda não foram fornecidos, portanto o refinamento estético final permanece a definir.

As seções seguintes preservam contratos e planejamento histórico de 12/09, com referências ao estado atual corrigidas. Em divergências sobre o frontend atual, esta atualização prevalece; em contratos do backend, conferir as fontes atuais antes de integrar.

## 0. Resumo e regras de execução para o Antigravity

> **Ler esta seção antes de codar.** Ela consolida o plano e as restrições do usuário. As demais seções documentam os contratos e achados da revisão. Este arquivo orienta o assistente; não é um bloqueio técnico automático. Manter o arquivo na raiz do projeto e incluí-lo como contexto das tarefas no Antigravity. Não presumir carregamento automático por uma configuração que ainda não foi criada.

### 0.1 Resumo do projeto

Construir o frontend do **Voyage** e aproveitar a base existente de backend. A interpretação provisória é um guia de empresas e serviços, com catálogo, contas, endereços, painel de empresas e registros de pagamento. Existem perfis client, owner e admin. BASIC/PREMIUM e favoritos estão modelados, mas não autorizam inventar regras comerciais ou endpoints.

O frontend já tem implementação parcial, descrita na atualização de 21/09 acima. O backend é parcial, com Express, Prisma e PostgreSQL. Há correções verificadas no código, mas a API completa ainda não foi executada nesta análise. Priorizar correções de acesso e contratos antes de integrar dados reais; telas podem avançar com mocks claramente identificados.

### 0.2 Linguagens e base técnica — decisão do usuário

| Parte | Regra de construção |
| --- | --- |
| Backend existente | Manter **JavaScript**, Node.js, Express e ES Modules; preservar serviços e roteadores existentes |
| Frontend novo | Usar **TypeScript**, com componentes `.tsx`; base planejada React + Vite |
| Código auxiliar e testes do projeto | Usar JavaScript ou TypeScript |
| Banco | Manter PostgreSQL e Prisma; não trocar o banco para facilitar uma tela |
| Arquivos de suporte permitidos | HTML, CSS, JSON, Markdown, schema Prisma, SQL de migrações, TOML e arquivos de ambiente são necessários e não representam troca das linguagens de aplicação |

Não introduzir Python, PHP, Java, C#, Go, Dart ou outra linguagem para implementar partes da aplicação. Não converter o backend inteiro para TypeScript, trocar framework, criar microserviços ou iniciar outro backend como parte de uma tarefa de frontend. Uma mudança desse porte precisa de decisão específica do usuário.

React + Vite é a base declarada no package frontend recebido; a exigência expressa do usuário é manter JavaScript e TypeScript. Não afirmar que as dependências do frontend já foram instaladas. Definir versões compatíveis quando a implementação começar.

### 0.3 Escopo e sequência de trabalho

1. **Base visual:** layout responsivo em português, componentes, rotas frontend e mocks sintéticos.
2. **Backend essencial:** corrigir exposição de usuários em Address, auth de Payment, alteração de signature, propriedade dos vínculos e segredo JWT; conferir servidor, ambiente e migrações.
3. **Integração principal:** catálogo/detalhe de empresa, cadastro/login, perfil, endereços pessoais com acesso definido e gestão de empresas.
4. **Pagamentos:** conectar somente depois de validar autenticação, propriedade, seleção da empresa e datas. São registros, não processamento bancário.
5. **Recursos posteriores:** favoritos graváveis, regras de planos e avaliações individuais dependem de definição e contratos. Não implementá-los automaticamente.

Dentro de uma tarefa de implementação solicitada, resolver escolhas rotineiras e correções necessárias sem pedir confirmação a cada arquivo. Pedir uma decisão somente quando faltar uma regra de negócio que mude o resultado ou quando a solução exigir ampliar este escopo. Não confundir uma pendência de um módulo com bloqueio para construir as demais telas.

### 0.4 Regras para não desviar do plano

- Usar o código atual como evidência de comportamento, mas não transformar um bug em requisito. Se o código divergir do objetivo, registrar e corrigir dentro da tarefa autorizada.
- Não inventar campos, endpoints, permissões, benefícios PREMIUM, valores financeiros ou regras de negócio para preencher a interface.
- Não reintroduzir problemas já corrigidos: preservar auth de Company, bloqueio de cadastro admin, seleção de campos de cadastro, sanitização em User, edição de evaluate e datas validadas de Payment.
- Não considerar User sanitizado como prova de que Address está seguro: nenhuma resposta deve expor password, inclusive em objetos relacionados.
- Autorizar no servidor cada recurso privado. Ocultar botão, filtrar por ID no navegador ou apenas enviar Bearer não substitui autenticação/propriedade.
- Não permitir mudança livre de type ou signature no próprio perfil, nem vínculo com empresa alheia sem autorização.
- Não remover validações, aceitar segredo fixo em ambiente real ou liberar rotas para fazer um teste passar.
- Não chamar serviço remoto dos HTTP, gravar dados reais, executar migração em produção ou publicar a aplicação como efeito colateral de criar telas. Essas operações exigem contexto e autorização específicos.
- Não copiar senhas, CPFs, tokens ou dados de contas dos exemplos para código, commits, mocks ou telas.
- Não fazer refatoração geral ou substituição de biblioteca sem necessidade concreta da tarefa. Manter mudanças pequenas e relacionadas ao objetivo.
- Usar serviços HTTP centralizados e DTOs por operação; não acoplar componentes ao objeto Prisma inteiro.
- Quando for necessário novo contrato para uma funcionalidade já prevista, documentar proposta, implementar frontend/backend de forma coordenada na tarefa autorizada e validar. Nunca apresentar uma rota proposta como já existente.

### 0.5 Exceções permitidas, limites e condição de encerramento

“Exceção” significa adaptação temporária de desenvolvimento, não dispensa de autenticação, integridade ou validação.

| Exceção | Quando pode ser usada | Limite | Quando encerrar |
| --- | --- | --- | --- |
| Mocks sintéticos | API indisponível ou contrato bloqueado | Modo demonstrativo explícito; nunca fallback silencioso após falha real | Quando o serviço correspondente estiver validado e integrado |
| Token apenas em memória | Primeira integração autenticada | Recarregar pode exigir login; não fingir persistência | Quando a política de sessão for definida |
| URL de imagem em JSON | Upload multipart ainda com problema | Usar contrato existente e dados válidos; não simular upload | Após corrigir conversão de coordenadas, limites e autorização |
| Coordenadas manuais | Geocodificação ainda não existe | Validar números e limites; localização do navegador é opcional | Quando houver fluxo de localização definido |
| Campos antigos de consulta de Payment | Compatibilidade de consumidores existentes | Manter aliases to_date/due_date no backend; frontend novo prefere startDate/endDate | Quando migração de consumidores for decidida |
| JS no backend e TS no frontend | Preservação da base existente | Não iniciar conversão massiva nem misturar linguagens aleatoriamente | Pode permanecer como arquitetura definitiva |
| Arquivos Prisma/SQL/HTML/CSS e configuração | Suporte ao projeto | Não usar como pretexto para adicionar outra linguagem de aplicação | Exceção permanente de formato, não funcional |
| Integração de módulo adiada | Pendência concreta daquele módulo | Registrar motivo, manter ação não disponível ou demonstrativa; não anunciar conclusão | Depois de corrigir e verificar o bloqueio |

Não há exceção para exposição de hashes, autopromoção a admin/PREMIUM, acesso a recurso alheio, segredo fixo em produção, sucesso fictício ou perda silenciosa de dados. Não desativar essas proteções em modo de demonstração conectado a dados reais.

Exceções novas precisam indicar motivo, alcance, risco e condição de remoção. Se mudarem escopo, permissão ou arquitetura, obter decisão do usuário; caso sejam adaptações locais dentro das regras acima, registrar e seguir.

### 0.6 Verificação e relato ao final de cada tarefa

- Conferir o contrato usado e os estados carregando/vazio/erro da funcionalidade alterada.
- Para autenticação, permissões e persistência, testar sucesso e rejeição relevantes em ambiente próprio. `node --check` e build não comprovam autorização nem persistência no banco.
- Não exigir teste novo para toda mudança visual pequena; verificar o resultado proporcionalmente ao risco. Alterações sensíveis exigem evidência de comportamento.
- Não marcar como concluído algo que só possui mock ou que não foi executado. Distinguir **implementado**, **verificado** e **pendente**.
- Resumir arquivos alterados, comportamento resultante, verificações realmente executadas e bloqueios restantes. Atualizar este contexto quando contrato ou decisão mudar.
- Não declarar “API pronta”, “seguro” ou “funcionando” somente por inspeção estática.

### 0.7 Prompt de início de tarefa

> Leia arquitetura_com_biblioteca.md e contexto_com_biblioteca.md (ou suas cópias canônicas), começando pela autorização de biblioteca visual, depois a atualização de estado e a seção 0, e confira as fontes atuais antes de alterar código. Trabalhe no Voyage mantendo JavaScript no backend existente e TypeScript no frontend novo. Preserve Express, Prisma e PostgreSQL; use a base planejada React + Vite para as telas. Execute apenas a etapa solicitada e suas dependências necessárias. Respeite as exceções documentadas, sem inventar recursos ou contornar validações. Se a API não estiver disponível, avance com mocks sintéticos identificados. Ao terminar, informe o que foi implementado, o que foi realmente verificado e o que permanece pendente. Atualize os contratos deste contexto quando necessário.

## 1. Estado do projeto

O frontend parcial foi recebido em 21/09/2026. Na revisão histórica, o usuário informou que a API ainda não estava pronta; há uma base de backend que deve ser completada e validada, sem criar outra API paralela.

Nome identificado nos HTTP: Voyage. O package.json usa o nome técnico `kevin`, não necessariamente a marca.

Interpretação provisória: guia de estabelecimentos e serviços, com pesquisa por categoria/localização, usuários, responsáveis por empresas, favoritos modelados, níveis BASIC/PREMIUM e registros de pagamento associados a empresas. Confirmar finalidade comercial, benefícios dos níveis e significado dos pagamentos.

Não há produtos, carrinho, pedidos, delivery, reservas, estoque, gateway, QR Code de cobrança ou checkout apresentados. Não importar regras de outros projetos.

## 2. Fontes atuais e verificação

| Papel | Arquivos atuais |
| --- | --- |
| Serviços | company(2).js, payment(2).js, user(2).js, address(2).js |
| Roteadores | company(3).js, payment(3).js, user(3).js, address(3).js |
| Autenticação | auth(1).js |
| Exemplos de requisição | company(1).http, payment(1).http, user(1).http, address(1).http |
| Base mantida da entrega anterior | schema.prisma, migration_lock.toml, save.js, package.json |

Os sufixos dos anexos não definem camadas: `(2).js` são serviços e `(3).js` são rotas. No projeto, usar diretórios separados e nomes sem esses sufixos. Não substituir o serviço pelo roteador de mesmo nome.

Foram lidos os 13 anexos novos e comparados aos contratos anteriores. Os nove arquivos JavaScript novos passaram em `node --check`. Esse comando verifica sintaxe, sem resolver imports, validar Prisma, executar regras ou iniciar servidor.

Não foram modificados arquivos de código, feitas requisições remotas, instaladas dependências ou executadas migrações. Este documento foi atualizado.

Ainda não enviados: src/server.js, eventual configuração do app, migrações SQL, lockfile e exemplo de ambiente/CORS. Não enviar segredos reais; usar placeholders em `.env.example`.

## 3. Correções confirmadas nesta revisão

| Área | Situação atual |
| --- | --- |
| Company | POST/PUT/DELETE agora aplicam auth no roteador |
| Company | CNPJ normalizado sem máscara antes de salvar/consultar duplicidade |
| Company | evaluate é persistido na edição, inclusive valor zero |
| Company | Detalhe inexistente retorna 404; exclusão retorna objeto message |
| Company | Admin pode criar, editar e excluir; criação associa a empresa ao próprio admin |
| User | Cadastro valida nome, e-mail e senha obrigatórios; lista explícita de campos para Prisma |
| User | Cadastro público aceita client/owner, padrão client; rejeita admin |
| User | Alteração de type restrita a admin; leitura/edição rejeita ausência de sessão |
| User | sanitizeUser remove password dos retornos desse serviço |
| Payment | Serviços verificam sessão e propriedade da empresa; admin tem acesso global |
| Payment | Cadastro aceita companyId explícito, verifica empresa e trata ausência de empresas |
| Payment | Edição aplica toDate/dueDate do resultado validado |
| Payment | Filtro por intervalo usa gte/lte e aceita startDate/endDate, além dos aliases antigos |
| Payment | Cadastro usa handleErrors em vez de responder sempre 402 |
| Address | Logradouro aceita números; edição aceita url vazia |
| Address | Upload image integrado ao roteador e ao serviço |
| Address | companyId cria vínculo com empresa; edição acrescenta vínculo se ausente |
| Address | Admin pode editar/excluir; exclusão remove vínculos AddressCompany antes |
| HTTP | Base de cadastro do cliente unificada; vários IDs agora vêm das respostas |

Não manter essas questões como ausentes no planejamento. Há pendências e novos riscos descritos na seção seguinte.

## 4. Pendências prioritárias e correções propostas

### P0 — Retorno de senha pelo detalhe público de endereço

Fonte: address(2).js, showAddress; address(3).js, GET /:id.

O detalhe de endereço usa `include: { addressCompany: true, users: true }` e devolve o objeto integral. O roteador não exige auth nesse GET. Pelo schema mantido, User contém password (hash), e-mail, CPF e telefone. Portanto, se montado sem proteção externa, esse caminho expõe usuários associados, inclusive hashes. A criação e a edição de endereços também retornam users completos.

A correção em sanitizeUser só atua em user(2).js; não remove dados de usuários incluídos por outros serviços.

Ação: remover users das respostas que não precisam deles ou selecionar explicitamente campos autorizados. No detalhe público, evitar dados pessoais. Separar consultas públicas de estabelecimentos e consultas pessoais autenticadas. Verificar ausência de password de forma recursiva em todos os retornos, não apenas /user.

### P1 — Roteador de pagamentos ainda sem auth

Fonte: payment(3).js.

As cinco rotas continuam chamando serviços sem importar/aplicar auth. Os serviços agora recusam req.logged ausente. Se não houver middleware externo em src/server.js, as requisições válidas receberão 401 mesmo com Bearer; enviar o header não preenche req.logged sozinho. Não é correto continuar dizendo que os serviços de pagamento não verificam autorização: eles agora verificam, mas falta conectá-los à autenticação.

Ação: importar auth e aplicar `router.use(auth)` antes das rotas, ou adicionar auth em cada rota; conferir montagem no servidor. Não reabrir consultas anônimas para contornar o 401.

### P1 — Alteração do próprio plano ainda permitida

Fonte: user(2).js, editUser.

Ainda existe `if (signature) u.signature = signature` sem verificação de administrador ou regra comercial. Um usuário autorizado a editar seu perfil pode enviar PREMIUM. O cadastro ignora signature e usa BASIC do banco, mas a edição permanece aberta.

Ação: restringir alteração de signature no servidor a fluxo autorizado e validar enum. Não basta ocultar campo no frontend. Se plano puder ser livremente escolhido por decisão de produto, registrar essa regra explicitamente.

### P1 — Vínculo com empresa alheia

Fonte: address(2).js, createAddress e editAddress.

companyId é validado somente pela existência da empresa. Qualquer usuário autenticado pode criar endereço ligado a empresa alheia; quem pode editar um endereço pode acrescentar vínculo a outra empresa sem ser dono dela.

Ação: permitir associação apenas ao responsável pela empresa ou admin; conferir permissões do endereço e da empresa. Edição atualmente ADICIONA vínculo: não move nem substitui o anterior. Não apresentar no frontend como troca de empresa.

### P1 — Segredo JWT fixo permanece

Fonte: auth(1).js e user(2).js.

O middleware adicionou aviso quando JWT_SECRET falta, mas continua usando fallback fixo. O serviço de usuários também o mantém.

Ação: exigir segredo configurado no ambiente de uso real e falhar na inicialização se ausente; carregar configuração antes de importar os módulos que capturam o valor. Um aviso não elimina o fallback.

### P2 — Filtro de plano incompatível com schema

Fonte: user(2).js, readUser; schema.prisma.

Ainda usa `consult.signature = { contains: signature }`, embora signature seja enum BASIC/PREMIUM. Validar o valor e usar igualdade. O filtro não deve ser tratado como funcional até corrigido.

### P2 — Upload e edição multipart

Fonte: address(2).js e address(3).js.

- Criação converte lat/long com parseFloat; edição exige z.number. Campos multipart chegam como texto: PUT com imagem e coordenadas textuais não passa nessa validação. JSON numérico ou multipart sem coordenadas pode seguir outro caminho. Corrigir conversão/validação no backend antes de integrar formulário completo com imagem.
- Upload ocorre antes da validação dos campos e, na edição, antes da verificação de propriedade. Requisições rejeitadas podem deixar arquivos enviados ao ImgBB.
- Multer usa memória sem limite explícito de tamanho/tipo no código enviado.

Ação: autenticar, validar campos, conferir propriedade e impor limites/tipos antes de enviar ao provedor; padronizar números finitos de JSON e multipart. A chave IMG_BB_KEY fica somente no backend. Não prometer exclusão do arquivo remoto ao limpar url: isso não está implementado.

### P2 — Consistência e integridade

- Edição de Address cria o vínculo em uma chamada e atualiza o endereço em outra, sem transação. Exclusão remove vínculos antes de remover endereço, também sem transação. Falhas podem deixar alterações parciais; agrupar operações relacionadas.
- Schema anterior segue sem unique de e-mail/CNPJ e sem unicidade dos pares Favorite e AddressCompany. Normalização de novos CNPJs não corrige registros antigos com máscara. Tratar dados existentes antes de introduzir restrições/migrações.
- Exclusão de Company não trata dependências de pagamentos, favoritos e endereços; pode falhar com erro genérico. Definir política, sem apagar dependências silenciosamente.
- IDs usam isNaN ou coerce.number sem exigir sempre inteiro positivo; validar de forma consistente.
- Datas de consulta não validam formato nem início <= fim. Criação/edição também não verificam relação entre as duas datas. Definir regra de negócio e validar o estado final da edição.
- Payment trata todo não-admin como proprietário por vínculo; não exige literalmente type owner. Definir se client que ainda possua empresa pode operar pagamentos.
- Categoria combinada com favorito ainda é sobrescrita no filtro de endereços. radius continua sem validação positiva/finita e representa graus.
- attachSave continua reenviando o objeto inteiro e serviços devolvem o objeto anterior ao resultado do update, podendo retornar updatedAt antigo. Preferir atualização por campos explícitos e resultado salvo.
- Edição de CPF/telefone usa verificações de valor verdadeiro e não limpa campos com null/vazio.
- Confirmar comportamento das opções/mensagens usadas com a faixa Zod 4 declarada; não houve instalação/execução de dependências.

## 5. Exemplos HTTP: ajustes restantes

As novas senhas de owner/client contêm a palavra bloqueada `password`, ignorando maiúsculas. Embora tenham comprimento suficiente, o cadastro continua rejeitando esses exemplos. Não remover a proteção só para aceitar a fixture: escolher dados sintéticos compatíveis e manter cadastro/login consistentes. O login de conta antiga não reaplica validação de cadastro.

O bloco chamado “Criar admin” agora envia type client. Isso respeita o bloqueio de cadastro administrativo, mas não cria administrador: loginAdmin recebe um token de client se a conta não for promovida por um fluxo autorizado. Definir provisionamento do primeiro administrador em ambiente controlado; nomes de variáveis HTTP não concedem permissão. Após mudança de perfil, emitir novo token para refletir o tipo.

addressId é usado em uma consulta anterior ao bloco de criação; executar a criação antes ou reordenar os exemplos. Ainda há filtros com IDs fixos. DELETE /user continua comentado sem rota implementada. Não há exemplos multipart nem seleção explícita de empresa em Payment nos HTTP atualizados: acrescentá-los quando os contratos forem corrigidos.

Nenhuma credencial dos arquivos foi reutilizada ou publicada neste documento.

## 6. Modelo de dados mantido

PostgreSQL via DATABASE_URL. Prisma Client; todos os modelos têm id inteiro autoincrementado, createdAt e updatedAt.

| Modelo | Campos principais | Relações |
| --- | --- | --- |
| User | name, type, email, password obrigatórios; phone/cpf opcionais; signature BASIC/PREMIUM padrão BASIC | Empresas, favoritos e endereços |
| Company | name, category, cnpj, evaluate Float padrão 0, places, userId | Um usuário; vários pagamentos, favoritos e vínculos |
| Address | place, number, zipcode, lat, long, url obrigatórios no banco | Vários usuários e AddressCompany |
| Payment | companyId, toDate, dueDate, paymentForm, advertising, key, type obrigatórios | Uma empresa |
| Favorite | userId, companyId | Usuário–empresa |
| AddressCompany | companyId, addressId | Empresa–endereço |

User–Address é muitos-para-muitos. Um usuário pode ter várias empresas. Favorite e AddressCompany são tabelas explícitas. Não foi enviado novo schema ou save.js nesta revisão: não presumir que as pendências do banco foram alteradas.

A grafia da relação em Company continua `adrressCompany`; em Address é `addressCompany`. Não tratar esses nomes como intercambiáveis no Prisma. Benefícios de planos, pagamento de assinatura e avaliações individuais não estão modelados.

## 7. Tecnologias e ambiente

Faixas declaradas anteriormente: Express ^5.2.1; Prisma/@prisma/client ^6.19.2; Zod ^4.3.6; jsonwebtoken ^9.0.3; bcrypt ^6.0.0; Axios ^1.13.6; cors ^2.8.6; dotenv ^17.2.4; multer ^2.1.1; form-data ^4.0.5; nodemon ^3.1.11. Não são versões instaladas verificadas.

Scripts: dev usa nodemon src/server.js; start executa prisma migrate deploy e node src/server.js; migrate usa prisma migrate dev; generate/postinstall usam prisma generate; studio usa prisma studio.

migration_lock.toml só registra PostgreSQL; não substitui arquivos SQL. Confirmar ambiente e migrações em banco de teste antes de start/migrate.

Estrutura proposta: src/routes, src/services, src/middlewares/auth.js, src/utils/save.js, src/server.js, prisma/schema.prisma e prisma/migrations. Confirmar parser JSON, montagem dos prefixos, CORS, porta, configuração e tratamento de erros na entrada ainda ausente.

Variáveis de backend: DATABASE_URL, JWT_SECRET e IMG_BB_KEY para upload. Nenhuma deve entrar no bundle frontend. Os HTTP apontam a https://voyagegabi.onrender.com; esse endereço não foi testado e não comprova API pronta. Não usá-lo automaticamente para gravar dados.

## 8. Perfis e autenticação atuais

| Perfil | Permissões observadas no código |
| --- | --- |
| Visitante | Cadastro/login e consultas de empresas/endereços nos roteadores |
| client | Próprio perfil; endereços vinculados; pagamentos dependem de propriedade, não apenas do rótulo |
| owner | Criar empresa; editar/excluir suas empresas; operar pagamentos de suas empresas quando auth conectado |
| admin | Listar/editar usuários; criar/editar/excluir empresas; operar pagamentos; editar/excluir endereços |

Admin que cria Company torna-se seu userId. Não há cadastro de empresa em nome de outro proprietário nem transferência de propriedade apresentados.

POST /user/login recebe email/password e retorna message, token e user {id, name, type, email}. Cadastro retorna message, token e user sanitizado com mais campos. signature não está no login nem no token; consultar perfil se necessário.

Token contém sub, type, email, name; expira em um dia. Middleware faz jwt.verify e copia sub para req.logged.id sem normalização explícita ou busca atual do usuário. Mudanças de perfil não atualizam tokens emitidos. Não há refresh/revogação/recuperação de senha enviados.

Proposta frontend: sessão centralizada; token em memória inicialmente; decisão explícita sobre persistência entre recargas. Usar Authorization: Bearer. Logout local. 401 em chamada autenticada limpa sessão; 401 no login informa falha; 403 não implica logout. Nunca guardar senha após login.

## 9. Mapa das rotas pretendidas

Prefixos vêm dos HTTP; confirmar montagem no servidor.

| Método/caminho | Auth local | Retorno de sucesso |
| --- | --- | --- |
| POST /user | Não | 201 {message, token, user} |
| POST /user/login | Não | 200 {message, token, user} |
| GET /user | Sim, admin no serviço | 200 array sanitizado |
| GET /user/:id | Sim, próprio/admin | 200 usuário sanitizado |
| PUT /user/:id | Sim, próprio/admin | 202 usuário sanitizado |
| GET /company e /company/:id | Não | 200 array/objeto; detalhe inexistente 404 |
| POST /company | Sim, owner/admin | 201 objeto |
| PUT /company/:id | Sim, proprietário/admin | 202 objeto |
| DELETE /company/:id | Sim, proprietário/admin | 200 {message} |
| GET /address e /address/:id | Não | 200 array/objeto; revisar dados expostos |
| POST /address | Sim + upload.single('image') | 201 objeto com addressCompany e users, este último precisa correção |
| PUT /address/:id | Sim + upload.single('image') | 202 objeto com relações; proprietário/admin |
| DELETE /address/:id | Sim, vinculado/admin | 200 {message} |
| POST /payment | Ausente; serviço exige sessão | 201 objeto |
| GET /payment e /payment/:id | Ausente; serviço exige sessão/propriedade | 200 array/objeto com company |
| PUT /payment/:id | Ausente; serviço exige sessão/propriedade | 202 objeto |
| DELETE /payment/:id | Ausente; serviço exige sessão/propriedade | 200 {mensagem} |

Não há DELETE /user. Listagens retornam arrays diretos, sem paginação, total ou ordenação explícita.

Filtros: User aceita name/type/signature/email/phone/cpf, mas signature está quebrado; Company aceita name/places/category, sem userId; Address aceita lat/long/radius/user/company/category/favorite; Payment aceita companyId/startDate/endDate/to_date/due_date/paymentForm/advertising/type.

Consultas de Payment retornam company expandida. Listagem de Address retorna addressCompany (IDs do vínculo, não empresa expandida); detalhe/criação/edição também retornam users atualmente. Company e User não expandem relações automaticamente. Criar DTOs por operação, não exigir relações ausentes em todas as respostas.

## 10. Formulários e contratos

### Conta

- name: mínimo 3, letras, espaços, apóstrofos e hífen.
- email: formato de e-mail e consulta de duplicidade.
- password: mínimo 10, maiúscula e caractere não alfanumérico; rejeita 12345/qwerty/password sem distinguir maiúsculas.
- type no cadastro: client/owner, omitido vira client; não oferecer admin.
- phone/cpf: opcionais; cadastro salva null se vazios. CPF passa por dígitos verificadores; telefone por regex do serviço.
- signature: BASIC no cadastro pelo banco; edição ainda precisa de restrição. Não oferecer compra/troca livre de plano como pronta.
- Confirmação de senha é campo local; não enviar ao backend.

### Empresa

name mínimo 3; places mínimo 5; cnpj válido com transformação para dígitos; evaluate opcional numérico 0–5, agora editável inclusive zero; category exata:

Lanchonete, Restaurante, Pizzaria, Churrascaria, Supermercado, Farmácia, Serviços, Hospital, Outros, Bar.

Zero é padrão no banco, não comprova ausência de avaliações. Não chamar o campo de média nem mostrar contagem de votos. Não existem logo, telefone ou horário da empresa no contrato.

places é texto; vínculo estruturado pode ser criado por Address com companyId, mas exige correção de autorização. Ao criar empresa, usar seu ID retornado na operação seguinte, sem tratar falha da criação do endereço como rollback automático da empresa.

### Endereço e imagem

place mínimo 3 na criação, aceita letras/números/espaços/vírgula/ponto/hífen; edição sem mínimo explícito. number string com 1–6 dígitos e até uma letra; zipcode string com 8 dígitos, hífen opcional. lat -90..90; long -180..180. url opcional ou vazia, salva string no banco. companyId opcional numérico.

JSON envia lat/long como números. Multipart usa campo de arquivo `image`; deixar o navegador gerar Content-Type com boundary ao usar FormData. Antes de integrar edição multipart com coordenadas, corrigir conversão no backend. Imagem enviada prevalece sobre url. A remoção com url vazia só limpa a referência.

Edição com companyId acrescenta associação se não existe, sem remover a anterior. Não há operação de desvincular empresa nem de vincular outros usuários. Não há geocodificação, consulta CEP ou campos estruturados de cidade/estado/bairro/complemento.

Busca por lat/long usa caixa de coordenadas em graus, radius padrão 0.05, não raio em quilômetros e sem ordem de proximidade. favorite é ID do usuário. Não rotular “até 5 km”. Corrigir categoria+favorito e visibilidade pessoal antes de habilitar filtros combinados.

### Pagamentos

Criação: companyId opcional no schema; toDate/dueDate obrigatórios e convertidos a Date; paymentForm/advertising/key/type strings não vazias. Admin precisa informar companyId de empresa existente. Não-admin deve possuir a empresa informada; se omite, serviço escolhe a primeira e retorna 400 quando não tem nenhuma.

Proposta frontend: sempre enviar companyId selecionado para evitar ambiguidade. Edição não altera empresa; usa camelCase nas datas. Preferir startDate/endDate na consulta, com limites inclusivos aplicados a toDate; aliases to_date/due_date permanecem. Limites só de um lado são aceitos. Definir fuso/data civil e validação do intervalo; uma data final à meia-noite não equivale automaticamente a incluir todo o dia.

Não há valor/moeda/status de liquidação/gateway/comprovante. Tratar como registro de pagamento; PIX e phone são exemplos, não enums. Definir significado comercial dos campos antes de rótulos definitivos ou regras de assinatura.

## 11. Plano histórico do frontend — adaptar à implementação atual

Plano original: React + TypeScript + Vite, roteamento e cliente HTTP centralizado. A implementação parcial recebida está descrita na atualização inicial; as rotas abaixo são propostas históricas, não inventário das rotas atuais. Manter JavaScript no backend existente e TypeScript no frontend, conforme decisão do usuário. Confirmar versões na implementação. Começar com dados sintéticos e serviços substituíveis, avançando para API local validada. Não transformar bugs em requisitos da interface.

| Tela proposta | Conteúdo / condição |
| --- | --- |
| /empresas | Catálogo, busca, categoria, cards |
| /empresas/:id | Dados da empresa; endereço estruturado após revisão de vínculos |
| /entrar e /cadastro | Login e cadastro client/owner |
| /perfil | Dados pessoais, plano apenas informativo |
| /enderecos | Meus endereços após definir consulta pessoal autenticada |
| /enderecos/novo e /enderecos/:id/editar | Dados, imagem e empresa autorizada; corrigir upload/permissões |
| /painel/empresas | Empresas do responsável; falta consulta própria, GET atual não filtra userId |
| /painel/empresas/nova e /painel/empresas/:id/editar | Gestão com permissões atuais, inclusive admin |
| /painel/pagamentos | Empresa selecionada e registros após conectar auth |
| /admin/usuarios | Busca/edição, filtro de plano após correção |

Visibilidade de botões não substitui autorização no servidor. Não entregar ainda como funcional: exclusão de usuário, favoritagem gravável, avaliação individual, checkout, compra de plano ou desvinculação empresa–endereço.

Direção visual: português do Brasil, responsivo, busca destacada, categorias acessíveis, cards sem exigir fotos inexistentes. Identidade final ainda não confirmada; há aparência escura/roxa no código recebido, com mapa claro. Formulários com rótulos, foco de teclado, erros por campo; estados carregando/vazio/erro/sessão expirada, nova tentativa e confirmação de exclusão. Mocks identificados como demonstração, sem simular sucesso real.

Estrutura proposta: src/app (rotas/providers/layout); src/features/auth, companies, addresses, payments, users; src/components; src/services; src/types; src/mocks. Interfaces de serviços comuns a mock e HTTP, sem condicionais espalhados nas telas.

Variável pública futura VITE_API_BASE_URL aponta ao ambiente escolhido. Nunca incluir segredos no bundle. Usar URLSearchParams, whitelist de campos enviados e DTOs por operação. Documentos/CEP/telefone/número do endereço são strings; IDs/coordenadas/avaliação são números; datas no JSON são ISO. PUT é parcial conforme serviços, não presumir PATCH.

Normalizar error/erro/errors/detalhes/erroPrincipal/mensagemDoSistema/instrucaoParaCorrigir/solucoesDetalhadas e strings para {status, message, fieldErrors}. Não exibir detalhes do Prisma ao usuário. 404 mostra ausência; 409 duplicidade; distinguir rede e servidor; aceitar todos os sucessos 2xx esperados.

## 12. Próximos passos e critérios de aceite

1. Corrigir retorno público de usuários em Address, autorização do vínculo e alteração de signature.
2. Conectar auth de Payment e exigir segredo JWT; confirmar servidor, CORS e banco de teste.
3. Corrigir fixtures HTTP, provisionamento de admin, enum signature, multipart e transações.
4. Validar migrações, restrições, datas e consultas pessoais.
5. Construir layout/mocks; integrar catálogo, conta, empresas e endereços; depois pagamentos.
6. Definir benefícios BASIC/PREMIUM, regras comerciais e recursos adicionais antes de implementá-los.

Aceite de integração: autenticação ausente/válida/expirada; bloqueio de empresa e pagamento alheios; ausência recursiva de password em JSON; assinatura não alterável pelo usuário comum; cadastro admin recusado; owner/admin com zero/uma/várias empresas; evaluate zero persistido; datas persistidas e intervalo inválido recusado; multipart com coordenadas tratado; associação/exclusão atômicas; erros claros; layout em celular e teclado.

Esses testes de integração não foram executados. A única execução desta revisão foi verificação de sintaxe dos nove JS novos. Não afirmar que o backend está pronto ou seguro somente com esse resultado.

## 13. Instrução para continuidade

Estamos evoluindo o Voyage, com frontend parcial existente e backend historicamente parcial Express/Prisma/PostgreSQL. Para a tarefa visual atual, ler a atualização inicial e arquitetura.md antes de usar este plano histórico. Use as fontes atuais da seção 2, não os serviços antigos. Preserve correções já feitas: auth de Company, whitelist/sanitização de User, datas/propriedade em Payment, upload/vínculos de Address e novas permissões de admin.

Priorize os achados da seção 4: usuários completos no detalhe público de endereço, Payment sem middleware conectado, alteração livre de signature, associação a empresa alheia e fallback JWT. Não dizer que sanitizeUser protege respostas de Address. Não dizer que upload ou vínculo não existem; existem, mas precisam das correções indicadas.

Evolua o frontend existente em português, preservando integrações e separando demonstrações. Use mocks sintéticos identificados em ambiente de revisão visual. Não invente checkout, planos pagos, endpoints de favoritos ou exclusão de usuário. Não reutilize credenciais HTTP. Documente decisões e atualize este arquivo quando contratos forem corrigidos e testados. Este pedido gerou documentação, sem alterar o código. Nas próximas tarefas de implementação solicitadas, alterar os arquivos necessários dentro das regras da seção 0, sem exigir confirmação para cada ajuste rotineiro.
