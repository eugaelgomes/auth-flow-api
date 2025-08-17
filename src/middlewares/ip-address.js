const getClientIp = (req, res, next) => {
  // Tenta obter o IP de várias fontes possíveis
  req.clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress ||
    "127.0.0.1";

  // Remove IPv6 prefix se existir
  if (req.clientIp.substr(0, 7) === "::ffff:") {
    req.clientIp = req.clientIp.substr(7);
  }

  next();
};

module.exports = getClientIp;
