/* api/sale */
const { Router } = require("express");
const { createSale, getSales, totalByDate } = require("../../controllers/sale");
const { validateJWT } = require("../../middleware/validateJWT");

const router = Router();

router.post("/", [validateJWT], createSale);
router.get("/", [validateJWT], getSales);
router.get("/byDate", [validateJWT], totalByDate.do);

module.exports = router;
