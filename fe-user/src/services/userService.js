import axiosClient from "./axiosClient";

// Lấy danh sách user
export const getUsers = async () => {
  try {
    const res = await axiosClient.get("/users/admin");
    return res.data.users || res.data || [];
  } catch (err) {
    console.error("getUsers error:", err);
    throw new Error(err.response?.data?.msg || "Không thể tải danh sách user");
  }
};

// Tạo user
export const createUser = async (userData) => {
  try {
    const res = await axiosClient.post("/auth/register", userData);
    return res.data;
  } catch (err) {
    console.error("createUser error:", err);
    throw new Error(err.response?.data?.msg || "Không thể tạo user");
  }
};

// Cập nhật user
export const updateUser = async (userId, userData) => {
  try {
    const res = await axiosClient.put(`/${userId}`, userData);
    return res.data;
  } catch (err) {
    console.error("updateUser error:", err);
    throw new Error(err.response?.data?.msg || "Không thể cập nhật user");
  }
};

// Xóa user
export const deleteUser = async (userId) => {
  try {
    const res = await axiosClient.delete(`/${userId}`);
    return res.data;
  } catch (err) {
    console.error("deleteUser error:", err);
    throw new Error(err.response?.data?.msg || "Không thể xóa user");
  }
};

// Bật/tắt trạng thái user
export const toggleUserStatus = async (userId, currentStatus) => {
  try {
    const res = await axiosClient.put(`/users/${userId}/status`, {
      is_active: !currentStatus,
    });
    return res.data;
  } catch (err) {
    console.error("toggleUserStatus error:", err);
    throw new Error(
      err.response?.data?.msg || "Không thể thay đổi trạng thái user"
    );
  }
};
