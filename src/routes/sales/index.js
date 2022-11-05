/* api/sale */
const {Router} = require("express");
const { createSale } = require("../../controllers/sale");
const { validateJWT } = require("../../middleware/validateJWT");

const router = Router();

router.post("/",[validateJWT], createSale)

module.exports = router