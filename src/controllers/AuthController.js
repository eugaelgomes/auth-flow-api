const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const axios = require("axios");
const AuthRepository = require("@/repositories/AuthRepository");

const SECRET_KEY = process.env.SECRET_KEY_VARIABLE;

const CLIENT_IP = process.env.TOKEN_IP;

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;
    const clientIp = req.clientIp;
    const serverTime = new Date().toISOString();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await AuthRepository.findUserByUsername(username);

      if (!user) {
        return res.status(401).send("Usuário não encontrado!");
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send("Senha incorreta, tente novamente!");
      }

      const payload = {
        userId: user.user_db_id,
        username: user.username,
        email: user.email,
        name: user.full_name,
        role: user.role_id,
      };

      const token = jwt.sign(payload, SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "1h",
      });

      req.session.user = payload;
      req.session.token = token;

      // Salva informações de geolocalização
      try {
        const geoData = await this.getGeolocation(clientIp);
        await AuthRepository.logUserLocation(
          user.user_db_id,
          clientIp,
          serverTime,
          geoData ? JSON.stringify(geoData) : null,
          username
        );
      } catch (error) {
        console.error("Erro ao salvar geolocalização:", error);
      }

      return res.status(200).json({
        ...payload,
        token,
        message: "Login realizado com sucesso!!!",
        redirectUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Erro durante o login:", error);
      return res.status(500).send("Erro interno do servidor");
    }
  }

  async getProfile(req, res) {
    try {
      const user = await AuthRepository.findUserByUsername(req.user.username);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json({
        id: user.user_db_id,
        username: user.user_uid,
        name: user.full_name,
        role: user.role_id,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário autenticado:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao fazer logout:", err);
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie("token");
      res.status(200).json({ message: "Logout realizado com sucesso" });
    });
  }

  async getGeolocation(ip) {
    try {
      if (!ip || ip === "127.0.0.1" || ip === "::1") {
        return {
          ip: ip || "127.0.0.1",
          city: "Local",
          region: "Local",
          country: "Local",
          loc: "0,0",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
      const response = await axios.get(
        `https://ipinfo.io/${ip}?token=${CLIENT_IP}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao obter geolocalização:", error);
      return null;
    }
  }
}

module.exports = new AuthController();
