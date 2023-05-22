/*api/products*/

const { Router } = require("express");
const router = Router();

// controllers
const {
  createProduct,
  getProducts,
  getAdminProducts,
  likeProduct,
  topProducts,
  createProductsFromExcel,
  createProductsImages
} = require("../../controllers/products");

// validation
const { validateJWT } = require("../../middleware/validateJWT");

// routes
router.get("/", getProducts);
router.get("/admin-products", getAdminProducts);
router.post("/", createProduct.check, createProduct.do);
router.post("/like/:id", [validateJWT], likeProduct.check, likeProduct.do);
router.get("/topProducts", [validateJWT], topProducts);
router.post(
  "/productsExcel",
  [validateJWT],
  createProductsFromExcel.check,
  createProductsFromExcel.do
);
router.post(
  "/productsImages",
  [validateJWT],
  createProductsImages.check,
  createProductsImages.do
);

module.exports = router;
