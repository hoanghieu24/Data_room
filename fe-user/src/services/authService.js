import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL_DEPLOY || "http://localhost:3000/api";

export const login = async (data) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, data);
  return res.data;
};
