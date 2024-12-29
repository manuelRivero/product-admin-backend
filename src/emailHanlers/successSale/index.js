import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";

// Convertir import.meta.url a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendSuccessEmail = async ({
  products,
  names,
  user,
  tenant,
  total,
  payment_id,
}) => {
  try {
    // Leer y compilar la plantilla del correo
    const templateFile = await fs.readFile(
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
      to: user.email, // Se envía al email del usuario
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
        pass: "/5sM0Hat", // Asegúrate de mantener esto en un entorno seguro
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
