const express = require("express");
const { body } = require("express-validator");
const UserController = require("@/controllers/user-controller");
const { isAdmin } = require("@/middlewares/auth/auth-middleware");

const router = express.Router();

const dataValidator = [
  body("name")
    .trim()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Only letters are allowed.")
    .isLength({ min: 1, max: 1000 })
    .escape()
    .withMessage("Name cannot be empty."),
  body("username")
    .trim()
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Invalid characters, only letters, numbers, ., - or _ are allowed")
    .isLength({ min: 6, max: 18 })
    .escape()
    .withMessage("Username must be at least six (6) characters long and not exceed eighteen (18) characters."),
  body("email")
    .isEmail()
    .normalizeEmail({ all_lowercase: true, gmail_remove_dots: false })
    .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Email is invalid."),
  body("password")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least eight (8) characters, including letters, numbers, and symbols."
    ),
  body("role")
    .trim()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'.")
    .isAlpha()
    .withMessage("Role must contain only letters.")
];

router.post(
  "/create-account",
  dataValidator,
  UserController.createUser.bind(UserController)
);
router.get("/users", isAdmin, UserController.getAllUsers.bind(UserController));

module.exports = router;
