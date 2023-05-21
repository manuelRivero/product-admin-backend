const socketEvents = require("./socket/index.js");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const http = require("http");

require("dotenv").config();

const { dbConnection } = require("./db");

const app = express();

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
  fileUpload({
    useTempFiles: true,
    preserveExtension: true,
    createParentPath: true,
  })
);

dbConnection();

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/sale", require("./routes/sales"));
app.use("/api/user", require("./routes/users"));
app.use("/api/notifications", require("./notifications/route"));

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
socketEvents(io);
httpServer.listen(5000, () => {
  console.log("server running on port 5000");
});
