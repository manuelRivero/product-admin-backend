/* api/user */
const { Router } = require("express");
const router = Router();
//validation
const schemaValidation = require("../../middleware/joiValidation");
const { createUserSchema } = require("./../../schemas/user");
//controllers
const { createUser } = require("../../controllers/user");
const { validateImage } = require("../../services/user");

router.post(
  "/",
  [schemaValidation(createUserSchema), validateImage],
  createUser
);

router.get("/", () => {
  console.log("get");
});

module.exports = router;
