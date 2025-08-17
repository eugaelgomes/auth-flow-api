const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY_VARIABLE;

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn("Atenção: Nenhum token foi enviado na requisição.");
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.warn("Atenção: Token mal formatado ou ausente.");
    return res.status(401).json({ message: "Formato de token inválido." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header recebido:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extraído:", token);

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
    console.log("Decoded Token:", decoded);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Acesso negado. Apenas administradores podem acessar.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

module.exports = {
  verifyToken,
  isAdmin,
};
