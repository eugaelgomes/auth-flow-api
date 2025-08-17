const errorHandler = {
  // Middleware de erro 404 para rotas não encontradas
  notFoundHandler: (req, res, next) => {
    const err = new Error(`Rota "${req.originalUrl}" não encontrada`);
    err.statusCode = 404;
    next(err);
  },

  // Global error handler
  globalErrorHandler: (err, req, res, next) => {
    // Log in development
    if (process.env.NODE_ENV !== "production") {
      console.error(err.stack);
    }

    // Error response formatting
    res.status(err.statusCode || 500).json({
      error: {
        message: err.message || "Internal Server Error",
        status: err.statusCode || 500,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
      },
    });
  },
};

module.exports = errorHandler;
