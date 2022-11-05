const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');

require("dotenv").config();

const { dbConnection } = require("./src/db");

const app = express();

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(fileUpload())


dbConnection();
app.use("/api/auth", require("./src/routes/auth"));

app.use("/api/products", require("./src/routes/products"));
app.use("/api/sale", require("./src/routes/sales"));
app.use("/api/user", require("./src/routes/users"));

app.listen(5000, () => {
  console.log("server running on port 5000");
});
