const { v4: uuid } = require("uuid");
const path = require("path");

const User = require("./../../models/user");

const createUser = async (req, res) => {
  const { body } = req;
  const file = req.files.avatar;
  const splitName = file.name.split(".");
  const fileExtension = splitName[splitName.length - 1];
  const fileName = `${uuid()}.${fileExtension}`;
  const filePath =
    path.join(__dirname, "../../public/uploads/users/") + fileName;

  file.mv(filePath, (error) => {
    if (error) {
      return res.status(400).json({
        ok: false,
        message: "error al guardar el archivo",
      });
    }
  });
  try {
    const user = new User({ ...body, avatar: fileName });
    await user.save();
    res.json({
      ok: true,
      user: user,
    });
  } catch (error) {
    console.log("error en la creación de usuario", error);
    return res.status(500).json({
      ok: false,
      message: "error al guardar el usuario",
    });
  }
};

module.exports = {
  createUser,
};
