const express = require("express");
//const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const limiters = require("@/middlewares/limiters");
const routers = require("@/routes/router");

dotenv.config();

const app = express();

//app.use(ip_address.mw());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1h
    },
  })
);

// Requerimento das origens permitidas pelo CORS, múltiplas
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Origin not allowed!"));
      console.log(origin);
    }
  },
  optionsSuccessStatus: 200,
};

const getClientIp = require("@/middlewares/ip-address");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("trust proxy", 1);
app.use(getClientIp);

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    // Proteção contra fontes estranhas
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          process.env.TRUSTED_CDN || "https://trusted.cdn.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Suspicious traffic limiter
app.use(limiters);

// API functional routes
app.use("/auth", routers);
app.use((err, req, res, next) => {
  // if (process.env.NODE_ENV !== "production") {
  //  console.error(err.stack);
  // }
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "An internal server error occurred",
    },
  });
});

app.all("*", (req, res, next) => {
  const err = new Error(`Route "${req.originalUrl}" not found`);
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    error: err.message || "Internal Server Error",
  });
});

module.exports = { app };
