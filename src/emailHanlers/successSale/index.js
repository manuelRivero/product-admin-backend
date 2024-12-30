const path = require("path");
const nodemailer = require("nodemailer");
const fs = require("fs").promises; // Usa promisify implícito con fs.promises
const handlebars = require("handlebars");

// __filename y __dirname ya están disponibles globalmente en CommonJS.
console.log("__dirname", path.resolve(__dirname, "../../templates/success-sale/success-email.html"))
const sendSuccessEmail = async ({
  products,
  names,
  user,
  tenant,
  total,
  payment_id,
}) => {
  try {
    // Carga y compila la plantilla de email
    const templateFile = await fs.readFile(
      path.resolve(__dirname, "../../templates/success-email.html"),
      "utf-8"
    );
    const template = handlebars.compile(templateFile);

    // Reemplaza los datos
    const replacements = { products, names, user, tenant, total, payment_id };
    const finalHtml = template(replacements);

    // Configuración del email
    const mailOptions = {
      from: "contacto@lorem-insights.com",
      to: user, // Se asume que el usuario tiene un email
      subject: "Confirmación de tu compra",
      html: finalHtml,
    };

    // Configuración del transportador
    const transporter = nodemailer.createTransport({
      host: "c2302174.ferozo.com",
      port: 465,
      secure: true, // true para 465
      auth: {
        user: "contacto@lorem-insights.com",
        pass: "/5sM0Hat", // Usa variables de entorno para mayor seguridad
      },
    });

    // Envío del correo
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado exitosamente.");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};

module.exports = { sendSuccessEmail };
