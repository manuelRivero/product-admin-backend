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

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://ecommerce-front-rr7v.onrender.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin "Origin" (como las hechas desde Postman o en el mismo servidor)
    if (!origin) {
      return callback(null, true);
    }

    // Permitir orígenes explícitos y subdominios dinámicos de localhost
    const regex = /^http:\/\/[0-9A-Za-z]+\.localhost:3000$/;
    if (allowedOrigins.includes(origin) || regex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

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
