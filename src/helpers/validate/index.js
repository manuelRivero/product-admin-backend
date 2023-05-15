const joi_message_es= {
    "any.required": "Este campo es requerido",
    "string.empty": "Este campo es requerido",
    "number.min": "Este campo debe ser mayor o igual a {#limit}",
    "number.max": "Este campo debe ser menor o igual a {#limit}",
    "string.email": "Email inválido",
}

function validateBody(req, next, schema) {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
    messages: joi_message_es,
  };
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    console.log("validate error", error)
    const errorFormat = { name: "ValidationErrorCustom", errors: {} };

    for (let index in error.details) {
      let x = error.details[index];

      if (x.message.includes("[") && x.message.includes("]"))
        errorFormat.errors[x.path[0]] = x.message
          .replace("[", "")
          .replace("]", "")
          .split("|");
      else errorFormat.errors[x.path[0]] = x.message;
    }
    next(errorFormat);
  } else next();
}

module.exports = {
  validateBody,
};
