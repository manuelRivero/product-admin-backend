import nodemailer from "nodemailer";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";

const readFileAsync = promisify(fs.readFile);

// Convertir import.meta.url a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendSucessEmail = async ({products, user, tenant, total, payment_id}) => {
  const templateFile = await readFileAsync(
    path.resolve(__dirname, "../../templates/success-email.html"),
    "utf-8"
  );
  const template = handlebars.compile(templateFile);
  const replacements = {products, user, tenant, total};
  const finalHtml = template(replacements);

  const mailOptions = {
    from: "contacto@lorem-insights.com",
    to: "contacto@lorem-insights.com",
    subject: "¡Nuevo mensaje de un usuario!",
    html:finalHtml,
  };

  const transporter = nodemailer.createTransport({
    host: "c2302174.ferozo.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'contacto@lorem-insights.com',
      pass: '/5sM0Hat',
    },
  });

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo enviado`);
  } catch (error) {
    console.error('Error al enviar a error', error);
  }
  
};

