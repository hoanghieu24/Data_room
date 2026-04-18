import axiosClient from "./axiosClient";

export const getAllIntegrations = async () => {
  try {
    const res = await axiosClient.get("/integrations");
    return res.data.data || res.data || [];
  } catch (err) {
    console.error("getAllIntegrations error:", err);
    throw new Error(err.response?.data?.message || "Không thể tải danh sách integrations");
  }
};

export const getIntegrationById = async (integrationId) => {
  try {
    const res = await axiosClient.get(`/integrations/${integrationId}`);
    return res.data.data || res.data || null;
  } catch (err) {
    console.error("getIntegrationById error:", err);
    throw new Error(err.response?.data?.message || "Không thể tải integration");
  }
};

export const createIntegration = async (integrationData) => {
  try {
    const res = await axiosClient.post("/integrations", integrationData);
    return res.data;
  } catch (err) {
    console.error("createIntegration error:", err);
    throw new Error(err.response?.data?.message || "Không thể tạo integration");
  }
};

export const updateIntegration = async (integrationId, integrationData) => {
  try {
    const res = await axiosClient.put(`/integrations/${integrationId}`, integrationData);
    return res.data;
  } catch (err) {
    console.error("updateIntegration error:", err);
    throw new Error(err.response?.data?.message || "Không thể cập nhật integration");
  }
};

export const deleteIntegration = async (integrationId) => {
  try {
    const res = await axiosClient.delete(`/integrations/${integrationId}`);
    return res.data;
  } catch (err) {
    console.error("deleteIntegration error:", err);
    throw new Error(err.response?.data?.message || "Không thể xóa integration");
  }
};
