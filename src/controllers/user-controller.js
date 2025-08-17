const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const UserRepository = require("@/repositories/user-repository");
const welcome_message = require("@/services/email/templates/welcome-mail");

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
        return res.status(401).send("User and email already exists!");
      } else if (existingUsers.some((user) => user.email === email)) {
        return res.status(401).send("Email is already in use!");
      } else if (existingUsers.some((user) => user.usuario === username)) {
        return res.status(401).send("Username is already in use!");
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
        await welcome_message(name, email, username);
      } catch (mailError) {
        console.error("Error sending welcome email:", mailError);
        // Não interrompe o fluxo se o email falhar
      }

      res.status(201).send("User registered successfully!");
    } catch (error) {
      console.error("An error occurred during the process", error);
      res
        .status(500)
        .send(
          "An internal error occurred. Please try again later or contact support."
        );
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await UserRepository.findAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).send("Internal server error.");
    }
  }
}

module.exports = new UserController();
