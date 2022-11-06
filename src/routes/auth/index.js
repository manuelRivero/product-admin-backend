const {Router} = require("express");
const { login, adminLogin } = require("../../controllers/auth");

const router = Router();


router.post('/', login)
router.post('/admin', adminLogin)

module.exports = router