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

  const token = await generatejWT(targetUser.id, targetUser.role);
  res.status(200).json({
    ok: true,
    token,
    role: targetUser.role
  });
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  const targetUser = await User.findOne({email}).lean();
  if (!targetUser) {
    return res.status(404).json({
      ok: false,
      message: "Credenciales invalidas",
    });
  }

  if(targetUser.role === "admin"){
    
    if (!bcript.compareSync(password, targetUser.password )) {
      return res.status(404).json({
        ok: false,
        message: "Credenciales invalidas",
      });
    }
  console.log('user', targetUser)
    const token = await generatejWT(targetUser.id, targetUser.role, targetUser.tenant);
    res.status(200).json({
      ok: true,
      token,
      role: targetUser.role
    });

  }else{
    res.status(400).json({
      ok:false,
      message:"Credenciales invalidas"
    })
  }
};

module.exports = {
  login,
  adminLogin
};
