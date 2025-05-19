import path from "path";

export namespace Settings {
  export const PORT = 4000;
  export const HOST = "0.0.0.0";
  export const BASE_DIR = path.resolve(".");
  export const CROSS_ORIGIN_URLS = [
    "http://localhost:5173",
    "http://gc-family.com:5173",
    "http://gc-family.example.com:5173",
    "http://10.14.26.250:5173",
    "http://10.14.26.244:5173",  ];
  export const SECRET_KEY =
    "typescript-insecure-6!8f!)v8tbd)qz6*q$kie4)sm6o-d%plfidf&+ekophm2ddok&";
  export const SALT = 10;
  export const LOGIN_REDIRECT_URL = "/";
  export const LOGOUT_REDIRECT_URL = "/";

  export const SITE_ID = 1; // site id
  export const SITE_URL = "http://127.0.0.1:8000";

  export const ORDERING_PARAM = "sorting";
  export const REST_API = {
    PAGE_SIZE: 40,
  };

  export const DATABASE = {
    TYPE: "postgres",
    HOST: "localhost",
    PORT: 5432,
    USERNAME: "postgres",
    PASSWORD: "meles05",
    SYNCHRONIZE: true,
    DB_NAME: "asmelash",
  };
  export const JWT = {
    REFRESH_TOKEN_SECRET: "refresh-secret-key",
    ACCESS_TOKEN_SECRET: "access-secret-key",
    ALGORITHM: "HS256", // or RS256
    ACCESS_TOKEN_EXPIRES_IN: 24 * 60 * 60 * 7, // 7 days
    REFRESH_TOKEN_EXPIRES_IN: 60 * 60 * 24 * 30, // 30 days
  };

  export const EMAIL_TOKEN_SECRET = "email-secret-key";
  export const EMAIL_TOKEN_EXPIRES_IN = 60 * 60; // 1 hour

  export const STATICFILE_DIR = path.join(BASE_DIR, "public");
  export const STATIC_URL = "/api/v1/static";
  export const THEMOVIEDB_API_KEY = "880d74ffed174cd61b04c182908d9469";
  export const THEMOVIEDB_JWT_ACCESS_TOKEN =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ODBkNzRmZmVkMTc0Y2Q2MWIwNGMxODI5MDhkOTQ2OSIsIm5iZiI6MTcyODMwNzgwMS4wNjE3NDYsInN1YiI6IjY3MDIyN2I0MTU5MmVmMWJhOTg1NzVjMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.YBozFuQR99b2G6CIHD04nRBBjKR8A2CXbloRdrevHio";
  export const TIMEZONE = "Africa/Addis_Ababa";
  export const SSL_CONFIG = {
    keyFile: path.join(BASE_DIR, "cert", "key.pem"),
    certFile: path.join(BASE_DIR, "cert", "cert.pem"),
  };
}
