import axiosClient from "./axiosClient";

export const getCustomers = async () => {
  const res = await axiosClient.get("/customer");
  return res.data; // { success, data }
};

export const createCustomer = (data) =>
  axiosClient.post("/customer", data);

export const deleteCustomer = (id) =>
  axiosClient.delete(`/customer/${id}`);

export const deleteCustomers = (ids) =>
  axiosClient.delete("/customer", { data: { ids } });

export const changeStatus = (id) =>
  axiosClient.put(`/customer/change-status/${id}`);

export const changeIsVip = (id) =>
  axiosClient.put(`/customer/change-is-vip/${id}`);

export const updateCustomer = (id, data) =>
  axiosClient.put(`/customer/${id}`, data);
