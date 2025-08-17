const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { pool } = require("@/services/db/db-connection");

const sessionMiddleware = session({
  store: new pgSession({
    pool,
    tableName: "sessions",
    createTableIfMissing: true,
  }),
  name: "auth.sid", // Cookie session name
  secret: process.env.SESSION_SECRET || "sua_chave_secreta",
  resave: false,
  saveUninitialized: false,
  rolling: true, 
  cookie: {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});

module.exports = { sessionMiddleware };
