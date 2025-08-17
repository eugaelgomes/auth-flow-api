const express = require("express");
const jwt = require("jsonwebtoken"); // Instale com `npm install jsonwebtoken`
const { getConnection } = require("../../services/db/db-connection");
const router = express.Router();

const SECRET_KEY = process.env.SECRET_KEY_VARIABLE; // Substitua pela sua chave secreta real

// Middleware para verificar se o usuário é admin
function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header recebido:", authHeader); // Debug

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extraído:", token);

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
    console.log("Decoded Token:", decoded);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Acesso negado. Apenas administradores podem acessar.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

// Rota para buscar todos os usuários
router.get("/users", isAdmin, async (req, res) => {
  try {
    const userRepository = require("@/repositories/UserRepository");
    const users = await userRepository.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).send("Erro interno do servidor.");
  }
});

module.exports = router;
