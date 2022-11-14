/* api/sale */
const { Router } = require("express");
const { createSale, getSales, totalByDate, dailySales } = require("../../controllers/sale");
const { validateJWT } = require("../../middleware/validateJWT");

const router = Router();

router.post("/", [validateJWT], createSale);
router.get("/", [validateJWT], getSales);
router.get("/byDate", [validateJWT], totalByDate.do);
router.get("/dailySales", [validateJWT], dailySales.do);

module.exports = router;
