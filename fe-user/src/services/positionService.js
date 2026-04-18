import axiosClient from "./axiosClient";

/* ================= GET ALL ================= */
export const getPositions = async () => {
  try {
    const res = await axiosClient.get("positions");
    return res.data.data || [];
  } catch (err) {
    console.error("getPositions error:", err);
    throw new Error("Không thể tải danh sách positions");
  }
};

/* ================= CREATE ================= */
export const createPosition = async (data) => {
  try {
    const res = await axiosClient.post("positions", data);
    return res.data;
  } catch (err) {
    console.error("createPosition error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể tạo position"
    );
  }
};

/* ================= UPDATE ================= */
export const updatePosition = async (id, data) => {
  try {
    const res = await axiosClient.put(`positions/${id}`, data);
    return res.data;
  } catch (err) {
    console.error("updatePosition error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể cập nhật position"
    );
  }
};

/* ================= DELETE ONE ================= */
export const deletePosition = async (id) => {
  try {
    const res = await axiosClient.delete(`positions/${id}`);
    return res.data;
  } catch (err) {
    console.error("deletePosition error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể xóa position"
    );
  }
};

/* ================= DELETE MANY ================= */
export const deletePositions = async (ids) => {
  try {
    const res = await axiosClient.delete("positions", {
      data: { ids },
    });
    return res.data;
  } catch (err) {
    console.error("deletePositions error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể xóa nhiều position"
    );
  }
};