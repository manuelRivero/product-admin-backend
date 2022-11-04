const validateImage = async (req, res, next) => {
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      message: "El archivo es requerido",
    });
  }
  const file = req.files.avatar;
  const splitName = file.name.split(".");
  const fileExtension = splitName[splitName.length - 1];

  const validExtensions = ["jpg", "png", "gif", "jpeg"];

  if (file.size > 5 * 1024 * 1024) {
    return res.status(400).json({
      ok: false,
      message: "Maximo 5mb",
    });
  }
  if (!validExtensions.includes(fileExtension)) {
    return res.status(400).json({
      ok: false,
      message: "El formato del archivo no está soportado",
    });
  } else {
    next();
  }
};

module.exports = {
  validateImage,
};
