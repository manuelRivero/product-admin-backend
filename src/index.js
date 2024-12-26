const socketEvents = require("./socket/index.js");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const http = require("http");
const session = require('express-session');


require("dotenv").config();

const { dbConnection } = require("./db");

const app = express();

const allowedOrigins = [
  /^http:\/\/([a-zA-Z0-9-]+)\.localhost(:[0-9]+)?$/,
  /^https:\/\/([a-zA-Z0-9-]+)\.onrender\.com$/,
];

const corsOptions = {
  origin:allowedOrigins,
  credentials: true,
};

app.use(cors(corsOptions));


app.use(session({
  secret: process.env.SECRETORPRIVATEKEY,
  resave: false,
  saveUninitialized: false,
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({ extended: true }));

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
app.use("/api/tenant", require("./routes/tenant"));

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
socketEvents(io);
httpServer.listen(5000, () => {
  console.log("server running on port 5000");
});
