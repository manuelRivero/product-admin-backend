/*api/products*/

const { Router } = require("express");
const router = Router();

// controllers
const {
  createProduct, getProducts,
} = require("../../controllers/products");

// validation
const schemaValidation = require("../../middleware/joiValidation");

// schemas
const { createProductSchema } = require("./../../schemas/products");

// routes
router.get("/", getProducts);
router.post("/", [schemaValidation(createProductSchema)], createProduct);

module.exports = router;
