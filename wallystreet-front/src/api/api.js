import axios from "axios";

const api = axios.create({
  baseURL: "http://172.30.58.55:80",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expires_at");

    if (expiresAt && new Date().getTime() > new Date(expiresAt).getTime()) {
      if (config.url !== "/login") {
        window.dispatchEvent(new Event("sesion-expirada"));
        return Promise.reject(new Error("Token expirado localmente"));
      }
    }

    if (token && token !== "null" && token !== "undefined") {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url;
    
    if (error.response && error.response.status === 401) {
      if (url !== "/login" && url !== "/logout") {
        window.dispatchEvent(new Event("sesion-expirada"));
      }
    }
    
    if (!error.response) {
      console.error("El servidor no respondió o hay un problema de red.");
    }
    return Promise.reject(error);
  }
);

export default api;