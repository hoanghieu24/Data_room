import axios from "axios";

export const login = async (data) => {
  const res = await axios.post("/api/auth/login", data);
  return res.data;
};
