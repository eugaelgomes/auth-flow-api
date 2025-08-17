const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const PasswordRepository = require("@/repositories/PasswordRepository");
const mail_rescue_pass = require("@/services/email/token/mail-sender");

const call_help_url = "https://app.codaweb.com.br/auth/forget-password";

const getCurrentDateTimeUTCMinus3 = () => {
  const date = new Date();
  date.setHours(date.getHours() - 3);
  return date.toISOString().slice(0, 19).replace("T", " ");
};

class PasswordController {
  async forgotPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: "E-mail inválido", errors: errors.array() });
    }

    const email = req.body.email;

    try {
      console.log(`Verificando existência do e-mail: ${email}`);
      const userExists = await PasswordRepository.findUserByEmail(email);

      if (!userExists) {
        return res.status(400).json({ message: "Usuário não encontrado." });
      }

      const token = crypto.randomBytes(10).toString("hex");
      const currentDateTime = getCurrentDateTimeUTCMinus3();

      // Desativa tokens antigos
      await PasswordRepository.deactivateOldTokens(email);

      // Insere novo token
      await PasswordRepository.createToken(email, token, currentDateTime);

      // Envia o email com o token
      const emailResult = await mail_rescue_pass(email, token);

      if (!emailResult.success) {
        return res.status(500).json({
          message: "Erro ao enviar e-mail. Por favor, tente novamente.",
        });
      }

      return res.status(200).json({
        message: "Instruções de recuperação enviadas para seu e-mail.",
      });
    } catch (error) {
      console.error("Erro na recuperação de senha:", error);
      return res.status(500).json({
        message: "Erro ao processar solicitação. Tente novamente mais tarde.",
      });
    }
  }

  async resetPassword(req, res) {
    console.log("=== INÍCIO DO PROCESSAMENTO DE REDEFINIÇÃO DE SENHA ===");
    const { token, password: newPassword } = req.body;

    if (!token || !newPassword) {
      console.log("ERRO: Token ou senha não fornecidos");
      return res.status(400).json({
        message: "Token e nova senha são obrigatórios",
        received: {
          token: !!token,
          password: !!newPassword,
        },
      });
    }

    try {
      const tokenRecord = await PasswordRepository.findTokenByValue(token);
      console.log(
        "Resultado da consulta de token:",
        tokenRecord ? "Token encontrado" : "Token não encontrado"
      );

      if (!tokenRecord) {
        console.log("ERRO: Token inválido ou não encontrado");
        return res.status(400).json({
          message: `Token inválido, tente novamente ${call_help_url}`,
        });
      }

      const email = tokenRecord.email;
      console.log("Email associado ao token:", email);

      const userExists = await PasswordRepository.findUserByEmail(email);
      console.log(
        "Resultado da consulta de usuário:",
        userExists ? "Usuário encontrado" : "Usuário não encontrado"
      );

      if (!userExists) {
        console.log("ERRO: Email não encontrado na base de dados");
        return res.status(400).json({
          message: "Email não encontrado.",
        });
      }

      console.log("Gerando hash da nova senha");
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("Hash gerado com sucesso");

      console.log("Atualizando senha do usuário");
      await PasswordRepository.updateUserPassword(email, hashedPassword);
      console.log("Senha atualizada com sucesso");

      console.log("Removendo token utilizado do banco de dados");
      await PasswordRepository.deleteToken(token);
      console.log("Token removido com sucesso");

      console.log("=== REDEFINIÇÃO DE SENHA CONCLUÍDA COM SUCESSO ===");
      return res.status(200).json({
        message: "Senha atualizada com sucesso!",
      });
    } catch (error) {
      console.error("ERRO durante a redefinição de senha:", error);
      return res.status(500).json({
        message: "Erro ao processar a solicitação",
        error: error.message,
      });
    }
  }
}

module.exports = new PasswordController();
