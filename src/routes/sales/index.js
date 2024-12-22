/* api/sale */
const { Router } = require("express");
const {
  createSale,
  getSales,
  getSaleDetail,
  dailySales,
  getMonthlySales,
  changeSaleStatus,
  createSaleFromAdmin,
  createSaleByClient,
  saveSaleByNotification,
} = require("../../controllers/sale");
const { validateJWT } = require("../../middleware/validateJWT");

const router = Router();

router.post("/", [validateJWT], createSale.check, createSale.do);
router.get("/detail", [validateJWT], getSaleDetail);
router.post(
  "/from-admin",
  [validateJWT],
  createSaleFromAdmin.check,
  createSaleFromAdmin.do
);

router.put("/edit", [validateJWT], changeSaleStatus.check, changeSaleStatus.do);
router.get("/", [validateJWT], getSales);
router.get("/dailySales", [validateJWT], dailySales.do);
router.get("/monthlySales", [validateJWT], getMonthlySales);
router.post("/create-sale", createSaleByClient.do);
router.post("/save-sale", saveSaleByNotification)

module.exports = router;
