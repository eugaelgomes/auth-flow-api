const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { pool } = require("@/services/db/db-connection");

const sessionMiddleware = session({
  store: new pgSession({
    pool,
    tableName: "sessions", // Nome da tabela para armazenar as sessões
    createTableIfMissing: true, // Cria a tabela se não existir
  }),
  name: "auth.sid", // Nome do cookie de sessão
  secret: process.env.SESSION_SECRET || "sua_chave_secreta",
  resave: false,
  saveUninitialized: false,
  rolling: true, // Reinicia o tempo de expiração a cada requisição
  cookie: {
    httpOnly: true, // Previne acesso ao cookie via JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Proteção contra ataques CSRF
    maxAge: 1000 * 60 * 60 * 24, // 1 dia
  },
});

module.exports = sessionMiddleware;
