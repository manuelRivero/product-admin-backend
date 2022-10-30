const express = require("express");
const  cors = require("cors");
require('dotenv').config()

const app = express();
app.use(cors())

app.listen(5000, () => {
    console.log("server running on port 5000");
  });
  