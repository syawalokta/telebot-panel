import axios from "axios";
import config from "../config.js";

const api = axios.create({
  baseURL: `${config.PANEL_URL}/api/application`,
  timeout: 15_000,
  headers: {
    Authorization: `Bearer ${config.APPLICATION_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "Application/vnd.pterodactyl.v1+json"
  }
});

/**
 * Normalisasi error response Pterodactyl
 */
api.interceptors.response.use(
  res => res,
  error => {
    const msg =
      error?.response?.data?.errors?.[0]?.detail ||
      error?.response?.data?.error ||
      error.message ||
      "Unknown API Error";

    return Promise.reject(new Error(msg));
  }
);

export default api;