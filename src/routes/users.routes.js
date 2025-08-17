const express = require("express");
const { body } = require("express-validator");
const UserController = require("@/controllers/UserController");
const { verifyToken, isAdmin } = require("@/middlewares/auth/authMiddleware");

const router = express.Router();

const userValidation = [
  body("name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Somente letras são permitidas.")
    .isLength({ min: 1, max: 1000 })
    .escape()
    .withMessage("O nome não pode estar vazio."),
  body("username")
    .trim()
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage(
      "Caracteres inválidos, somente permitido letras, números e ., - ou _"
    )
    .isLength({ min: 6 })
    .escape()
    .withMessage("O usuário deve conter no mínimo seis (6) caracteres."),
  body("email")
    .isEmail()
    .normalizeEmail({ all_lowercase: true, gmail_remove_dots: false })
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("O e-mail é inválido!"),
  body("password")
    .isStrongPassword()
    .withMessage(
      "A senha deve conter no mínimo oito (8) caracters, contendo letras, números e símbolos."
    ),
];

router.post(
  "/create-account",
  userValidation,
  UserController.createUser.bind(UserController)
);
router.get("/users", isAdmin, UserController.getAllUsers.bind(UserController));

module.exports = router;
