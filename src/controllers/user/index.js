const { v4: uuid } = require("uuid");
const moment = require("moment");
const bcript = require("bcryptjs");
const path = require("path");

const User = require("./../../models/user");
const { generatejWT } = require("../../helpers/auth");

const createUser = async (req, res) => {
  const { body } = req;
  const file = req.files.avatar;
  const splitName = file.name.split(".");
  const fileExtension = splitName[splitName.length - 1];
  const fileName = `${uuid()}.${fileExtension}`;
  const filePath =
    path.join(__dirname, "../../public/uploads/users/") + fileName;

  try {
    const targetUser = await User.find({ email: body.email });
    console.log("user", targetUser);
    if (targetUser.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "El email ya se encuentra registrado",
      });
    }
  } catch (error) {
    console.log("error");
  }
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
    const salt = bcript.genSaltSync();
    user.password = bcript.hashSync(body.password, salt);
    const token = await generatejWT(user.id);
    const {password, ...rest} = user
    await user.save();
    res.json({
      ok: true,
      user: rest,
      token: token,
    });
  } catch (error) {
    console.log("error en la creación de usuario", error);
    return res.status(500).json({
      ok: false,
      message: "error al guardar el usuario",
    });
  }
};
const getUsers = async (req, res) => {
  const { query } = req;
  if (!query.maxDate && query.minDate) {
    return res.status(404).json({
      ok: false,
      message: "La fecha máxima es requerida",
    });
  }
  if (!query.minDate && query.maxDate) {
    return res.status(404).json({
      ok: false,
      message: "La fecha minima es requerida",
    });
  }

  if (query.minDate && !moment(query.minDate, "YYYY/MM/DD").isValid()) {
    return res.status(404).json({
      ok: false,
      message: "La fecha minima no es valida",
    });
  }
  if (query.maxDate && !moment(query.maxDate, "YYYY/MM/DD").isValid()) {
    return res.status(404).json({
      ok: false,
      message: "La fecha máxima no es valida",
    });
  }
  const regex = new RegExp(req.query.search, "i");
  const page = query.page || 0;
  const search = query.search ? { name: regex, email: regex } : {};

  const maxDate = query.maxDate
    ? { $lte: new Date(new Date(query.maxDate).setHours(23, 59)) }
    : {};
  const minDate = query.minDate ? { $gte: new Date(query.minDate) } : {};
  const dateQuery = { createdAt: { ...maxDate, ...minDate } };
  console.log("date query", dateQuery);
  const [users, total] = await Promise.all([
    User.find({ ...search, ...dateQuery }),
    User.find({ ...search, ...dateQuery }).count(),
  ]);

  res.status(200).json({
    ok: true,
    users,
    total,
  });
};
module.exports = {
  createUser,
  getUsers,
};
