import axiosClient from "./axiosClient";

export const getDocuments = async () => {
  try {
    const res = await axiosClient.get("/documents");
    return res.data.documents || [];
  } catch (err) {
    console.error("getDocuments error:", err);
    throw new Error("Không thể tải danh sách tài liệu");
  }
};

export const getFolders = async () => {
  try {
    const response = await axiosClient.get("/folders");
    return response.data.data || [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể lấy danh sách thư mục"
    );
  }
};

export const getDocumentById = async (id) => {
  try {
    const res = await axiosClient.get(`/documents/${id}`);
    return res.data.document || null;
  } catch (err) {
    console.error("getDocumentById error:", err);
    throw new Error("Không thể tải thông tin tài liệu");
  }
};

export const createDocument = async (documentData) => {
  try {
    const res = await axiosClient.post("/documents", documentData);
    return res.data.document || res.data;
  } catch (err) {
    console.error("createDocument error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể tạo tài liệu mới"
    );
  }
};

export const updateDocument = async (id, documentData) => {
  try {
    const res = await axiosClient.put(`/documents/${id}`, documentData);
    return res.data.document || res.data;
  } catch (err) {
    console.error("updateDocument error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể cập nhật tài liệu"
    );
  }
};

export const deleteDocument = async (id) => {
  try {
    const res = await axiosClient.delete(`/documents/${id}`);
    return {
      id,
      ...res.data,
    };
  } catch (err) {
    console.error("deleteDocument error:", err);
    throw new Error(err.response?.data?.message || "Không thể xóa tài liệu");
  }
};

export const downloadDocument = async (id, password = "") => {
  try {
    const token = localStorage.getItem("token");

    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (password) {
      headers["X-Document-Password"] = password;
    }

    const res = await axiosClient.get(`/documents/${id}/download`, {
      responseType: "blob",
      headers,
    });

    return res.data;
  } catch (err) {
    let code;
    let msg = "Không thể tải tài liệu";

    const data = err.response?.data;

    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text);
        code = parsed.code;
        msg = parsed.message || msg;
      } catch (parseError) {
        console.error("Không parse được lỗi blob:", parseError);
      }
    } else if (data) {
      code = data.code;
      msg = data.message || msg;
    }

    const error = new Error(msg);
    error.code = code;
    throw error;
  }
};

export const uploadDocumentFile = async (
  file,
  folderId = null,
  accessLevel = "restricted",
  accessPassword = ""
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("allowed_roles", JSON.stringify(["ADMIN"]));
    formData.append("access_level", accessLevel);

    if (accessPassword) {
      formData.append("access_password", accessPassword);
    }

    if (folderId) {
      formData.append("folder_id", folderId);
    }

    const token = localStorage.getItem("token");

    const res = await axiosClient.post("/documents", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data.document || res.data;
  } catch (err) {
    console.error("uploadDocumentFile error:", err);
    throw new Error(
      err.response?.data?.message || "Không thể tải lên tài liệu"
    );
  }
};

export const uploadChunk = async (
  chunk,
  chunkIndex,
  totalChunks,
  uploadId,
  fileName,
  folderId,
  totalSize,
  fileType,
  metadata = {},
  onProgress = null,
  signal = null
) => {
  try {
    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkIndex", chunkIndex);
    formData.append("totalChunks", totalChunks);
    formData.append("uploadId", uploadId);
    formData.append("fileName", fileName);
    formData.append("folderId", folderId || "");
    formData.append("totalSize", totalSize);
    formData.append("fileType", fileType);

    if (metadata.name) formData.append("name", metadata.name);
    if (metadata.description)
      formData.append("description", metadata.description);
    if (metadata.access_level)
      formData.append("access_level", metadata.access_level);
    if (metadata.access_password)
      formData.append("access_password", metadata.access_password);
    if (metadata.allowed_roles)
      formData.append("allowed_roles", JSON.stringify(metadata.allowed_roles));
    if (metadata.is_encrypted)
      formData.append("is_encrypted", metadata.is_encrypted);
    if (metadata.expiry_date)
      formData.append("expiry_date", metadata.expiry_date);

    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        onProgress(progressEvent.loaded, progressEvent.total);
      };
    }

    if (signal) {
      config.signal = signal;
    }

    const res = await axiosClient.post("/documents/upload-chunk", formData, config);
    return res.data;
  } catch (err) {
    console.error("uploadChunk error:", err);
    if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
      throw new Error("Upload cancelled");
    }
    throw new Error(err.response?.data?.message || "Không thể upload chunk");
  }
};

