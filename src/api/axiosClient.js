import axios from "axios";

const rawBase = import.meta.env.VITE_BACKEND_URL || "/";
const normalizedBase = rawBase.endsWith("/")
  ? rawBase.slice(0, -1)
  : rawBase;

const axiosClient = axios.create({
  baseURL: `${normalizedBase}/api`,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
