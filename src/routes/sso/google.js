const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
require("dotenv").config();

const router = express.Router();
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hora
    },
  })
);
router.use(passport.initialize());
router.use(passport.session());

// Configuração da estratégia do Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Aqui você pode verificar se o usuário já existe no banco de dados
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        };

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serializa o usuário na sessão
passport.serializeUser((user, done) => {
  done(null, user);
});

// Desserializa o usuário da sessão
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Rota para iniciar login com o Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  googleAuthRoutes
);

// Callback do Google
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/dashboard"); // Redireciona após login
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    req.session.destroy();
    res.redirect("/");
  });
});

router.post("/codaweb", googleAuthRoutes, (req, res) => {
  return "Deu certo.";
});

module.exports = router;
