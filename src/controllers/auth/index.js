const User = require("./../../models/user");
const bcript = require("bcryptjs");
const { generatejWT } = require("./../../helpers/auth");

const login = async (req, res) => {
  const { email, password } = req.body;

  const targetUser = await User.findOne({email});
  if (!targetUser) {
    return res.status(404).json({
      ok: false,
      message: "Credenciales invalidas",
    });
  }
  
  if (!bcript.compareSync(password, targetUser.password )) {
    return res.status(404).json({
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
