import axiosClient from "./axiosClient";


export const getEmployees = async () => {
  try {
    const res = await axiosClient.get("staffmanager");
    
    return res.data.data || [];
  } catch (err) {
    console.error("getEmployees error:", err);
    throw new Error("Không thể tải danh sách nhân viên");
  }
};


export const getEmployeeById = async (id) => {
  try {
    const res = await axiosClient.get(`staffmanager/${id}`);
    return res.data.data || null;
  } catch (err) {
    console.error("getEmployeeById error:", err);
    throw new Error("Không thể tải thông tin nhân viên");
  }
};


export const createEmployee = async (employeeData) => {
  try {
    const res = await axiosClient.post("staffmanager", employeeData);
    return res.data; 
  } catch (err) {
    console.error("createEmployee error:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể tạo nhân viên");
  }
};


export const updateEmployee = async (id, employeeData) => {
  try {
    const res = await axiosClient.put(`staffmanager/${id}`, employeeData);
    return res.data; 
  } catch (err) {
    console.error("updateEmployee error:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể cập nhật nhân viên");
  }
};


export const deleteEmployee = async (id) => {
  try {
    const res = await axiosClient.delete(`staffmanager/${id}`);
    return res.data; 
  } catch (err) {
    console.error("deleteEmployee error:", err.response || err);
    throw new Error(err.response?.data?.message || "Không thể xóa nhân viên");
  }
};


export const getEmployeeStats = async () => {
  try {
    const res = await axiosClient.get("staffmanager");
    return res.data.data || null;
  } catch (err) {
    console.error("getEmployeeStats error:", err);
    throw new Error("Không thể tải thống kê nhân viên");
  }
};


export const getEmployeeOptions = async () => {
  try {
    const res = await axiosClient.get("/staffmanager");
    return res.data.data || {
      departments: [],
      positions: [],
      contractTypes: ["Full-time", "Part-time", "Intern", "Contract"],
      employmentStatuses: ["Đang làm việc", "Thử việc", "Nghỉ phép", "Nghỉ việc"]
    };
  } catch (err) {
    console.error("getEmployeeOptions error:", err);
  
    return {
      departments: [],
      positions: [],
      contractTypes: ["Full-time", "Part-time", "Intern", "Contract"],
      employmentStatuses: ["Đang làm việc", "Thử việc", "Nghỉ phép", "Nghỉ việc"]
    };
  }
};


export const getManagers = async () => {
  try {
    const res = await axiosClient.get("staffmanager", {
      params: { limit: 100, active_only: true }
    });
    return res.data.data?.filter(emp => emp.id) || [];
  } catch (err) {
    console.error("getManagers error:", err);
    return [];
  }
};