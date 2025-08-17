const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { getClientIp } = require("@/middlewares/ip-address");
const { loginLimiter } = require("@/middlewares/limiters");
const { sessionMiddleware } = require("@/middlewares/session");

function configureGlobalMiddlewares(app) {
  // Session
  app.use(sessionMiddleware);

  // Parse of request bodies
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Trust proxy
  app.set("trust proxy", 1);

  // Middleware IP
  app.use(getClientIp);
  
  app.use(loginLimiter);

  // CORS Setup
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
  app.use(cors(corsOptions));

  // Helmet security middleware
  app.use(
    helmet({
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
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

  // Limiters
}

module.exports = configureGlobalMiddlewares;
