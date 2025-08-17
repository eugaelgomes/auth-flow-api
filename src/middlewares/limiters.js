const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ⏳ Janela reduzida para 15 minutos
  max: 5000, // ⛔ Máximo de 5 tentativas de login por IP
  message: "Muitas tentativas de login. Tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.username || req.ip, // 🔥 Bloqueia por usuário E IP
  handler: (req, res) => {
    res.status(429).json({ message: "Muitas tentativas. Aguarde 15 minutos." });
  },
  skipSuccessfulRequests: true, // ✅ Reset ao logar com sucesso
});

module.exports = loginLimiter;
