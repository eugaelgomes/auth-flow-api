const { MailService } = require("./../mail_config");

async function welcome_mail_message(name, email, username) {
  let mailOptions = {
    from: "support codaweb <support@codaweb.com.br>",
    to: email,
    subject: "Welcome to Codaweb",
    html: `
        <!DOCTYPE html>
        <html lang="en-US">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="x-apple-disable-message-reformatting">
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 0; margin: 0; }
          .container { width: 80%; margin: auto; overflow: hidden; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
          header {
            background: #00be67;
            color: #fff;
            padding: 20px;
            text-align: center;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
          }
          footer { background: #333; color: #fff; text-align: center; padding: 20px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }
          main { padding: 20px; }
          .title { color: #fff; font-weight: 800; }
          .sub-header { background: #e0f7f1; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
          .social-icons { display: flex; justify-content: center; padding: 20px 0; }
          .social-icons img { width: 24px; height: 24px; margin: 0 10px; }
          a { text-decoration: none; color: #00be67; }
          .content { margin-bottom: 20px; }
          .button { background: #00be67; color: #fff; padding: 10px 20px; border-radius: 5px; text-align: center; display: inline-block; margin: 20px 0; }
          .button:hover { background: #009e57; }
        </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1 class="title">CodaWeb</h1>
            </header>
            
            <main>
              <section class="sub-header">
                <h2>Bem-vindo(a) ao Codaweb!</h2>
                <p>Olá ${name},</p>
                <p>Estamos muito felizes em tê-lo(a) conosco. Seu cadastro foi realizado com sucesso e agora você faz parte da nossa comunidade de tecnologia.</p>
              </section>
              <section class="content">
                <p>Seu nome de usuário é: <strong>${username}</strong></p>
                <p>Se precisar de qualquer ajuda, não hesite em nos contatar através do email abaixo.</p>
                <a href="https://codaweb.com.br" class="button">Visite nosso site</a>
              </section>
            </main>
        
            <footer>
              <p>contato@codaweb.com.br</p>
              <a href="https://codaweb.com.br"><p>www.codaweb.com.br</p></a>
            </footer>
          </div>
        </body>
        </html>
        `,
  };
  const info = await MailService().sendMail(mailOptions);
  console.log("Email enviado: " + info.response);
}

module.exports = welcome_mail_message;
