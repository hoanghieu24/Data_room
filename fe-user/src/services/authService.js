import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL_DEPLOY || "https://dataroom-production-2571.up.railway.app/api";

export const login = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, data);
  return res.data;
};
