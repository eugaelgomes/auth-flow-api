const welcome_mail_message = require("@/services/email/greetings/welcome-mail");

class EmailService {
  async sendWelcomeEmail(name, email, username) {
    try {
      await welcome_mail_message(name, email, username);
      console.log("Welcome mail sent to:", email);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
