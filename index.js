const express = require("express");
require('dotenv').config()

const app = express();


app.listen(5000, () => {
    console.log("server running on port 5000");
  });
  