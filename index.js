const express = require("express");
const cors = require("cors");
const { dbConnection } = require("./src/db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
dbConnection();

app.use("/api/products", require("./src/routes/products"));

app.listen(5000, () => {
  console.log("server running on port 5000");
});
