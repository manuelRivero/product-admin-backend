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
  createProductsImages,
  getProductDetail,
  editProduct,
  generateProductsExcel,
  getProductsWeb,
  getProductsByIds
} = require("../../controllers/products");

// validation
const { validateJWT } = require("../../middleware/validateJWT");

// routes
router.get("/", [validateJWT], getProducts);
router.get("/web", getProductsWeb);
router.get("/get-excel-template", [validateJWT], generateProductsExcel);
router.get("/detail", [validateJWT], getProductDetail.do)
router.get("/detail/web", getProductDetail.do)
router.put("/edit/:id", [validateJWT],editProduct.check, editProduct.do)
router.get("/admin-products", [validateJWT],  getAdminProducts);
router.post("/", [validateJWT],createProduct.check, createProduct.do);
router.post("/like/:id", [validateJWT], likeProduct.check, likeProduct.do);
router.get("/topProducts", [validateJWT], topProducts);
router.get("/get-products-by-id", getProductsByIds.do);
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
