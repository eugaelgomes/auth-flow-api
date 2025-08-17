require("module-alias/register");
const { app } = require("@/app");
const port = process.env.APP_PORT ? Number(process.env.APP_PORT) : 8080;

try {
  // Verifica se a variável é um número
  if (!port || isNaN(port)) {
    console.error("Somente números no APP_PORT");
    process.exit(1);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log("Rodando na porta", port);
  });
} catch (error) {
  console.error("Erro ao iniciar a API :/", error);
}