export const uploadLargeFile = async (
  file,
  folderId = null,
  metadata = {},
  onProgress = null,
  signal = null,
  chunkSize = 5 * 1024 * 1024
) => {
  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadId = `${Date.now()}_${file.name}_${file.size}`;

  let startChunk = 0;
  try {
    const status = await checkUploadStatus(uploadId);
    if (status.success && status.uploadedChunks && status.uploadedChunks.length > 0) {
      startChunk = Math.max(...status.uploadedChunks) + 1;
    }
  } catch (err) {
    console.log("No existing upload found, starting fresh");
  }

  let uploadedSize = startChunk * chunkSize;
  let lastTime = Date.now();
  let lastUploadedSize = uploadedSize;

  for (let i = startChunk; i < totalChunks; i++) {
    if (signal?.aborted) {
      throw new Error("Upload cancelled");
    }

    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const result = await uploadChunk(
      chunk,
      i,
      totalChunks,
      uploadId,
      file.name,
      folderId,
      file.size,
      file.type,
      metadata,
      (loaded) => {
        const totalUploaded = uploadedSize + loaded;
        const percent = (totalUploaded / file.size) * 100;

        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000;
        const sizeDiff = totalUploaded - lastUploadedSize;
        const speed = timeDiff > 0 ? sizeDiff / 1024 / timeDiff : 0;

        if (timeDiff >= 0.5) {
          lastUploadedSize = totalUploaded;
          lastTime = now;
        }

        if (onProgress) {
          onProgress(percent, speed, i + 1, totalChunks);
        }
      },
      signal
    );

    uploadedSize += chunk.size;

    if (result.data || i === totalChunks - 1) {
      localStorage.removeItem(`upload_${uploadId}`);
      return result.data || result;
    }

    localStorage.setItem(
      `upload_${uploadId}`,
      JSON.stringify({
        uploadedChunks: i + 1,
        totalChunks,
        uploadId,
        fileName: file.name,
        fileSize: file.size,
        folderId,
        metadata,
      })
    );
  }

  throw new Error("Upload completed but no response received");
};

export const resumeUpload = async (uploadId) => {
  try {
    const res = await axiosClient.get(`/documents/resume-upload/${uploadId}`);
    return res.data;
  } catch (err) {
    console.error("resumeUpload error:", err);
    throw new Error("Không thể resume upload");
  }
};

export const cancelUpload = async (uploadId) => {
  try {
    const res = await axiosClient.delete(`/documents/cancel-upload/${uploadId}`);
    localStorage.removeItem(`upload_${uploadId}`);
    return res.data;
  } catch (err) {
    console.error("cancelUpload error:", err);
    throw new Error("Không thể hủy upload");
  }
};

export const checkUploadStatus = async (uploadId) => {
  try {
    const res = await axiosClient.get(`/documents/upload-status/${uploadId}`);
    return res.data;
  } catch (err) {
    console.error("checkUploadStatus error:", err);
    return { success: false, uploadedChunks: [] };
  }
};

export const getPendingUploads = () => {
  const pendingUploads = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("upload_")) {
      try {
        const upload = JSON.parse(localStorage.getItem(key));
        pendingUploads.push(upload);
      } catch (e) {
        console.error("Error parsing pending upload:", e);
      }
    }
  }
  return pendingUploads;
};

export const clearPendingUpload = (uploadId) => {
  localStorage.removeItem(`upload_${uploadId}`);
};

export const updateDocumentAccess = async (id, accessData) => {
  try {
    const res = await axiosClient.put(`/documents/${id}/access`, accessData);
    return res.data.document || res.data;
  } catch (err) {
    console.error("updateDocumentAccess error:", err);
    throw new Error("Không thể cập nhật quyền truy cập");
  }
};

export const toggleDocumentStatus = async (id, isActive) => {
  try {
    const res = await axiosClient.put(`/documents/${id}/status`, {
      is_active: isActive,
    });
    return res.data.document || res.data;
  } catch (err) {
    console.error("toggleDocumentStatus error:", err);
    throw new Error("Không thể thay đổi trạng thái tài liệu");
  }
};

export const incrementViewCount = async (id) => {
  try {
    const res = await axiosClient.put(`/documents/${id}/view`);
    return res.data;
  } catch (err) {
    console.error("incrementViewCount error:", err);
    throw new Error("Không thể cập nhật lượt xem");
  }
};

export const getDocumentStatistics = async () => {
  try {
    const res = await axiosClient.get("/documents/statistics");
    return res.data.statistics || {};
  } catch (err) {
    console.error("getDocumentStatistics error:", err);
    try {
      const docsRes = await axiosClient.get("/documents");
      const docs = docsRes.data.documents || [];
      return {
        total: docs.length,
        pdfCount: docs.filter((d) => d.file_type === "pdf").length,
        excelCount: docs.filter(
          (d) => d.file_type === "xlsx" || d.file_type === "xls"
        ).length,
        totalSize: docs.reduce((sum, doc) => sum + (doc.file_size || 0), 0),
        totalDownloads: docs.reduce(
          (sum, doc) => sum + (doc.download_count || 0),
          0
        ),
      };
    } catch {
      throw new Error("Không thể tải thống kê tài liệu");
    }
  }
};

export const getDocumentHistory = async (id, limit = 50) => {
  try {
    const res = await axiosClient.get(`/documents/${id}/history`, {
      params: { limit },
    });
    return res.data;
  } catch (err) {
    console.error("getDocumentHistory error:", err);
    throw new Error("Không thể tải lịch sử tài liệu");
  }
};

export const getAllLogs = async (limit = 100, action = null, userId = null) => {
  try {
    const params = { limit };
    if (action) params.action = action;
    if (userId) params.userId = userId;
    const res = await axiosClient.get("/documents/logs/all", { params });
    return res.data;
  } catch (err) {
    console.error("getAllLogs error:", err);
    throw new Error("Không thể tải logs");
  }
};

export const getLogStatistics = async () => {
  try {
    const res = await axiosClient.get("/documents/logs/statistics");
    return res.data.statistics;
  } catch (err) {
    console.error("getLogStatistics error:", err);
    throw new Error("Không thể tải thống kê logs");
  }
};