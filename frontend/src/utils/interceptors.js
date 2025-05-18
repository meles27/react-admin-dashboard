import axios from "axios";
import settings from "../config";

const axiosInstance = axios.create({
  baseURL: settings.baseUrl,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log(
      "the current request is ",
      `${config.baseURL}${config.url ? config.url : ""}${
        config.auth ? config.auth : ""
      }`,
      config.params
    );
    console.log(config.url);
    if (config.url !== "/api/v1/auth/token") {
      const token = localStorage.getItem(settings.JWT_KEY_NAME); // Change as needed
      if (token) {
        const tokenObject = JSON.parse(token);
        config.headers.Authorization = `Bearer ${tokenObject?.access}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default axiosInstance;
