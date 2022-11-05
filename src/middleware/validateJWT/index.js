const jwt = require("jsonwebtoken");

const validateJWT = (req, res, next) => {
    const token = req.header("x-token");
    console.log("token", token)
    if (!token) {
        return res.status(401).json({
        ok: false,
        message: "No hay token en la petición",
        });
    }
    try {
        const { uid, role } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        req.uid = uid;
        req.role = role
        next();
    } catch (error) {
        console.log("error", error)
        return res.status(401).json({
        ok: false,
        message: "Token no válido",
        });
    }
};
module.exports = {
    validateJWT,
}