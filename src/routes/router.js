const express = require("express");
const authRoutes = require("@/routes/auth.routes");
const userRoutes = require("@/routes/users.routes");
const passwordRoutes = require("@/routes/password.routes");

const router = express.Router();

// Authentication routes
router.use("/auth", authRoutes);

// User routes
router.use("/users", userRoutes);

// Password routes
router.use("/password", passwordRoutes);

module.exports = router;
