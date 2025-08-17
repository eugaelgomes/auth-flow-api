const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const session = require("express-session");
const { getConnection } = require("@/services/db/db-connection");

require("dotenv").config();

const router = express.Router();

// 📌 Configuração da sessão
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

// 📌 Configuração do Passport
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/github/callback", // Atualize conforme necessário
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userRepository = require("@/repositories/UserRepository");
        const existingUser = await userRepository.findByGithubId(profile.id);

        if (existingUser) {
          return done(null, existingUser); // Usuário já existe no banco
        } else {
          // Criar um novo usuário caso não exista
          const insertResult = await userRepository.createGithubUser(
            profile.username,
            profile.displayName || profile.username,
            profile.id
          );

          const newUser = {
            db_user_id: insertResult.insertId,
            usuario: profile.username,
            nome: profile.displayName || profile.username,
            role: "user", // Define um role padrão
          };

          return done(null, newUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.db_user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(
      "SELECT db_user_id, usuario, nome, role FROM usuarios WHERE db_user_id = ? LIMIT 1",
      [id]
    );
    done(null, results[0]);
  } catch (error) {
    done(error);
  }
});

// 📌 Middleware do Passport
router.use(passport.initialize());
router.use(passport.session());

// 📌 Rota de login com GitHub
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// 📌 Callback após login com sucesso ou erro
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user; // Salva na sessão
    res.redirect("/dashboard"); // Redireciona para o painel
  }
);

// 🚪 Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    req.session.destroy();
    res.redirect("/");
  });
});

module.exports = router;
