# WE Tech Store — versão real

## Funcionalidades
- Loja pública moderna.
- Produtos com imagem/ícone.
- Área Admin protegida.
- Palavra-passe inicial do Admin: `200812` (recomenda-se mudar para `ADMIN_PASSWORD` no `.env`).
- Adicionar, editar e apagar produtos.
- Upload de imagem do produto para PostgreSQL (BYTEA), evitando depender do disco local do servidor.
- Criação de contas de clientes.
- Login/logout de clientes.
- Carrinho.
- Registo de compras/pedidos por cliente.
- Histórico de compras.
- Feedback por compra.
- Botão de WhatsApp.
- Link de partilha da loja.
- Contagem de partilhas.
- Stock.
- Painel administrativo com clientes, pedidos e feedbacks.

## Executar localmente
1. Instalar Node.js 20+.
2. Criar uma base PostgreSQL.
3. Copiar `.env.example` para `.env`.
4. Configurar `DATABASE_URL`.
5. `npm install`
6. `npm start`
7. Abrir `http://localhost:3000`

## Produção
Use PostgreSQL gerido e uma variável `DATABASE_URL`. O sistema cria as tabelas automaticamente no arranque.

A imagem enviada pelo Admin fica na base de dados, portanto não depende do armazenamento temporário do servidor.

## Segurança
A palavra-passe `200812` foi colocada como valor inicial porque foi solicitada. Em produção, altere `ADMIN_PASSWORD` no ambiente do servidor e mantenha `SESSION_SECRET` secreto.
