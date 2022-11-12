/*api/products*/

const { Router } = require("express");
const router = Router();

// controllers
const {
  createProduct, getProducts, likeProduct,
} = require("../../controllers/products");

// validation
const schemaValidation = require("../../middleware/joiValidation");
const { validateJWT } = require("../../middleware/validateJWT");

// schemas
const { createProductSchema } = require("./../../schemas/products");

// routes
router.get("/", getProducts);
router.post("/", [schemaValidation(createProductSchema)], createProduct);
router.post("/like/:id", [validateJWT], likeProduct.check, likeProduct.do);

module.exports = router;
