/* api/sale */
const { Router } = require("express");
const { createSale, getSales, totalByDate, dailySales, getMonthlySales, changeSaleStatus } = require("../../controllers/sale");
const { validateJWT } = require("../../middleware/validateJWT");

const router = Router();

router.post("/", [validateJWT], createSale);
router.put("/edit", [validateJWT], changeSaleStatus.check, changeSaleStatus.do);
router.get("/", [validateJWT], getSales);
router.get("/dailySales", [validateJWT], dailySales.do);
router.get("/monthlySales", [validateJWT], getMonthlySales);

module.exports = router;
