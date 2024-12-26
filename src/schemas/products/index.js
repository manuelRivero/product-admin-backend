const joi = require("joi");

const createProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required().integer(),
  description: joi.string().required(),
  stock: joi.number().required(),
  discount: joi.number()
});

module.exports = {
    createProductSchema
}