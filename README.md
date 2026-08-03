# SyncTime Back-End

API do SyncTime, responsável por autenticação, usuários, categorias, tipos de registro, campos personalizados, relatórios mensais, transações, rotinas, anotações, notificações, dashboard analítico, exportações e comunicação em tempo real.

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=fff)
![Express](https://img.shields.io/badge/Express-5.1-000?logo=express&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-TypeORM-4169E1?logo=postgresql&logoColor=fff)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=fff)
![License](https://img.shields.io/badge/license-MIT-green)

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Arquitetura](#arquitetura)
- [Rotas da API](#rotas-da-api)
- [Banco de dados](#banco-de-dados)
- [Tempo real](#tempo-real)
- [Testes](#testes)
- [Deploy](#deploy)

## Sobre o projeto

O SyncTime Back-End é uma API REST construída com Node.js, TypeScript e Express. A aplicação utiliza PostgreSQL para as entidades relacionais principais e MongoDB para campos personalizados e valores dinâmicos associados às transações.

O servidor expõe as rotas REST sob o prefixo `/api`, disponibiliza documentação Swagger em `/api-docs` e inicializa Socket.IO no mesmo servidor HTTP para entregar notificações em tempo real ao front-end.

## Funcionalidades

- Autenticação com JWT, validação de token, login, logout e controle de sessão.
- Cadastro, edição, exclusão, busca e recuperação de senha de usuários.
- Upload de avatar com Multer e armazenamento no Cloudinary.
- Perguntas de segurança para recuperação de acesso.
- Gestão de categorias, tipos de registro e campos personalizados.
- Relatórios mensais por categoria.
- Transações vinculadas a registros mensais, incluindo valores de campos customizados.
- Exportação de transações em CSV, XLSX e PDF por stream.
- Dashboard analítico com agregações para gráficos, histogramas, séries temporais, progresso de metas e campos customizados.
- Calendário operacional com rotinas e anotações.
- Geração automática de resumo do dia a partir das anotações.
- Notificações persistidas em banco e emitidas em tempo real via Socket.IO.
- Ranking, streak/ofensiva e presença mensal do usuário.
- Migrations TypeORM para evolução do schema relacional.
- Testes unitários com Jest e ts-jest.
- Documentação Swagger/OpenAPI.

## Tecnologias

### Base

- Node.js
- TypeScript
- Express 5
- TypeORM
- Mongoose
- PostgreSQL
- MongoDB

### Autenticação e segurança

- JSON Web Token
- bcrypt
- CORS
- env-var
- dotenv

### Arquivos, exportações e mídia

- Multer
- Cloudinary
- csv-stringify
- ExcelJS
- PDFKit
- Node streams

### Tempo real e documentação

- Socket.IO
- swagger-jsdoc
- swagger-ui-express
- Winston

### Qualidade e testes

- Jest
- ts-jest
- ESLint
- Prettier
- ts-node-dev

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- PostgreSQL disponível.
- MongoDB disponível.
- Conta Cloudinary para upload de avatares.
- Variáveis de ambiente configuradas.

## Configuração do ambiente

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=synctime

MONGODB_URL=mongodb://localhost:27017/synctime
MONGODB_NAME=synctime

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

JWT_SECRET=sua_chave_jwt
UPLOAD_TEMP_DIR=uploads/temp
```

3. Para ambientes de teste, as configurações de PostgreSQL também aceitam:

```env
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USER=test
TEST_DB_PASS=test
TEST_DB_NAME=test
```

> Não versione chaves reais, credenciais de banco ou segredos JWT.

## Scripts disponíveis

```bash
npm run dev
```

Inicia a API em modo desenvolvimento com `ts-node-dev`.

```bash
npm run build
```

Compila o TypeScript para `dist/`.

```bash
npm start
```

Executa a versão compilada em `dist/src/server.js`.

```bash
npm test
```

Executa checagem TypeScript sem emissão e roda os testes Jest em série.

```bash
npm run test:all
```

Alias para `npm test`.

```bash
npm run migration:generate -- src/migrations/NomeDaMigration
```

Gera uma migration TypeORM usando `src/loaders/dataSource.ts`.

```bash
npm run migration:run
```

Executa as migrations pendentes.

## Estrutura de pastas

```text
src/
  auth/                    # Interfaces e autenticação de usuário
  config/                  # Configurações de Postgres, MongoDB, Cloudinary, Swagger e Socket.IO
  data/                    # Use cases, validações, erros e contratos de aplicação
  docs/                    # Documentação Swagger por domínio
  domain/                  # Entidades e modelos de domínio
  infra/                   # Repositórios de Postgres e MongoDB
  lib/                     # Instância global e inicialização do Socket.IO
  loaders/                 # Inicialização de dotenv, bancos e logger
  main/                    # Factories de controllers, use cases e middlewares
  migrations/              # Migrations TypeORM
  presentation/            # Rotas, controllers, middlewares e protocolos HTTP
  utils/                   # Adaptadores e utilitários de resposta
  server.ts                # Bootstrap HTTP, Swagger, rotas e Socket.IO
  routes.ts                # Registro central das rotas da API

tests/
  unit/                    # Testes unitários e mocks por domínio

types/
  express/                 # Extensões de tipos do Express
```

## Arquitetura

O projeto segue uma separação por camadas:

- `presentation`: recebe requisições HTTP, valida acesso por middleware e chama controllers.
- `main`: monta factories para controllers, use cases, repositórios e middlewares.
- `data`: concentra regras de aplicação, validações Yup, erros e contratos dos use cases.
- `infra`: implementa persistência em PostgreSQL e MongoDB.
- `domain`: define entidades TypeORM, schemas Mongoose e modelos usados pela aplicação.
- `loaders`: inicializa serviços externos e conexões.

Fluxo típico:

```text
Route -> Middleware -> Controller -> Use Case -> Repository -> Database
```

## Rotas da API

Todas as rotas REST ficam sob o prefixo `/api`.

### Sistema

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/health` | Não | Health check da API |
| POST | `/auth/validate` | Sim | Validação de token e sessão |

### Usuários

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/user/find-questions` | Não | Busca perguntas de segurança por login |
| GET | `/user/get-presence` | Sim | Retorna presença mensal do usuário |
| GET | `/user/get-streak` | Sim | Retorna streak/ofensiva |
| GET | `/user/rank` | Sim | Retorna ranking de usuários |
| GET | `/user/find-user/:id` | Sim | Busca usuário por ID |
| GET | `/user/inbox` | Sim | Retorna caixa de entrada do usuário |
| POST | `/user/register` | Não | Cadastra usuário com upload opcional de avatar |
| POST | `/user/login` | Não | Autentica usuário |
| POST | `/user/logout` | Sim | Encerra sessão |
| PATCH | `/user/forgot-password` | Não | Inicia recuperação de senha |
| PATCH | `/user/reset-password` | Sim | Redefine senha |
| PATCH | `/user/edit/:id` | Sim | Edita usuário com upload opcional de avatar |
| DELETE | `/user/delete/:id` | Sim | Remove usuário |

### Categorias

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/category/userId` | Sim | Lista categorias do usuário |
| GET | `/category/:id` | Sim | Busca categoria por ID |
| POST | `/category/create` | Sim | Cria categoria |
| PATCH | `/category/edit/:id` | Sim | Edita categoria |
| DELETE | `/category/delete/:id` | Sim | Remove categoria |

### Tipos de registro

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/record-types/userId` | Sim | Lista tipos de registro do usuário |
| GET | `/record-types/:id` | Sim | Busca tipo de registro por ID |
| POST | `/record-types/create` | Sim | Cria tipo de registro |
| PATCH | `/record-types/edit/:id` | Sim | Edita tipo de registro |
| DELETE | `/record-types/delete/:id` | Sim | Remove tipo de registro |

### Campos personalizados

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/custom-fields/userId` | Sim | Lista campos personalizados do usuário |
| GET | `/custom-fields/get-by-record-type` | Sim | Busca campos por categoria e tipo de registro |
| GET | `/custom-fields/:id` | Sim | Busca campo personalizado por ID |
| POST | `/custom-fields/create` | Sim | Cria campo personalizado |
| PATCH | `/custom-fields/edit/:id` | Sim | Edita campo personalizado |
| DELETE | `/custom-fields/delete/:id` | Sim | Remove campo personalizado |

### Relatórios mensais

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/monthly-record/userId` | Sim | Lista registros mensais do usuário |
| GET | `/monthly-record/:id` | Sim | Busca registro mensal por ID |
| POST | `/monthly-record/create` | Sim | Cria registro mensal |
| PATCH | `/monthly-record/edit/:id` | Sim | Edita registro mensal |
| DELETE | `/monthly-record/delete/:id` | Sim | Remove registro mensal |

### Transações

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/transactions/userId` | Sim | Lista transações do usuário |
| GET | `/transactions/export` | Sim | Exporta transações em `csv`, `xlsx` ou `pdf` |
| GET | `/transactions/:id` | Sim | Busca transação por ID |
| POST | `/transactions/create` | Sim | Cria transação |
| PATCH | `/transactions/edit/:id` | Sim | Edita transação |
| DELETE | `/transactions/delete/:id` | Sim | Remove transação |

### Rotinas e anotações

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/routines/userId` | Sim | Lista rotinas do usuário |
| GET | `/routines/:id` | Sim | Busca rotina por ID |
| POST | `/routines/create` | Sim | Cria rotina |
| PATCH | `/routines/edit/:id` | Sim | Edita rotina |
| DELETE | `/routines/delete/:id` | Sim | Remove rotina |
| GET | `/notes/userId` | Sim | Lista anotações do usuário |
| GET | `/notes/:id` | Sim | Busca anotação por ID |
| POST | `/notes/create` | Sim | Cria anotação |
| POST | `/notes/create/summary-day` | Sim | Gera resumo do dia |
| PATCH | `/notes/edit/:id` | Sim | Edita anotação |
| DELETE | `/notes/delete/:id` | Sim | Remove anotação |

### Notificações e dashboard

| Método | Rota | Protegida | Descrição |
| --- | --- | --- | --- |
| GET | `/notification/userId` | Sim | Lista notificações do usuário |
| GET | `/notification/count/new-notification` | Sim | Conta novas notificações |
| GET | `/notification/:id` | Sim | Busca notificação por ID |
| POST | `/notification/delete` | Sim | Remove notificações |
| PATCH | `/notification/mark-read` | Sim | Marca notificações como lidas |
| PUT | `/notification/mark-read-new-notification-all` | Sim | Marca todas as novas notificações como vistas |
| GET | `/dashboard/category` | Sim | Retorna dados analíticos de categorias |

## Banco de dados

### PostgreSQL

Entidades relacionais principais:

- `users`
- `security_questions`
- `authentication`
- `record_types`
- `categories`
- `monthly_records`
- `transactions`
- `routines`
- `notes`
- `notifications`
- `user_monthly_entry_rank`

As migrations ficam em `src/migrations` e são executadas pelo TypeORM.

### MongoDB

Usado para dados dinâmicos:

- Definições de campos personalizados.
- Valores de campos personalizados vinculados às transações.

## Tempo real

O Socket.IO é inicializado em `src/server.ts` e configurado por `src/config/socketIo.ts`.

Fluxo de autenticação do socket:

1. Cliente conecta.
2. Servidor envia `welcome`.
3. Cliente emite `auth` com `{ userId }`.
4. Servidor adiciona o socket à sala `user_<userId>`.
5. Use cases emitem `newNotification` para a sala do usuário.

## Uploads

O upload de avatar usa:

- Campo multipart: `avatar`.
- Limite: 5 MB.
- Apenas arquivos com `mimetype` iniciado por `image/`.
- Diretório temporário padrão: `uploads/temp`.
- Destino final: Cloudinary, pasta `users/avatars`.

## Documentação Swagger

Com a API em execução, acesse:

```text
http://localhost:3000/api-docs
```

Os arquivos de documentação ficam em `src/docs/swagger`.

## Testes

Os testes ficam em `tests/unit` e cobrem use cases por domínio, com mocks em `tests/unit/mocks`.

Para executar:

```bash
npm test
```

O comando também roda:

```bash
tsc --skipLibCheck --noEmit
```

## Deploy

O projeto possui `vercel.json` configurado para deploy serverless via `@vercel/node`, apontando `src/server.ts` como entrada.

Para deploy em ambiente tradicional:

```bash
npm run build
npm start
```

Em produção, configure:

- `NODE_ENV=production`
- variáveis de PostgreSQL com SSL quando necessário
- `MONGODB_URL`
- credenciais do Cloudinary
- `JWT_SECRET` forte
- CORS compatível com o domínio do front-end

## Observações importantes

- O arquivo `.env` está no `.gitignore` e não deve ser versionado.
- O Swagger ainda usa título e descrição genéricos em `src/config/swagger.ts`; ajuste antes de uma publicação pública.
- Em produção, restrinja o `origin` do CORS e do Socket.IO para domínios conhecidos.
- O projeto usa alias `@/*` apontando para `src/*`.
- A saída compilada fica em `dist/`.

## Licença

Distribuído sob licença MIT. Consulte `LICENSE` para mais detalhes.
