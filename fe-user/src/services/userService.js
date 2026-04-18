import axiosClient from "./axiosClient";


export const getUsers = async () => {
  try {
    const res = await axiosClient.get("users/admin");
    return res.data.users || [];
  } catch (err) {
    console.error("getUsers error:", err);
    throw new Error("Không thể tải danh sách user");
  }
};


export const createUser = async (userData) => {
  try {
    const res = await axiosClient.post("auth/register", userData);
    return res.data;
  } catch (err) {
    console.error("createUser error:", err);
    throw new Error(err.response?.data?.msg || "Không thể tạo user");
  }
};


export const updateUser = async (userId, userData) => {
  try {

    const res = await axiosClient.put(`users/admin/${userId}`, userData);
    return res.data;
  } catch (err) {
    console.error("updateUser error:", err);
    throw new Error(err.response?.data?.msg || "Không thể cập nhật user");
  }
};


export const deleteUser = async (userId) => {
  try {

    const res = await axiosClient.delete(`api/users/${userId}`);
    return res.data;
  } catch (err) {
    console.error("deleteUser error:", err);
    throw new Error(err.response?.data?.msg || "Không thể xóa user");
  }
};


export const toggleUserStatus = async (userId, currentStatus) => {
  try {

    const res = await axiosClient.put(`auth/admin/users/${userId}/status`, {
      isActive: !currentStatus
    });
    return res.data;
  } catch (err) {
    console.error("toggleUserStatus error:", err);
    throw new Error(err.response?.data?.msg || "Không thể thay đổi trạng thái user");
  }
};