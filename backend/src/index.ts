// setup the environment variable
import PgSession from "connect-pg-simple";
import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import session from "express-session";
import logger from "node-color-log";
import nodemailer from "nodemailer";
import { Pool } from "pg";
import { AppDataSource } from "./data-source";
import { errorHandler, logErrors } from "./exceptions";
import { jwtAuthentication } from "./middleware/authentications";
import router from "./routes";
import { Settings } from "./settings";
import { app, httpsServer } from "./socket";
import upload from "./utils/multerConfig";

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
     * create email
     */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
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
     * parse multipart/form-data
     */
    app.use((req, res, next) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        upload.any()(req, res, next); // Adjust based on your file field name
      } else {
        next(); // Skip Multer for other methods
      }
    });
    /**
     * connect the json parser
     */
    app.use(express.json());
    /**
     * parse form-data encoded
     */
    // app.use(upload.any());
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
      logger
        .color("yellow")
        .log("|||||||||||||||||||||||||||||||||||||||||||||||||||");
      logger.color("yellow").log("the current request is ", req.url);
      logger.color("blue").log("the current request user role is ", req.user);
      logger
        .color("yellow")
        .log("|||||||||||||||||||||||||||||||||||||||||||||||||||");
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
    httpsServer.listen(Settings.PORT, Settings.HOST, () => {
      console.log(
        `server is running on port 3000, visit on http://${Settings.HOST}:${Settings.PORT}`
      );
    });
  })
  .catch((error) => console.log(error));
