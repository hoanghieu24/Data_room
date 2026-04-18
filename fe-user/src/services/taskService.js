import axiosClient from "./axiosClient";

/* ===== CLEAN DATA (fix undefined 💀) ===== */
const cleanData = (obj) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    newObj[key] = obj[key] === undefined ? null : obj[key];
  });
  return newObj;
};

/* ===== GET ALL TASKS ===== */
export const getTasks = async () => {
  try {
    const res = await axiosClient.get("/tasks");
    return res.data.data || [];
  } catch (err) {
    console.error("getTasks error:", err);
    throw new Error("Không thể tải danh sách task");
  }
};

/* ===== GET TASK BY ID ===== */
export const getTaskById = async (id) => {
  try {
    const res = await axiosClient.get(`/tasks/${id}`);
    return res.data.task || res.data || null;
  } catch (err) {
    console.error("getTaskById error:", err);
    throw new Error("Không thể tải chi tiết task");
  }
};

/* ===== CREATE TASK ===== */
export const createTask = async (taskData) => {
  try {
    console.log("🚀 Creating task:", taskData);

    const res = await axiosClient.post(
      "/tasks",
      cleanData(taskData)
    );

    console.log("✅ Create response:", res.data);

    return res.data.task || res.data;
  } catch (err) {
    console.error("❌ createTask error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể tạo task"
    );
  }
};

/* ===== UPDATE TASK ===== */
export const updateTask = async (id, taskData) => {
  try {
    console.log("🛠 Updating task ID:", id, taskData);

    const res = await axiosClient.put(
      `/tasks/${id}`,
      cleanData(taskData)
    );

    console.log("✅ Update response:", res.data);

    return res.data.task || res.data;
  } catch (err) {
    console.error("❌ updateTask error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể cập nhật task"
    );
  }
};

/* ===== DELETE TASK ===== */
export const deleteTask = async (id) => {
  try {
    console.log("🗑 Deleting task ID:", id);

    const res = await axiosClient.delete(`/tasks/${id}`);

    console.log("✅ Delete response:", res.data);

    return {
      id,
      ...res.data,
    };
  } catch (err) {
    console.error("❌ deleteTask error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể xóa task"
    );
  }
};