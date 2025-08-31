require("module-alias/register");
const { app } = require("@/app");
const port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 8080;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at port: ${port}`);
});

// Configurar timeout para evitar conexões penduradas
server.timeout = 30000; // 30 segundos

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Initiating graceful shutdown...");
  server.close(() => {
    console.log("Server closed successfully");
    process.exit(0);
  });

  // Força o fechamento após 30 segundos
  setTimeout(() => {
    console.error(
      "Not able to close connections in 30s, forcing shutdown"
    );
    process.exit(1);
  }, 30000);
});

process.on("uncaughtException", (error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled promise:", reason);
  process.exit(1);
});
