const joi = require("joi");

const createProductSchema = joi.object({
  name: joi.string().required(),
  price: joi.number().required().integer(),
  tags: joi.array().required().items(
    joi.object({
      name: joi.string().required(),
    })
  ),
  img: joi.string()
});

module.exports = {
    createProductSchema
}