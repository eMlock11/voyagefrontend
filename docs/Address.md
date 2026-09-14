# Documentação da API de Endereços (Address)

Esta documentação descreve a API de Endereços, responsável por gerenciar os locais exibidos no mapa interativo do aplicativo (conforme demonstrado na imagem de referência). A API foi construída utilizando Node.js, Express, Prisma (ORM) e Zod para validação de dados.

## Visão Geral das Rotas e Funcionalidades

A API fornece um CRUD completo com foco em buscas avançadas por geolocalização, que são essenciais para a experiência de navegação e aplicação de filtros na interface do mapa.

### 1. Criação de Endereços (`createAddress`)
Cadastra novos estabelecimentos ou locais no banco de dados. 
- **Validação de Dados:** Utiliza `zod` para garantir a integridade dos dados:
  - Endereço e Número formatados e sem caracteres inválidos.
  - CEP no padrão `00000-000`.
  - Latitude e Longitude inseridas manualmente.
- **Upload de Imagens:** Suporta inclusão de URL para fotos do local. O código possui a função `uploadToImgBB` preparada para hospedar as imagens no serviço externo ImgBB.
- **Autenticação:** O endereço recém-criado é associado diretamente ao usuário logado na sessão (`req.logged.id`).

### 2. Busca e Filtros no Mapa (`readAddress`)
Esta é a rota principal que alimenta a interface do mapa no aplicativo. Ela retorna listas de endereços baseada em múltiplos parâmetros (query params):
- **Geolocalização (Raio de Proximidade):** Utilizando os parâmetros `lat`, `long` e `radius`, a API retorna os locais que estão dentro de um raio (padrão de ~5km). Isso permite desenhar o "círculo" de busca ao redor do usuário, como visto no mapa.
- **Categorias:** O mapa possui botões na parte inferior (ex: "Restaurante", "Farmácia"). Através do parâmetro `category`, a API cruza dados com o cadastro de Empresas (`Company`) e retorna apenas os locais correspondentes.
- **Personalização:** Suporta buscas por locais vinculados a uma empresa (`company`), aos locais criados por um usuário específico (`user`) ou à lista de favoritos (`favorite`).

### 3. Visualização Detalhada (`showAddress`)
Busca os dados detalhados e isolados de um ponto específico no mapa a partir de um ID, útil para abrir modais de informação do local.

### 4. Edição (`editAddress`) e Exclusão (`deleteAddress`)
Rotas para atualização e remoção de pontos no mapa.
- **Segurança de Acesso:** Ambas as rotas possuem uma verificação estrita: elas validam primeiro se o usuário autenticado na requisição é de fato um dos proprietários que tem vínculo com aquele endereço. Caso contrário, a ação é bloqueada com erro `403 Forbidden`.
