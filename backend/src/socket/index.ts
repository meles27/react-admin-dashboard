import { Settings } from "@/settings";
import { generateCertificates } from "@/utils/generate_cert";
import express from "express";
import fs from "fs";
import { createServer } from "https";
import { Server } from "socket.io";
/**
 * Generates SSL certificates using mkcert
 */
const certificate = generateCertificates(Settings.SSL_CONFIG);
/**
 * Creates an HTTPS server
 */
const serverOptions = {
  key: fs.readFileSync(certificate.keyPath),
  cert: fs.readFileSync(certificate.certPath),
};

console.log(serverOptions);
const app = express();
const httpsServer = createServer(serverOptions, app);
const io = new Server(httpsServer, {
  cors: {
    origin: Settings.CROSS_ORIGIN_URLS,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("a user connected with socket id: ", socket.id);

  socket.on("disconnect", () => {
    console.log("a user disconnected with socket id: ", socket.id);
  });
});

export { app, httpsServer, io };

// import express from "express";
// import { createServer } from "http";
// import logger from "node-color-log";
// import { Server } from "socket.io";

// const app = express();
// const httpsServer = createServer(app);
// const io = new Server(httpsServer, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://localhost:5173",
//       "http://10.14.26.252:5173",
//     ], // Frontend URL
//     methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "OPTIONS", "DELETE"],
//     credentials: true,
//   },
//   transports: ["websocket", "polling"],
// });

// io.on("connection", (socket) => {
//   logger.color("yellow").log("a user connected with socket id: ", socket.id);
//   socket.emit("hello", "wellcome to the gc-family site");
//   socket.on("disconnect", () => {
//     logger.color("red").log("a user disconnected with socket id: ", socket.id);
//   });
// });

// export { app, httpsServer, io };
