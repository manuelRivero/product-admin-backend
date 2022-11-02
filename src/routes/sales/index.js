/* api/sale */
const {Router} = require("express");
const { createSale } = require("../../controllers/sale");

const router = Router();

router.post("/", createSale)

module.exports = router