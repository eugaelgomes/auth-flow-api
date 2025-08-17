const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const GitHubStrategy = require("passport-github2").Strategy;
const { getConnection } = require("@/services/db/db-connection");

const router = express.Router();

// Configuração da sessão do Passport
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

// Inicialização do Passport
router.use(passport.initialize());
router.use(passport.session());

// Configuração da estratégia do Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/sso/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
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

// Configuração da estratégia do GitHub
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/sso/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userRepository = require("@/repositories/UserRepository");
        const existingUser = await userRepository.findByGithubId(profile.id);

        if (existingUser) {
          return done(null, existingUser);
        } else {
          const insertResult = await userRepository.createGithubUser(
            profile.username,
            profile.displayName || profile.username,
            profile.id
          );

          const newUser = {
            db_user_id: insertResult.insertId,
            usuario: profile.username,
            nome: profile.displayName || profile.username,
            role: "user",
          };

          return done(null, newUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialização e desserialização do usuário
passport.serializeUser((user, done) => {
  done(null, user.db_user_id || user.id);
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

// Rotas do Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/dashboard");
  }
);

// Rotas do GitHub
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/dashboard");
  }
);

// Rota de logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    req.session.destroy();
    res.redirect("/");
  });
});

module.exports = router;
