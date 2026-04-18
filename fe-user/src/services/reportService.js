import axiosClient from "./axiosClient";

export const getAllReportTemplates = async () => {
  try {
    const res = await axiosClient.get("/reports/templates");
    return res.data.data || res.data || [];
  } catch (err) {
    console.error("getAllReportTemplates error:", err);
    throw new Error(err.response?.data?.message || "Không thể tải danh sách report template");
  }
};

export const getReportTemplateById = async (templateId) => {
  try {
    const res = await axiosClient.get(`/reports/templates/${templateId}`);
    return res.data.data || res.data || null;
  } catch (err) {
    console.error("getReportTemplateById error:", err);
    throw new Error(err.response?.data?.message || "Không thể tải report template");
  }
};

export const createReportTemplate = async (templateData) => {
  try {
    const res = await axiosClient.post("/reports/templates", templateData);
    return res.data;
  } catch (err) {
    console.error("createReportTemplate error:", err);
    throw new Error(err.response?.data?.message || "Không thể tạo report template");
  }
};

export const updateReportTemplate = async (templateId, templateData) => {
  try {
    const res = await axiosClient.put(`/reports/templates/${templateId}`, templateData);
    return res.data;
  } catch (err) {
    console.error("updateReportTemplate error:", err);
    throw new Error(err.response?.data?.message || "Không thể cập nhật report template");
  }
};

export const deleteReportTemplate = async (templateId) => {
  try {
    const res = await axiosClient.delete(`/reports/templates/${templateId}`);
    return res.data;
  } catch (err) {
    console.error("deleteReportTemplate error:", err);
    throw new Error(err.response?.data?.message || "Không thể xóa report template");
  }
};

export const getAllReportRuns = async () => {
  try {
    const res = await axiosClient.get("/reports/runs");
    return res.data.data || res.data || [];
  } catch (err) {
    console.error("getAllReportRuns error:", err);
    throw new Error(err.response?.data?.message || "Không thể tải danh sách report runs");
  }
};

export const getReportRunById = async (runId) => {
  try {
    const res = await axiosClient.get(`/reports/runs/${runId}`);
    return res.data.data || res.data || null;
  } catch (err) {
    console.error("getReportRunById error:", err);
    throw new Error(err.response?.data?.message || "Không thể tải report run");
  }
};

export const createReportRun = async (runData) => {
  try {
    const res = await axiosClient.post("/reports/runs", runData);
    return res.data;
  } catch (err) {
    console.error("createReportRun error:", err);
    throw new Error(err.response?.data?.message || "Không thể tạo report run");
  }
};

export const updateReportRun = async (runId, runData) => {
  try {
    const res = await axiosClient.put(`/reports/runs/${runId}`, runData);
    return res.data;
  } catch (err) {
    console.error("updateReportRun error:", err);
    throw new Error(err.response?.data?.message || "Không thể cập nhật report run");
  }
};

export const deleteReportRun = async (runId) => {
  try {
    const res = await axiosClient.delete(`/reports/runs/${runId}`);
    return res.data;
  } catch (err) {
    console.error("deleteReportRun error:", err);
    throw new Error(err.response?.data?.message || "Không thể xóa report run");
  }
};
