# Sistema G10 Faturamento

## 1. Visão Geral

Este projeto faz parte do Projeto Integrador 2026 do curso de Sistemas de Informação, envolvendo as disciplinas de Engenharia de Software, Programação Web e Banco de Dados..

O módulo desenvolvido é o G10 - Faturamento, responsável pelas cobranças financeiras geradas a partir de atendimentos realizados no sistema.

Link do github do projeto: https://github.com/MichaelZat/TRABALHO_INTEGRADOR
Link da api de faturamento: https://github.com/MichaelZat/API-INTEGRADOR-01-2026

O sistema permite:

- Cadastrar e consultar pacientes.
- Cadastrar e consultar convênios.
- Cadastrar consultas e seus itens.
- Gerar cobranças a partir de consultas realizadas.
- Aplicar cobertura de convênio no cálculo financeiro.
- Impedir cobrança duplicada para a mesma consulta.
- Aprovar cobranças com forma de pagamento.
- Listar cobranças aguardando pagamento.
- Atualizar status de pagamento.
- Atualizar automaticamente o status da cobrança por trigger no banco de dados.
- Consultar cobranças por paciente, período e tipo de serviço.
---

### Consome dados de:

- **G4 - Consultas:** consultas realizadas e seus itens.
- **G9 - Convênios:** regras de cobertura.

### Fornece dados para:

- Relatórios financeiros.
- Dashboards administrativos.

##  Stack Utilizada

### Frontend

- React 19
- React Router v7
- Bootstrap 5
- Axios

### Backend

- Node.js
- Express 5
- Sequelize 6
- ES Modules

### Banco de Dados

- PostgreSQL
- View
- Stored Procedure
- Trigger
- Chaves primárias e estrangeiras
- Transações para geração de cobrança

### Versionamento

- GitHub

##  Arquitetura do Projeto

O sistema está organizado em frontend e três backends:


frontend/
  src/
    componentes/
    paginas/
    servicos/

backend/
  controllers/
  models/
  index.js
  Banco.js

backend2/
  controllers/
  models/
  index.js
  Banco.js

backapi/
  controllers/
  models/
  index.js
  Banco.js


## Pré-requisitos

Antes de rodar o projeto, é necessário ter instalado:

Node.js
npm
PostgreSQL
Git

## Rodar o Backend 
cd backend
npm install
npm start

## Rodar o Backend 2
cd backend2
npm install
npm start

## Rodar o BackAPI
cd backapi
npm install
npm start


## Rodar o Frontend
cd frontend
npm install
npm start

