const {Router} = require("express")
const {list }= require("./controller")

const router = Router();

router.get("/", list.do)

module.exports = router