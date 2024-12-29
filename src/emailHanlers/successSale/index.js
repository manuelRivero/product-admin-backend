const nodemailer = require("nodemailer");
const fs = require("fs");
const util = require("util");
const path = require("path");
const url = require("url");
const handlebars = require("handlebars");

// Convertir import.meta.url a __dirname
const __filename = require.main.filename;
const __dirname = path.dirname(__filename)

// Convertir readFile a promesa
const readFileAsync = util.promisify(fs.readFile);

const sendSuccessEmail = async ({
  products,
  names,
  user,
  tenant,
  total,
  payment_id,
}) => {
  try {
    // Leer y compilar la plantilla del correo
    const templateFile = await readFileAsync(
      path.resolve(__dirname, "../../templates/success-email.html"),
      "utf-8"
    );
    const template = handlebars.compile(templateFile);

    // Reemplazar los valores dinámicos en la plantilla
    const replacements = { products, names, user, tenant, total, payment_id };
    const finalHtml = template(replacements);

    // Configurar opciones del correo
    const mailOptions = {
      from: "contacto@lorem-insights.com",
      to: user.email, // Enviar al correo del usuario
      subject: "¡Confirmación de tu compra!",
      html: finalHtml,
    };

    // Configurar el transporte de Nodemailer
    const transporter = nodemailer.createTransport({
      host: "c2302174.ferozo.com",
      port: 465,
      secure: true, // true para 465, false para otros puertos
      auth: {
        user: "contacto@lorem-insights.com",
        pass: "/5sM0Hat", // Asegúrate de mantener esto seguro
      },
    });

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado exitosamente a ${user.email}`);
  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
    throw new Error("No se pudo enviar el correo. Inténtalo más tarde.");
  }
};

module.exports = { sendSuccessEmail };
