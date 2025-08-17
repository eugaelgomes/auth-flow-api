const { MailService } = require("../mail_config");

async function mail_rescue_pass(email, token) {
  // Verifica o ambiente atual
  const env = process.env.NODE_ENV || "development";

  // Define o link de redefinição baseado no ambiente
  let resetLink;
  if (env === "production") {
    resetLink = `https://codaweb.com.br/auth/reset-password?token=${token}`;
  } else {
    resetLink = `http://localhost:3000/?reset_token=${token}`;
  }

  let mailOptions = {
    from: "'support codaweb' <support@codaweb.com.br>",
    to: email,
    subject: "Recuperação de senha CodaWeb",
    text: `Seu token para recuperação de senha é: ${token}. Acesse ${resetLink} para redefinir sua senha.`,
    html: `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { width: 90%; margin: auto; padding: 20px; }
        header { background: #f8f8f8; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #fff; }
        .button { display: inline-block; padding: 10px 20px; background: #00be67; color: white; text-decoration: none; border-radius: 4px; }
        footer { background: #f8f8f8; padding: 10px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>CodaWeb</h1>
        </header>
        
        <div class="content">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a recuperação de senha da sua conta CodaWeb.</p>
          <p>Seu token para recuperação de senha é: <strong>${token}</strong></p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Redefinir Senha</a>
          </p>
          <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
        </div>
    
        <footer>
          <p>contato@codaweb.com.br</p>
          <p><a href="https://codaweb.com.br">www.codaweb.com.br</a></p>
        </footer>
      </div>
    </body>
    </html>
    `,
  };

  try {
    const transporter = MailService();
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: " + info.response);
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return { success: false, error: error.message };
  }
}

module.exports = mail_rescue_pass;
