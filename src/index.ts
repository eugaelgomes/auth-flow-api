require("module-alias/register");
const { app } = require("@/app");
const port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 8080;

try {
  // Verifica se a variável é um número
  if (!port || isNaN(port)) {
    console.error("Invalid port number in APP_PORT");
    process.exit(1);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log("Running on port", port);
  });
} catch (error) {
  console.error("Error starting API:", error);
}
