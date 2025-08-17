const welcome_mail_message = require("@/services/email/greetings/welcome-mail");

class EmailService {
  async sendWelcomeEmail(name, email, username) {
    try {
      await welcome_mail_message(name, email, username);
      console.log("Email de boas-vindas enviado com sucesso para:", email);
      return true;
    } catch (error) {
      console.error("Erro ao enviar email de boas-vindas:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
