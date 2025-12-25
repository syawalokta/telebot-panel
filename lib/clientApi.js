import axios from "axios";
import config from "../config.js";

const clientApi = axios.create({
  baseURL: `${config.PANEL_URL}/api/client`,
  headers: {
    Authorization: `Bearer ${config.CLIENT_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "Application/vnd.pterodactyl.v1+json"
  }
});

export default clientApi;