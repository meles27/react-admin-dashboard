import { CertificateConfig } from "@/utils/generate_cert";
import dotenv from "dotenv";
import logger from "node-color-log";
import path from "path";
dotenv.config();

logger.color("yellow").log("process.env", process.env);
export namespace Settings {
  export const PORT = parseInt(process.env.INVENTORY_PORT) || 3000;
  export const HOST = process.env.INVENTORY_HOST || "localhost";
  export const BASE_DIR = path.resolve(".");
  export const CROSS_ORIGIN_URLS =
    process.env.CROSS_ORIGIN_URLS?.split(",").map((url) => url.trim()) || [];

  export const SECRET_KEY =
    "typescript-insecure-6!8f!)v8tbd)qz6*q$kie4)sm6o-d%plfidf&+ekophm2ddok&";

  export const SALT = 10;
  export const LOGIN_REDIRECT_URL = "/";
  export const LOGOUT_REDIRECT_URL = "/";

  export const SITE_ID = 1; // site id

  export const ORDERING_PARAM = "sorting";
  export const REST_API = {
    PAGE_SIZE: 40,
  };

  export const DATABASE = {
    HOST: process.env.INVENTORY_DB_HOST || "localhost",
    PORT: parseInt(process.env.INVENTORY_DB_PORT) || 5432,
    USERNAME: process.env.INVENTORY_DB_USER || "postgres",
    PASSWORD: process.env.INVENTORY_DB_PASSWORD || "postgres",
    SYNCHRONIZE: true,
    DB_NAME: process.env.INVENTORY_DB_NAME || "inventory",
  };
  export const JWT = {
    REFRESH_TOKEN_SECRET:
      "eyJhdWQiOiI4ODBkNzRmZmVkMTc0Y2Q2MWIwNGMxODI5MDhkOTQ2OSIsIm5iZiI6MTcyODMwNzgwMS4wNjE3NDYsInN1YiI6IjY3MDIyN2I0MTUM",
    ACCESS_TOKEN_SECRET:
      "MWJhOTg1NzVjMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQYBozFuQR99b2G6CIHD04nRBBjKR8A2CXbloRdrevHioAbadcMD",
    ALGORITHM: "HS256", // or RS256
    ACCESS_TOKEN_EXPIRES_IN: 24 * 60 * 60 * 7, // 7 days
    REFRESH_TOKEN_EXPIRES_IN: 60 * 60 * 24 * 30, // 30 days
  };

  export const EMAIL_TOKEN_SECRET = "email-secret-key";
  export const EMAIL_TOKEN_EXPIRES_IN = 60 * 60; // 1 hour
  export const APP_PASSWORD = "pvnr qukn squo zmep";
  export const APP_EMAIL = "ummiesmelimh06@gmail.com";

  export const STATICFILE_DIR = path.join(BASE_DIR, "public");
  export const STATIC_URL = "/api/v1/static";
  export const TIMEZONE = "Africa/Addis_Ababa";
  export const SSL_CONFIG: CertificateConfig = {
    domains: process.env.CERT_DOMAINS?.split(",") || [
      "localhost",
      "127.0.0.1",
      "10.14.26.244",
      "gc-family.com",
      "gc-family.example.com",
      "10.14.26.244",
      "192.168.137.1",
    ],
    certFile: process.env.CERT_FILE || "cert.pem",
    keyFile: process.env.KEY_FILE || "key.pem",
    outputDir: process.env.CERT_DIR || "cert",
  };

  export const MAX_VARIANT_IMAGES = 2;

  export const CLOUDINARY_CONFIG = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    // folder structure
    CLOUDINARY_USER_FOLDER: process.env.CLOUDINARY_USER_FOLDER,
    CLOUDINARY_CATEGORY_FOLDER: process.env.CLOUDINARY_CATEGORY_FOLDER,
    CLOUDINARY_PRODUCT_FOLDER: process.env.CLOUDINARY_PRODUCT_FOLDER,
    CLOUDINARY_VARIANT_FOLDER: process.env.CLOUDINARY_VARIANT_FOLDER,
  };
}
