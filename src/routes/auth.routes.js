const express = require("express");
const { body } = require("express-validator");
const { verifyToken } = require("@/middlewares/auth/auth-middleware");
const AuthController = require("@/controllers/auth-controller");
const { loginLimiter } = require("@/middlewares/limiters");
const toString = require("@/middlewares/stringfy");

const router = express.Router();

router.post(
  "/signin",
  loginLimiter,
  [body("username").trim().escape(), body("password").trim()],
  toString,
  AuthController.login.bind(AuthController)
);

router.get("/me", verifyToken, AuthController.getProfile.bind(AuthController));

router.post("/logout", verifyToken, AuthController.logout.bind(AuthController));

module.exports = router;
