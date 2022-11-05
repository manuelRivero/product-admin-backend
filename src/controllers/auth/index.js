const User = require("./../../models/user");
const bcript = require("bcryptjs");
const { generatejWT } = require("./../../helpers/auth");

const login = async (req, res) => {
  const { email, password } = req.body;

  const targetUser = await User.find(email);
  if (!targetUser) {
    res.status(404).json({
      ok: false,
      message: "Credenciales invalidas",
    });
  }
  if (!bcript.compareSync(targetUser.password, password)) {
    res.status(404).json({
      ok: false,
      message: "Credenciales invalidas",
    });
  }

  const token = await generatejWT(targetUser.id);
  res.status(200).json({
    ok: true,
    token,
  });
};

module.exports = {
  login,
};
