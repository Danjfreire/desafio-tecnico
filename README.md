# Desafio - API de pedidos

Este projeto foi construído utilizando NestJS e TypeORM para criar uma API RESTful que permite importar pedidos em um formato legado e consulta-los de forma estruturada através de endpoints dedicados.

O projeto utiliza uma arquitetura modular, separando as funcionalidades em diferentes módulos para facilitar a manutenção e escalabilidade seguindo os padrões recomendados pelo NestJS. A persistência dos dados é feita utilizando o TypeORM com um banco de dados PostgreSQL que está configurado para rodar em um container Docker. 

## Funcionalidades

- Importação de pedidos em formato legado.
- Consulta de listagem de pedidos, podendo filtrar por intervalos de datas
- Consulta de pedido por ID.

Todas as funcionalidades foram implementadas em duas versões da API: v1 e v2.

 - v1: Utiliza armazenamento em memória para persistência dos dados dos pedidos.
 - v2: Utiliza banco de dados PostgreSQL para persistência dos dados dos pedidos.

Obs: A versão v2 propositalmente não mantém os dados armazenados entre sessões.

## Como rodar o projeto

Requisitos: Node.js (v24), Docker

```
docker compose up -d (inicia a API e o banco de dados Postgres)
docker compose down (para os containers)
```

O projeto já inclui um arquivo `.env.example` com as variáveis de ambiente necessárias para a configuração do banco de dados PostgreSQL.

A API estará disponível em http://localhost:3000

Para visualizar a documentação interativa da API, acesse http://localhost:3000/api. Lá você poderá visualizar e testar todos os endpoint disponíveis.

## Testes

Foram implementados testes unitários, de integração e end-to-end utilizando Jest, Supertest e Testcontainers. Cada tipo de teste foi implementado para o cenário mais adequado.

Para rodar os testes automatizados, execute o comando:

```
npm run test
```

Os testes de integração e end-to-end utilizam Testcontainers para criar instâncias temporárias do banco de dados PostgreSQL, garantindo que os testes sejam executados em um ambiente isolado e consistente com um ambiente real de uso.