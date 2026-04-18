import axiosClient from "./axiosClient";

export const getRoles = async () => {
  try {
    const res = await axiosClient.get("role");
    return res.data.roles || [];
  } catch (err) {
    console.error("getRoles error:", err);
    throw new Error("Không thể tải danh sách role");
  }
};

// Update role của user
export const updateUserRole = async (userId, roleCode) => {
  try {
    const res = await axiosClient.put(`users/${userId}/role`, { role_code: roleCode });
    return res.data;
  } catch (err) {
    console.error("updateUserRole error:", err);
    throw new Error("Cập nhật role thất bại");
  }
};
