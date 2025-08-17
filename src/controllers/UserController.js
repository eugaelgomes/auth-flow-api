const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const UserRepository = require("@/repositories/UserRepository");
const EmailService = require("@/services/EmailService");

const saltRounds = 12;

function generateUserId(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let userId = "";
  for (let i = 0; i < length; i++) {
    userId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return userId;
}

function getCreationDate() {
  const data = new Date();
  return data.toISOString().slice(0, 19).replace("T", " ");
}

class UserController {
  async createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let { name, username, email, password } = req.body;
      password = await bcrypt.hash(password, saltRounds);
      const userId = generateUserId(10);
      const createdAt = getCreationDate();

      const existingUsers = await UserRepository.findByUsernameOrEmail(
        username,
        email
      );

      if (
        existingUsers.some(
          (user) => user.email === email && user.usuario === username
        )
      ) {
        return res.status(401).send("E-mail e usuário já existente!");
      } else if (existingUsers.some((user) => user.email === email)) {
        return res.status(401).send("Este e-mail já está sendo utilizado!");
      } else if (existingUsers.some((user) => user.usuario === username)) {
        return res.status(401).send("Este usuário já está sendo utilizado!");
      }

      await UserRepository.createUser(
        userId,
        name,
        email,
        username,
        password,
        createdAt
      );

      // Envio do email de boas-vindas
      try {
        await EmailService.sendWelcomeEmail(name, email, username);
      } catch (mailError) {
        console.error("Error sending welcome email:", mailError);
        // Não interrompe o fluxo se o email falhar
      }

      res.status(201).send("Usuário cadastrado com sucesso!");
    } catch (error) {
      console.error("Ocorreu um erro durante o processo", error);
      res
        .status(500)
        .send(
          "Houve um erro interno. Tente novamente mais tarde ou fale com o suporte."
        );
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await UserRepository.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).send("Erro interno do servidor.");
    }
  }
}

module.exports = new UserController();
