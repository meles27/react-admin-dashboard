// setup the environment variable
import PgSession from "connect-pg-simple";
import cors from "cors";
// import "dotenv/config";
// import { logger as httpLogger } from "@tinyhttp/logger";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import session from "express-session";
import logger from "node-color-log";

import morgan from "morgan";
import { Pool } from "pg";
import { AppDataSource } from "./data-source";
import { errorHandler, logErrors } from "./exceptions";
import { jwtAuthentication } from "./middleware/authentications";
import { injectCloudinary } from "./middleware/cloudinaryMiddleware";
import router from "./routes";
import { Settings } from "./settings";
import { app, httpsServer } from "./socket";

AppDataSource.initialize()
  .then(async () => {
    console.log("successfully connected to database");
    app.use(
      cors({
        origin: Settings.CROSS_ORIGIN_URLS,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      })
    );
    /**
     * connect the session
     */
    const pgPool = new Pool({
      user: Settings.DATABASE.USERNAME,
      host: Settings.DATABASE.HOST,
      database: Settings.DATABASE.DB_NAME,
      password: Settings.DATABASE.PASSWORD,
      port: Settings.DATABASE.PORT,
    });
    /**
     * http logger
     */
    app.use(morgan("common"));
    /**
     * session database
     */
    app.use(
      session({
        store: new (PgSession(session))({
          pool: pgPool, // Reuse the pg Pool
          tableName: "sessions", // Default is 'sessions'
          createTableIfMissing: true,
        }),
        secret: Settings.SECRET_KEY, // Use a strong secret key
        resave: false, // Avoid resaving unmodified sessions
        saveUninitialized: false, // Don't save empty sessions
        cookie: {
          maxAge: 3600000, // 1 hour
          secure: false, // Set true if using HTTPS
        },
      })
    );
    /**
     * Make cloudinaryService image controllers available on all requests
     */
    app.use(injectCloudinary);
    /**
     * connect the json parser
     */
    app.use(express.json());
    /**
     * urlencoded parser
     */
    app.use(express.urlencoded({ extended: false }));
    /**
     * connect the authentication
     */
    app.use(jwtAuthentication);
    /**
     * connect the logger
     **/
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log("req.files", req.files, req.file);
      logger.color("yellow").log("the current request is ", req.url);
      next();
    });
    /**
     * connect the static files parser
     */
    app.use(Settings.STATIC_URL, express.static(Settings.STATICFILE_DIR));
    /**
     * connect the router
     */
    app.use("/api/v1/", router);
    /**
     * handle not found
     */

    app.use("*", (req, res) => {
      res.status(404).json({
        detail: `${req.originalUrl} not found`,
        path: req.originalUrl,
      });
    });
    /**
     * handle error
     */
    app.use(logErrors);
    app.use(errorHandler);
    /**
     * start server
     */
    httpsServer.listen(
      {
        port: Settings.PORT,
        host: Settings.HOST,
        exlusive: false,
      },
      () => {
        console.log(
          `server is running on port 3000, visit on http://${Settings.HOST}:3000`
        );
      }
    );
    /**
     * Shutdown the server
     */
    process.on("SIGINT", function () {
      // sigint signal received, log a message to the console
      console.log("Shutdown signal intercepted");
      // close the http server
      httpsServer.close();
      // exit the process
      process.exit();
    });
    process.on("SIGTERM", function () {
      // sigint signal received, log a message to the console
      console.log("Shutdown signal intercepted");
      // close the http httpsServer
      httpsServer.close();
      // exit the process
      process.exit();
    });
  })
  .catch((error) => console.log(error));
