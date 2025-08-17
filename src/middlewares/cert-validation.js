module.exports = (req, res, next) => {
  if (!req.client.authorized) {
    return res.status(401).send("Certificado de segurança inválido");
  }
  next();
};
