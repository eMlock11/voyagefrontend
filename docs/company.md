# Módulo: Empresa (Company)

> **Controle de Acesso:** Exclusivo para **Proprietários / Donos da Empresa** (`ROLE_OWNER` / `ADMIN`).

---

## 1. Visão Geral
Área gerencial e administrativa onde apenas os proprietários têm permissão para configurar a organização, gerenciar planos/assinatura, visualizar métricas consolidadas e controlar acessos corporativos.

---

## 2. Principais Funcionalidades

### 2.1. Perfil Corporativo
- Razão Social, Nome Fantasia, CNPJ/Registro e Endereço.
- Dados de contato, logotipo e identidade visual.

### 2.2. Gestão de Equipe & Níveis de Acesso
- Convidar, editar e desativar colaboradores.
- Atribuição de permissões (Administrador, Gerente, Operacional).

### 2.3. Assinatura & Faturamento
- Plano atual, limites de uso e histórico de faturas.
- Upgrade/Downgrade de plano e gestão de meios de pagamento.

### 2.4. Painel Executivo / KPIs
- Indicadores globais da empresa (receita, volume de operações e atividade da equipe).

### 2.5. Segurança & Auditoria
- Logs de atividades críticas da organização.
- Políticas de segurança (autenticação em duas etapas, expiração de sessões).

---

## 3. Regras de Negócio & Segurança
1. **RBAC Estrito:** Bloquear acesso em rotas (`/company/*`) e requisições de API para qualquer usuário sem permissão de dono.
2. **Multi-inquilino (Multi-tenant):** Todos os dados devem ser filtrados pelo `companyId` do proprietário logado.
3. **Ações Críticas:** Alterações societárias ou exclusão da conta exigem reautenticação com senha.
