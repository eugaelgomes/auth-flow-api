const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./users.routes");
const passwordRoutes = require("./password.routes");
//const ssoRoutes = require("./sso/sso.routes");

const router = express.Router();

// Rotas de autenticação tradicional
router.use("/auth", authRoutes);

// Rotas de autenticação SSO
//router.use("/auth/sso", ssoRoutes);

// Rotas de usuário
router.use("/users", userRoutes);

// Rotas de gerenciamento de senha
router.use("/password", passwordRoutes);

module.exports = router;
