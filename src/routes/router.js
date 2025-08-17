const express = require("express");
const authRoutes = require("@/routes/auth.routes");
const userRoutes = require("@/routes/users.routes");
const passwordRoutes = require("@/routes/password.routes");

const router = express.Router();

// Rotas de autenticação
router.use("/auth", authRoutes);

// Rotas de usuários
router.use("/users", userRoutes);

// Rotas de senha
router.use("/password", passwordRoutes);

module.exports = router;
