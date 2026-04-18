import axiosClient from "./axiosClient";

// helper bóc data
const unwrap = (res) => {
  return res?.data?.data?.data || [];
};

// CATEGORY
export const getCategories = async () => {
  const res = await axiosClient.get("/categories");
  return unwrap(res);
};

export const createCategory = async (data) => {
  const res = await axiosClient.post("/categories", data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axiosClient.delete(`/categories/${id}`);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await axiosClient.put(`/categories/${id}`, data);
  return res.data;
};

// CATEGORY TYPES
export const getCategoryTypes = async () => {
  const res = await axiosClient.get("/categories/types");
  return res?.data?.data || res?.data || [];
};