const joi = require("joi");

const createUserSchema = joi.object({
  name: joi.string().required(),
  lastName: joi.string().required(),
  password: joi.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required(),
});

module.exports = {
  createUserSchema,
};
