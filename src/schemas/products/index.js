const joi = require("joi");

const createProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.string().required(),
  description: joi.string().required(),
  stock: joi.string(),
  discount: joi.string()
});

module.exports = {
    createProductSchema
}